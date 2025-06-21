import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthProviders } from '../providers/auth.providers';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthService } from 'src/services/auth.service';
import { UserModule } from './user.module';
import { JwtTokenService } from 'src/services/jwt.service';
import { JwtTokenModule } from './jwt-token.module';

@Module({
  imports: [DatabaseModule, UserModule, JwtTokenModule],
  providers: [...AuthProviders, AuthRepository, AuthService, JwtTokenService],
  exports: [AuthService],
})
export class AuthModule {}
