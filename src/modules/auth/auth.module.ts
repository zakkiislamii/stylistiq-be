import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthProviders } from './auth.providers';
import { AuthRepository } from './auth.repository';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserModule } from '../user/user.module';
import { JwtTokenService } from 'src/modules/jwt/jwt.service';
import { JwtTokenModule } from '../jwt/jwt.module';

@Module({
  imports: [DatabaseModule, UserModule, JwtTokenModule],
  providers: [...AuthProviders, AuthRepository, AuthService, JwtTokenService],
  exports: [AuthService],
})
export class AuthModule {}
