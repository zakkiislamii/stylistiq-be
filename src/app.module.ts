import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserController } from './modules/user/user.controller';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { JwtAuth } from './common/guards/jwt.guard';
import { JwtTokenModule } from './modules/jwt/jwt.module';
import { UserBodyProfileModule } from './modules/userBodyProfile/userBodyProfile.module';
import { UserBodyProfileController } from './modules/userBodyProfile/userBodyProfile.controller';
import { FileUploadController } from './modules/fileUpload/fileUpload.controller';
import { FileUploadModule } from './modules/fileUpload/fileUpload.module';
import { ClothesController } from './modules/clothes/clothes.controller';
import { ClothesModule } from './modules/clothes/clothes.module';
import { CollectionController } from './modules/collections/collection.controller';
import { CollectionModule } from './modules/collections/collection.module';
import { ScheduleModule } from './modules/schedules/schedule.module';
import { ScheduleController } from './modules/schedules/schedule.controller';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    JwtTokenModule,
    UserBodyProfileModule,
    FileUploadModule,
    ClothesModule,
    CollectionModule,
    ScheduleModule,
  ],
  controllers: [
    UserController,
    AuthController,
    UserBodyProfileController,
    FileUploadController,
    ClothesController,
    CollectionController,
    ScheduleController,
  ],
  providers: [JwtAuth],
})
export class AppModule {}
