import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { DatabaseModule } from './database/database.module';
import { UserController } from './controllers/user.controller';
import { UserModule } from './common/modules/user.module';
import { AuthModule } from './common/modules/auth.module';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [DatabaseModule, UserModule, AuthModule],
  controllers: [AppController, UserController, AuthController],
  providers: [AppService],
})
export class AppModule {}
