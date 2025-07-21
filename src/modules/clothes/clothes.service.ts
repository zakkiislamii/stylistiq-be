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
import { ClothesStatus } from 'src/contracts/enums/clothesStatus.enum';
import { User } from 'src/entities/user.entity';

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

  async findAllByIds(clothesIds: string[]): Promise<Clothes[]> {
    const clothes = await this.clothesRepository.findAllByIds(clothesIds);
    return clothes;
  }

  async findByUser(
    userId: string,
    paginationDto?: PaginationClothesDto,
    status?: ClothesStatus,
  ): Promise<Clothes[]> {
    const clothes = await this.clothesRepository.findByUser(
      userId,
      paginationDto,
      status,
    );
    return clothes;
  }

  async createManyClothes(
    userId: string,
    dtos: CreateClothesDto,
  ): Promise<Clothes[]> {
    const clothesList: Clothes[] = [];

    for (const dto of dtos.clothes) {
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
          note: string;
        },...]

        DENGAN SYARAT:
        ClothesCategory=${clothesCategoryValues.join(', ')}
        Color HARUS berupa SATU warna primernya!
        Note berupa PENJELASAN SINGKAT dan TEMA YANG COCOK!
        SATU GAMBAR hanya SATU DESKRIPSI saja, JIKA ADA LEBIH DARI SATU PAKAIAN DALAM SATU GAMBAR, PILIH YANG PALING DOMINAN!
        Pastikan output hanya berupa JSON yang valid.

        JAWAB DALAM BAHASA INDONESIA!
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
                    note: { type: 'STRING' },
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

  async matchClothes(
    user: User,
    ownedClothes: any,
    clothesIds: string[],
  ): Promise<string[]> {
    try {
      const clothesToAnalyze =
        await this.clothesRepository.findAllByIds(clothesIds);

      const imageParts = clothesToAnalyze
        .map((cloth) => {
          if (!cloth.image) {
            console.warn(
              `Skipping cloth ID ${cloth.id} due to missing image URL or user ID.`,
            );
            return null;
          }
          const filename = path.basename(cloth.image);
          const filePath = path.join(
            process.cwd(),
            'uploads',
            'private',
            'user',
            cloth.user.id,
            'clothes',
            filename,
          );

          if (!fs.existsSync(filePath)) {
            console.error(`File not found at path: ${filePath}`);
            return null;
          }

          const fileBuffer = fs.readFileSync(filePath);

          const base64Data = fileBuffer.toString('base64');
          const mimeType = this.getMimeTypeFromUrl(cloth.image);

          return {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          };
        })
        .filter((part) => part !== null);

      const clothesCategoryValues = Object.values(ClothesCategory);
      const clothesToAnalyzeValue = JSON.stringify(clothesToAnalyze, null, 2);
      const bodyProfileValue = user.bodyProfile
        ? JSON.stringify(user.bodyProfile, null, 2)
        : 'No Data';
      const ownedClothesValues = JSON.stringify(ownedClothes, null, 2);
      const prompt = `
        BERIKUT DATA BAJU YANG INGIN DICARI PASANGANNYA:
        ${clothesToAnalyzeValue}

        BERIKUT DATA BODY PROFILE USER:
        ${bodyProfileValue}

        BERIKUT DATA BAJU YANG DIMILIKI USER:
        ${ownedClothesValues}

        Tolong berikan saya SATU SET id pakaian-pakaian yang COCOK dan SESUAI UNTUK DIGUNAKAN BERSAMA dengan gambar dan deskripsi pakaian serta profil badan user yang telah diberikan:

        {
          clothesIds: ['id1', 'id2', 'id3', ...]
        }
        
        DENGAN SYARAT:
        ClothesCategory=${clothesCategoryValues.join(', ')}
        Pastikan output hanya berupa JSON yang valid SESUAI KETENTUAN!
        JIKA TIDAK ADA PAKAIAN YANG COCOK, BISA DIKOSONGKAN!
        HASIL JANGAN ADA PAKAIAN YANG ADA DI LIST "DATA BAJU YANG INGIN DICARI PASANGANNYA"
        Pastikan bahwa pakaian yang direkomendasikan merupakan pelengkap yang logis dan cocok secara estetika maupun fungsi dengan pakaian yang telah diberikan pada DATA BAJU YANG INGIN DICARI PASANGANNYA.
        CONTOH: Jika clothesToAnalyzeValue berisi topi dan gelang, maka rekomendasi harus mencakup pakaian inti seperti top (contoh: kaos polo), bottom (contoh: celana jeans), dan/atau sepatu. 
        JANGAN rekomendasikan jenis pakaian yang sama atau mirip secara fungsi dengan yang sudah ada di clothesToAnalyzeValue. Hindari duplikasi seperti menyarankan celana jeans jika sudah ada celana jeans lain yang direkomendasikan.
      
        JAWAB DALAM BAHASA INDONESIA!
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
                  type: 'STRING',
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
          return parsedJson.clothes as string[];
        } else {
          throw new InternalServerErrorException(
            'AI response was not in the expected format.',
          );
        }
      } else {
        throw new InternalServerErrorException('No valid response from AI.');
      }
    } catch (error) {
      console.error('Error in matchClothes service:', error);

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

  private getMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }
}
