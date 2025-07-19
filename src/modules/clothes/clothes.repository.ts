import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { FindManyOptions, FindOptionsWhere, In, Repository } from 'typeorm';
import * as path from 'path';
import { Clothes } from 'src/entities/clothe.entity';
import { UpdateClothesDto } from './dto/updateClothes.dto';
import { CreateClothesInput } from './dto/createClothes.dto';
import { DeleteClothesDto } from './dto/deleteClothes.dto';
import { PaginationClothesDto } from './dto/paginationClothes,dto';
import { ClothesStatus } from 'src/contracts/enums/clothesStatus.enum';

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

  async findAllByIds(clothesIds: string[]): Promise<Clothes[]> {
    return await this.clothesRepository.find({
      where: {
        id: In(clothesIds),
      },
      relations: ['user'],
    });
  }

  async findByUser(
    userId: string,
    paginationDto?: PaginationClothesDto,
    status?: ClothesStatus,
  ): Promise<Clothes[]> {
    // --- 1. Build the WHERE clause (no changes here) ---
    const where: FindOptionsWhere<Clothes> = {
      user: { id: userId },
    };

    if (status) {
      where.status = status;
    }

    // --- 2. Build the main options for the find query ---
    const findOptions: FindManyOptions<Clothes> = {
      where,
      relations: ['user', 'schedules', 'collections'],
    };

    // --- 3. Conditionally add pagination ---
    if (paginationDto) {
      const page = paginationDto.page ?? 1;
      const limit = paginationDto.limit ?? 10;
      findOptions.skip = (page - 1) * limit;
      findOptions.take = limit;
    }

    return this.clothesRepository.find(findOptions);
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
    await this.clothesRepository.update(
      { id: clothesId, user: { id: userId } },
      dto,
    );

    return this.clothesRepository.findOneOrFail({
      where: { id: clothesId, user: { id: userId } },
      relations: ['schedules', 'collections'],
    });
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
