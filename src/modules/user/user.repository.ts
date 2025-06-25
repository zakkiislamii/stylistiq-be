import { Injectable, Inject } from '@nestjs/common';
import { UpdateUserDto } from 'src/modules/user/dto/updateUser.dto';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

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
}
