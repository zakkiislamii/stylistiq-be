import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';
import * as path from 'path';
import { Clothes } from 'src/entities/clothe.entity';
import { UpdateClothesDto } from './dto/updateClothes.dto';
import { CreateClothesInput } from './dto/createClothes.dto';
import { DeleteClothesDto } from './dto/deleteClothes.dto';

@Injectable()
export class ClothesRepository {
  constructor(
    @Inject('CLOTHES_REPOSITORY')
    private clothesRepository: Repository<Clothes>,
  ) {}

  async findById(clothesId: string): Promise<Clothes | null> {
    return this.clothesRepository.findOneOrFail({
      where: { id: clothesId },
      relations: ['user', 'collections'],
    });
  }

  async findByUser(userId: string): Promise<Clothes[]> {
    return this.clothesRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'schedules', 'collections'],
    });
  }

  async createClothes(
    userId: string,
    dto: CreateClothesInput,
  ): Promise<Clothes> {
    const clothes = new Clothes();
    clothes.user = { id: userId } as User;
    clothes.category = dto.category;
    clothes.itemType = dto.itemType ?? null;
    clothes.color = dto.color ?? null;
    clothes.image = dto.image ?? null;
    clothes.note = dto.note ?? null;
    // clothes.schedules = schedules;
    // clothes.collections = collections;

    const saved = await this.clothesRepository.save(clothes);
    return this.clothesRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['user', 'schedules', 'collections'],
    });
  }

  async updateClothes(
    clothesId: string,
    userId: string,
    dto: UpdateClothesDto,
  ): Promise<Clothes> {
    const existingClothes = await this.clothesRepository.findOne({
      where: { id: clothesId, user: { id: userId } },
      relations: ['user'],
    });

    const updatedClothes = {
      ...existingClothes,
      ...dto,
    };

    return this.clothesRepository.save(updatedClothes);
  }

  async deleteClothes(userId: string, dto: DeleteClothesDto): Promise<boolean> {
    const clothesToDelete = await this.clothesRepository.find({
      where: {
        id: In(dto.clothesIds),
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (clothesToDelete.length === 0) {
      throw new NotFoundException('No matching clothes found for this user');
    }

    await this.clothesRepository.remove(clothesToDelete);
    return true;
  }

  async updateImageClothes(
    clothesId: string,
    imagePath: string,
  ): Promise<{ imagePath: string; clothesId: string }> {
    const existingClothes = await this.clothesRepository.findOne({
      where: { id: clothesId },
    });

    if (!existingClothes) {
      throw new NotFoundException('User not found');
    }

    existingClothes.image = imagePath;
    await this.clothesRepository.save(existingClothes);

    return {
      imagePath: path.basename(existingClothes.image),
      clothesId: existingClothes.id,
    };
  }
}
