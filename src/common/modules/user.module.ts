import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from 'src/repositories/user.repository';
import { UserService } from 'src/services/user.service';
import { UserProviders } from '../providers/user.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...UserProviders, UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
