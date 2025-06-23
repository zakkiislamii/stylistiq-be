import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserProviders } from './user.providers';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule],
  providers: [...UserProviders, UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
