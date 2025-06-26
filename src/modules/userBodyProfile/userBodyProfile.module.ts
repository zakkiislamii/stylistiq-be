import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserBodyProfileService } from './userBodyProfile.service';
import { UserBodyProfileRepository } from './userBodyProfile.repository';
import { UserBodyProfileProviders } from './userBodyProfile.providers';

@Module({
  imports: [DatabaseModule],
  providers: [
    ...UserBodyProfileProviders,
    UserBodyProfileRepository,
    UserBodyProfileService,
  ],
  exports: [UserBodyProfileService],
})
export class UserBodyProfileModule {}
