import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AuthProviders } from '../providers/auth.providers';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthService } from 'src/services/auth.service';
import { UserModule } from './user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '../config/env.config';
import { JwtTokenService } from 'src/services/jwt.service';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [...AuthProviders, AuthRepository, AuthService, JwtTokenService],
  exports: [AuthService],
})
export class AuthModule {}
