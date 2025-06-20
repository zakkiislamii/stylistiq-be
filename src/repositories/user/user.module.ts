import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './user.repository';
import { UserProviders } from './user.providers';
import { UserService } from 'src/services/user.service';

@Module({
  imports: [DatabaseModule],
  providers: [...UserProviders, UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
