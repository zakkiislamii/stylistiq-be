import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as path from 'path';
import * as fs from 'fs';
import { BASE_URL } from 'src/configs/env.config';
import { folder } from 'src/common/constants/variabel.constants';

@Injectable()
export class FileUploadService {
  constructor(private readonly userService: UserService) {}

  async savePhotoToDb(userId: string, filename: string) {
    const paths = folder(userId).profile;
    const relativePath = `${paths}/${userId}/${filename}`;
    const returnPath = `${BASE_URL}/profile/${userId}/${filename}`;
    await this.userService.updatePhotoProfileUser(userId, relativePath);
    return returnPath;
  }

  deleteOldProfilePhoto(userId: string, keepFilename?: string) {
    const userProfileDir = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      'profile',
      userId,
    );

    if (fs.existsSync(userProfileDir)) {
      const files = fs.readdirSync(userProfileDir);
      files.forEach((file) => {
        if (file === keepFilename) return;
        const filePath = path.join(userProfileDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }
}
