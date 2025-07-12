import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { FileUploadService } from './fileUpload.service';
import { UserModule } from '../user/user.module';
import { CollectionModule } from '../collections/collection.module';
import { ClothesModule } from '../clothes/clothes.module';

@Module({
  imports: [UserModule, CollectionModule, ClothesModule],
  providers: [UserService, FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
