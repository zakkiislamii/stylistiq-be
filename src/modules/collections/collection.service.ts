import { Injectable, NotFoundException } from '@nestjs/common';
import { CollectionRepository } from './collection.repository';
import { Collection } from 'src/entities/collection.entity';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { UpdateCollectionDto } from './dto/updateCollection.dto';
import { DeleteCollectionDto } from './dto/deleteCollection.dto';
import { PaginationCollectionDto } from './dto/paginationCollection,dto';

@Injectable()
export class CollectionService {
  constructor(private readonly collectionRepository: CollectionRepository) {}

  async findById(
    collectionId: string,
    userId: string,
  ): Promise<Collection | null> {
    const collection = await this.collectionRepository.findById(collectionId);

    if (collection?.user.id != userId) {
      throw new NotFoundException('No matching collection found!');
    }

    return collection;
  }

  async findByUser(
    paginationDto: PaginationCollectionDto,
    userId: string,
  ): Promise<Collection[]> {
    const clothes = await this.collectionRepository.findByUser(
      paginationDto,
      userId,
    );
    return clothes;
  }

  async createCollection(
    userId: string,
    dtos: CreateCollectionDto,
  ): Promise<Collection> {
    const collection = await this.collectionRepository.createCollection(
      userId,
      dtos,
    );
    return collection;
  }

  async updateCollection(
    collectionId: string,
    userId: string,
    dto: UpdateCollectionDto,
  ): Promise<Collection> {
    const updateData = {
      ...dto,
    };

    const collection = await this.collectionRepository.updateCollection(
      collectionId,
      userId,
      updateData,
    );

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async deleteCollection(
    userId: string,
    dto: DeleteCollectionDto,
  ): Promise<Collection[]> {
    const collections = await this.collectionRepository.deleteCollection(
      userId,
      dto,
    );
    return collections;
  }
}
