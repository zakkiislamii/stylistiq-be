import { Injectable, NotFoundException } from '@nestjs/common';
import { UserBodyProfileRepository } from './userBodyProfile.repository';
import { UpdateUserBodyProfileDto } from './dto/updateUserBodyProfile.dto';
import { UserBodyProfile } from 'src/entities/userBodyProfile.entity';

@Injectable()
export class UserBodyProfileService {
  constructor(
    private readonly userBodyProfileRepository: UserBodyProfileRepository,
  ) {}

  async updateUserBodyProfile(
    userId: string,
    dto: UpdateUserBodyProfileDto,
  ): Promise<UserBodyProfile> {
    return await this.userBodyProfileRepository.updateUserBodyProfile(
      userId,
      dto,
    );
  }

  async getUserBodyProfile(userId: string): Promise<UserBodyProfile | null> {
    const data = await this.userBodyProfileRepository.findUserById(userId);
    if (!data) {
      throw new NotFoundException('User not found');
    }
    return data;
  }
}
