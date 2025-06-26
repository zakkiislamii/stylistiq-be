import { Injectable, Inject } from '@nestjs/common';
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

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['bodyProfile'],
    });
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    const updatedUser = {
      ...existingUser,
      ...dto,
    };

    return this.userRepository.save(updatedUser);
  }

  async updatePhotoProfileUser(
    userId: string,
    imagePath: string,
  ): Promise<{ imageUrl: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    existingUser.profilePhoto = imagePath;
    await this.userRepository.save(existingUser);

    return {
      imageUrl: `/file/profile/${userId}/${path.basename(imagePath)}`,
    };
  }

  async getCurrentUser(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'profilePhoto'],
    });
  }
}
