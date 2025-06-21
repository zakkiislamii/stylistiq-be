import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { DatabaseModule } from './database/database.module';
import { UserController } from './controllers/user.controller';
import { UserModule } from './common/modules/user.module';
import { AuthModule } from './common/modules/auth.module';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './common/guards/JwtAuthGuard.guard';
import { JwtTokenModule } from './common/modules/jwt-token.module';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, JwtTokenModule],
  controllers: [AppController, UserController, AuthController],
  providers: [AppService, JwtAuthGuard],
})
export class AppModule {}
