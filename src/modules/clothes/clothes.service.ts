import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClothesRepository } from './clothes.repository';
import { Clothes } from 'src/entities/clothe.entity';
import { UpdateClothesDto } from './dto/updateClothes.dto';
import { CreateClothesDto } from './dto/createClothes.dto';
import { DeleteClothesDto } from './dto/deleteClothes.dto';
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';
import { BASE_URL, GEMINI_API_KEY } from 'src/configs/env.config';
import * as fs from 'fs';
import * as path from 'path';
import { ClothesAnalysisResult } from './dto/analyzeClothes.dto';
import { PaginationClothesDto } from './dto/paginationClothes,dto';

@Injectable()
export class ClothesService {
  constructor(private readonly clothesRepository: ClothesRepository) {}

  async findById(clothesId: string, userId: string): Promise<Clothes | null> {
    const clothes = await this.clothesRepository.findById(clothesId);

    if (clothes?.user.id != userId) {
      throw new NotFoundException('No matching clothes found!');
    }

    return clothes;
  }

  async findByUser(
    paginationDto: PaginationClothesDto,
    userId: string,
  ): Promise<Clothes[]> {
    const clothes = await this.clothesRepository.findByUser(
      paginationDto,
      userId,
    );
    return clothes;
  }

  async createManyClothes(
    userId: string,
    dtos: CreateClothesDto,
  ): Promise<Clothes[]> {
    const clothesList: Clothes[] = [];

    for (const dto of dtos.clothes) {
      // const schedules = dto.scheduleIds?.length
      //   ? await this.scheduleRepository.findByIds(dto.scheduleIds)
      //   : [];

      // const collections = dto.collectionIds?.length
      //   ? await this.collectionRepository.findByIds(dto.collectionIds)
      //   : [];

      const clothes = await this.clothesRepository.createClothes(userId, dto);

      clothesList.push(clothes);
    }

    return clothesList;
  }

  async updateClothes(
    clothesId: string,
    userId: string,
    dto: UpdateClothesDto,
  ): Promise<Clothes> {
    const updateData = {
      ...dto,
    };

    const clothes = await this.clothesRepository.updateClothes(
      clothesId,
      userId,
      updateData,
    );
    if (!clothes) {
      throw new NotFoundException('Clothes not found');
    }
    return clothes;
  }

  async deleteClothes(userId: string, dto: DeleteClothesDto): Promise<boolean> {
    await this.clothesRepository.deleteClothes(userId, dto);
    return true;
  }

  async clothesAnalyze(
    userId: string,
    images: Array<Express.Multer.File>,
  ): Promise<ClothesAnalysisResult[]> {
    try {
      const tempFilePaths: string[] = [];
      const imageParts = images.map((image) => {
        const filePath = image.path;
        tempFilePaths.push(path.basename(filePath));

        const fileBuffer = fs.readFileSync(image.path);

        return {
          inlineData: {
            mimeType: image.mimetype,
            data: fileBuffer.toString('base64'),
          },
        };
      });

      const clothesCategoryValues = Object.values(ClothesCategory);
      const prompt = `
        Tolong berikan saya deskripsi seluruh pakaian dalam bentuk JSON dari gambar yang berisi:

        clothes: [{
          category: ClothesCategory;
          itemType: string;
          color: string;
        },...]

        DENGAN SYARAT:
        ClothesCategory=${clothesCategoryValues.join(', ')}
        color HARUS berupa SATU warna primernya
        Pastikan output hanya berupa JSON yang valid.
      `;

      type ChatPart =
        | { text: string }
        | { inlineData: { mimeType: string; data: string } };
      type ChatMessage = { role: string; parts: ChatPart[] };

      const chatHistory: ChatMessage[] = [];
      chatHistory.push({
        role: 'user',
        parts: [{ text: prompt }, ...imageParts],
      });

      // Payload untuk generate JSON
      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              clothes: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    category: { type: 'STRING' },
                    itemType: { type: 'STRING' },
                    color: { type: 'STRING' },
                  },
                  required: ['category', 'itemType', 'color'],
                },
              },
            },
            required: ['clothes'],
          },
        },
      };

      const apiKey = GEMINI_API_KEY;
      if (!apiKey) {
        throw new InternalServerErrorException(
          'Gemini API Key not configured.',
        );
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API Error:', errorData);
        throw new InternalServerErrorException(
          'Failed to get analysis from AI. ' + JSON.stringify(errorData),
        );
      }

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson && Array.isArray(parsedJson.clothes)) {
          const analyzedClothes = parsedJson.clothes as ClothesAnalysisResult[];

          const finalResults: ClothesAnalysisResult[] = analyzedClothes.map(
            (clothes, index) => {
              if (tempFilePaths[index]) {
                return {
                  ...clothes,
                  image: `${BASE_URL}/file/${userId}/clothes/${tempFilePaths[index]}`,
                };
              }
              return clothes;
            },
          );

          return finalResults;
        } else {
          throw new InternalServerErrorException(
            'AI response was not in the expected format.',
          );
        }
      } else {
        throw new InternalServerErrorException('No valid response from AI.');
      }
    } catch (error) {
      console.error('Error in analyzeClothes service:', error);

      // Delete Temp Image
      images.map((image) => {
        fs.unlinkSync(image.path);
      });

      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred during clothes analysis.',
      );
    }
  }

  async updateImageClothes(
    clothesId: string,
    image: string,
  ): Promise<{ imagePath: string; clothesId: string }> {
    return this.clothesRepository.updateImageClothes(clothesId, image);
  }
}
