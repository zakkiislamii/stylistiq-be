import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
