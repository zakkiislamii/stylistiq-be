import { Inject, Injectable } from '@nestjs/common';
import { UserBodyProfile } from 'src/entities/userBodyProfile.entity';
import { Repository } from 'typeorm';
import { UpdateUserBodyProfileDto } from './dto/updateUserBodyProfile.dto';

@Injectable()
export class UserBodyProfileRepository {
  constructor(
    @Inject('USER_BODY_PROFILE_REPOSITORY')
    private userBodyProfileRepository: Repository<UserBodyProfile>,
  ) {}
  async updateUserBodyProfile(
    userId: string,
    dto: UpdateUserBodyProfileDto,
  ): Promise<UserBodyProfile> {
    let userBodyProfile = await this.userBodyProfileRepository.findOne({
      where: { userId },
    });

    if (!userBodyProfile) {
      userBodyProfile = this.userBodyProfileRepository.create({
        userId,
        ...dto,
      });
    } else {
      Object.assign(userBodyProfile, dto);
    }

    return this.userBodyProfileRepository.save(userBodyProfile);
  }

  async findUserById(userId: string): Promise<UserBodyProfile | null> {
    return this.userBodyProfileRepository.findOne({
      where: { userId: userId },
    });
  }
}
