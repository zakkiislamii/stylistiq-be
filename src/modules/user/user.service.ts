import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from 'src/modules/user/dto/updateUser.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findUserById(userId);
  }

  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const dateNow = new Date();

    let birthDate: Date | null = null;
    if (dto.birthday) {
      birthDate = new Date(dto.birthday);
    }

    let age: number | null = null;
    if (birthDate && !isNaN(birthDate.getTime())) {
      const yearDiff = dateNow.getFullYear() - birthDate.getFullYear();
      const monthDiff = dateNow.getMonth() - birthDate.getMonth();
      const dayDiff = dateNow.getDate() - birthDate.getDate();
      age =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
          ? yearDiff - 1
          : yearDiff;
    }

    const updateData = {
      ...dto,
      ...(birthDate ? { birthday: birthDate } : {}),
      age: String(age),
    };

    const user = await this.userRepository.updateUser(userId, updateData);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updatePhotoProfileUser(
    userId: string,
    image: string,
  ): Promise<{ imagePath: string; userId: string }> {
    return this.userRepository.updatePhotoProfileUser(userId, image);
  }
}
