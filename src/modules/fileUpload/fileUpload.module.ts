import { Module } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { FileUploadService } from './fileUpload.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [UserService, FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
