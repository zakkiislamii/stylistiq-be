import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { JwtAuth } from './common/guards/jwt.guard';
import { JwtTokenModule } from './modules/jwt/jwt.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, JwtTokenModule],
  controllers: [UserController, AuthController],
  providers: [JwtAuth],
})
export class AppModule {}
