import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as path from 'path';
import * as fs from 'fs';
import { BASE_URL } from 'src/configs/env.config';
import { CollectionService } from '../collections/collection.service';
import { ClothesService } from '../clothes/clothes.service';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly userService: UserService,
    private readonly collectionService: CollectionService,
    private readonly clothesService: ClothesService,
  ) {}

  async savePhotoToDb(userId: string, filename: string) {
    // const paths = folder(userId).profile;
    const relativePath = `${BASE_URL}/file/${userId}/profile/${filename}`;
    await this.userService.updatePhotoProfileUser(userId, relativePath);
    return relativePath;
  }

  async deleteOldProfilePhoto(userId: string, keepFilename?: string) {
    const userProfileDir = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      userId,
      'profile',
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

  async deleteOldCollectionImage(params: {
    userId: string;
    collectionId?: string;
    deleteFilename?: string;
  }) {
    let filename = '';
    if (params.collectionId) {
      const existingCollection = await this.collectionService.findById(
        params.collectionId,
        params.userId,
      );

      if (!existingCollection?.image) {
        Logger.error(
          `No image found for Collection with ID: ${existingCollection?.id}`,
        );
        return;
      }

      filename = path.basename(existingCollection.image);
    } else if (params.deleteFilename) {
      filename = params.deleteFilename;
    }

    const collectionImagePath = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      params.userId,
      'collection',
      filename,
    );

    try {
      await fs.promises.unlink(collectionImagePath);
    } catch (err) {
      throw new InternalServerErrorException(
        `Gagal menghapus file: ${collectionImagePath}`,
        err,
      );
    }
  }

  async deleteOldClothesImage(params: {
    userId: string;
    clothesId?: string;
    deleteFilename?: string;
  }) {
    let filename = '';
    if (params.clothesId) {
      const existingClothes = await this.clothesService.findById(
        params.clothesId,
        params.userId,
      );

      if (!existingClothes?.image) {
        Logger.error(
          `No image found for Clothes with ID: ${existingClothes?.id}`,
        );
        return;
      }

      filename = path.basename(existingClothes.image);
    } else if (params.deleteFilename) {
      filename = params.deleteFilename;
    }

    const clothesImagePath = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      params.userId,
      'clothes',
      filename,
    );

    try {
      await fs.promises.unlink(clothesImagePath);
    } catch (err) {
      throw new InternalServerErrorException(
        `Gagal menghapus file: ${clothesImagePath}`,
        err,
      );
    }
  }
}
