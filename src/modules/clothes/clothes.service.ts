import { Injectable, NotFoundException } from '@nestjs/common';
import { ClothesRepository } from './clothes.repository';
import { Clothes } from 'src/entities/clothe.entity';
import { UpdateClothesDto } from './dto/updateClothes.dto';
import { CreateClothesDto } from './dto/createClothes.dto';
import { DeleteClothesDto } from './dto/deleteClothes.dto';

@Injectable()
export class ClothesService {
  constructor(private readonly clothesRepository: ClothesRepository) {}

  async findById(clothesId: string, userId: string): Promise<Clothes | null> {
    const clothes = await this.clothesRepository.findById(clothesId);
    return clothes?.user.id == userId ? clothes : null;
  }

  async findByUser(userId: string): Promise<Clothes[]> {
    const clothes = await this.clothesRepository.findByUser(userId);
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

  async updateImageClothes(
    clothesId: string,
    image: string,
  ): Promise<{ imagePath: string; clothesId: string }> {
    return this.clothesRepository.updateImageClothes(clothesId, image);
  }
}
