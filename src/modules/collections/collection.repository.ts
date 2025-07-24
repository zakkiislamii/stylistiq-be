import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { FindManyOptions, ILike, In, Repository } from 'typeorm';
import * as path from 'path';
import { Collection } from 'src/entities/collection.entity';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { UpdateCollectionDto } from './dto/updateCollection.dto';
import { DeleteCollectionDto } from './dto/deleteCollection.dto';
import { Clothes } from 'src/entities/clothe.entity';
import { PaginationCollectionDto } from './dto/paginationCollection,dto';

@Injectable()
export class CollectionRepository {
  constructor(
    @Inject('COLLECTION_REPOSITORY')
    private collectionRepository: Repository<Collection>,
  ) {}

  async findById(collectionId: string): Promise<Collection | null> {
    return this.collectionRepository.findOneOrFail({
      where: { id: collectionId },
      relations: ['user', 'clothes'],
    });
  }

  async findByUser(
    paginationDto: PaginationCollectionDto,
    userId: string,
  ): Promise<Collection[]> {
    const page = paginationDto.page ?? 1;
    const limit = paginationDto.limit ?? 1000;
    const q = paginationDto.q ?? null;

    const findOptions: FindManyOptions<Collection> = {
      where: {
        user: { id: userId },
      },
      relations: ['user', 'clothes'],
      skip: (page - 1) * limit,
      take: limit,
    };

    if (q) {
      findOptions.where = {
        ...findOptions.where,
        name: ILike(`%${q}%`),
      };
    }

    return this.collectionRepository.find(findOptions);
  }

  async createCollection(
    userId: string,
    dto: CreateCollectionDto,
  ): Promise<Collection> {
    const collection = new Collection();
    collection.user = { id: userId } as User;
    collection.name = dto.name;
    collection.image = dto.image;

    // Relasi Dengan Clothes
    if (dto.clothesIds && dto.clothesIds.length > 0) {
      collection.clothes = dto.clothesIds.map((id) => ({ id: id }) as Clothes);
    } else {
      collection.clothes = [];
    }

    const saved = await this.collectionRepository.save(collection);

    return this.collectionRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['user', 'clothes'],
    });
  }

  async updateCollection(
    collectionId: string,
    userId: string,
    dto: UpdateCollectionDto,
  ): Promise<Collection> {
    const existingCollection = await this.collectionRepository.findOne({
      where: { id: collectionId, user: { id: userId } },
      relations: ['user', 'clothes'],
    });

    const { clothesIds, ...collectionData } = dto;

    const updatedCollection = {
      ...existingCollection,
      ...collectionData,
    };

    if (Array.isArray(clothesIds)) {
      updatedCollection.clothes = clothesIds.map((id) => ({ id }) as Clothes);
    }

    await this.collectionRepository.save(updatedCollection);

    return this.collectionRepository.findOneOrFail({
      where: { id: collectionId, user: { id: userId } },
      relations: ['user', 'clothes'],
    });
  }

  async deleteCollection(
    userId: string,
    dto: DeleteCollectionDto,
  ): Promise<Collection[]> {
    const collectionToDelete = await this.collectionRepository.find({
      where: {
        id: In(dto.collectionIds),
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (collectionToDelete.length === 0) {
      throw new NotFoundException(
        'No matching clothes found for this collection',
      );
    }

    const collections =
      await this.collectionRepository.remove(collectionToDelete);
    return collections;
  }

  async updateImageCollection(
    clothesId: string,
    imagePath: string,
  ): Promise<{ imagePath: string; clothesId: string }> {
    const existingCollection = await this.collectionRepository.findOne({
      where: { id: clothesId },
    });

    if (!existingCollection) {
      throw new NotFoundException('User not found');
    }

    existingCollection.image = imagePath;
    await this.collectionRepository.save(existingCollection);

    return {
      imagePath: path.basename(existingCollection.image),
      clothesId: existingCollection.id,
    };
  }
}
