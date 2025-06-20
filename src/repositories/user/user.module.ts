import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UserRepository } from './user.repository';
import { UserProviders } from './user.providers';

@Module({
  imports: [DatabaseModule],
  providers: [...UserProviders, UserRepository],
})
export class UserModule {}
