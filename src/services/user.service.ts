import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from 'src/common/dtos/user/updateUser.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/repositories/user.repository';

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
    const user = await this.userRepository.updateUser(userId, dto);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
