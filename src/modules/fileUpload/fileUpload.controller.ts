import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  Req,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuth } from 'src/common/guards/jwt.guard';
import { FileUploadService } from './fileUpload.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { DynamicFileInterceptor } from 'src/common/interceptors/dynamicFile.interceptor';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { folder } from 'src/common/constants/variabel.constants';

@Controller('file')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @UseGuards(JwtAuth)
  @Post('upload')
  @DynamicFileInterceptor('file', (req: Request) => {
    const userId = req['user'].userId;
    const paths = folder(userId).profile;
    return paths;
  })
  async uploadProfile(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req['user'].userId;
    await this.fileUploadService.deleteOldProfilePhoto(userId, file.filename);

    const data = await this.fileUploadService.savePhotoToDb(
      userId,
      file.filename,
    );

    return ResponseHelper.success(data, 'Upload Success', HttpStatus.OK);
  }

  @Get(':userId/profile/:filename')
  getProfilePhoto(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      userId,
      'profile',
      filename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
  }

  @Get(':userId/collection/:filename')
  getCollectionPhoto(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = path.join(
      process.cwd(),
      'uploads',
      'private',
      'user',
      userId,
      'collection',
      filename,
    );

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';

    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
  }
}
