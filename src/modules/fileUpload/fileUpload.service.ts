import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as path from 'path';
import * as fs from 'fs';
import { folder } from 'src/common/constants/variabel.constants';
import { BASE_URL } from 'src/configs/env.config';

@Injectable()
export class FileUploadService {
  constructor(private readonly userService: UserService) {}

  async savePhotoToDb(userId: string, filename: string) {
    const paths = folder(userId).profile;
    const relativePath = `${paths}/${userId}/${filename}`;
    const imageUrl = await this.userService.updatePhotoProfileUser(
      userId,
      relativePath,
    );
    const data = `${BASE_URL}/file/profile/${imageUrl.userId}/${imageUrl.imagePath}`;
    return data;
  }

  async deleteOldProfilePhoto(userId: string, keepFilename?: string) {
    const userProfileDir = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      'profile',
      userId,
    );

    if (fs.existsSync(userProfileDir)) {
      const files = await fs.promises.readdir(userProfileDir);
      for (const file of files) {
        if (file === keepFilename) continue;

        const filePath = path.join(userProfileDir, file);
        try {
          await fs.promises.unlink(filePath);
        } catch (err) {
          throw new InternalServerErrorException(
            `Gagal menghapus file: ${filePath}`,
            err,
          );
        }
      }
    }
  }
}
