import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from 'src/modules/user/dto/updateUser.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as path from 'path';

@Injectable()
export class UserRepository {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(userId: string): Promise<User | null> {
    const data = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.bodyProfile', 'bodyProfile')
      .loadRelationCountAndMap('user.clothesCount', 'user.clothes')
      .loadRelationCountAndMap('user.collectionsCount', 'user.collections')
      .loadRelationCountAndMap('user.schedulesCount', 'user.schedules')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!data) {
      return null;
    }

    if (data.profilePhoto) {
      data.profilePhoto = path.basename(data.profilePhoto);
    }
    return data;
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (dto.email) {
      const existingEmailUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (existingEmailUser && existingEmailUser.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updatedUser = {
      ...existingUser,
      ...dto,
    };

    return this.userRepository.save(updatedUser);
  }

  async updatePhotoProfileUser(
    userId: string,
    imagePath: string,
  ): Promise<{ imagePath: string; userId: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    existingUser.profilePhoto = imagePath;
    await this.userRepository.save(existingUser);

    return {
      imagePath: path.basename(existingUser.profilePhoto),
      userId: existingUser.id,
    };
  }
}
