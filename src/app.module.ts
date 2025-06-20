import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './repositories/user/user.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
