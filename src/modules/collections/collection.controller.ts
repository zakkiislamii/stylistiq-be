import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuth } from 'src/common/guards/jwt.guard';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/createCollection.dto';
import { UpdateCollectionDto } from './dto/updateCollection.dto';
import { DeleteCollectionDto } from './dto/deleteCollection.dto';
import { DynamicFileInterceptor } from 'src/common/interceptors/dynamicFile.interceptor';
import { folder } from 'src/common/constants/variabel.constants';
import { BASE_URL } from 'src/configs/env.config';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import * as path from 'path';

@Controller('collection')
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @UseGuards(JwtAuth)
  @Get(':id')
  async getCollectionDetail(@Req() req: Request, @Param('id') id: string) {
    const userId = req['user'].userId;
    const collectionId = id;
    const data = await this.collectionService.findById(collectionId, userId);
    return ResponseHelper.success(
      data,
      'Successfully retrieved collections detail',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Get()
  async getCollectionByUser(@Req() req: Request) {
    const userId = req['user'].userId;
    const data = await this.collectionService.findByUser(userId);
    return ResponseHelper.success(
      data,
      "Successfully retrieved user's collections",
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Post()
  @DynamicFileInterceptor('image', (req: Request) => {
    const userId = req['user'].userId;
    // We can create a dynamic path for collection images
    const paths = folder(userId).collection;
    return paths;
  })
  async createCollection(
    @Req() req: Request,
    @Body() dto: CreateCollectionDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false, // Make the image optional
        // validators: [
        //   new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Max 5MB
        //   new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        // ],
      }),
    )
    imageFile: Express.Multer.File,
  ) {
    const userId = req['user'].userId;
    if (imageFile) {
      const filename = imageFile.filename;
      dto.image = `${BASE_URL}/file/${userId}/collection/${filename}`;
    }

    const data = await this.collectionService.createCollection(userId, dto);
    return ResponseHelper.success(
      data,
      'Collection created successfully',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(JwtAuth)
  @Put(':id')
  @DynamicFileInterceptor('image', (req: Request) => {
    const userId = req['user'].userId;
    const paths = folder(userId).collection;
    return paths;
  })
  async updateCollection(
    @Req() req: Request,
    @Body() dto: UpdateCollectionDto,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false, // Make the image optional
        // validators: [
        //   new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Max 5MB
        //   new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        // ],
      }),
    )
    imageFile: Express.Multer.File,
  ) {
    const userId = req['user'].userId;
    const collectionId = id;
    if (imageFile) {
      const filename = imageFile.filename;
      dto.image = `${BASE_URL}/file/${userId}/collection/${filename}`;
    }

    await this.fileUploadService.deleteOldCollectionImage({
      userId: userId,
      collectionId: collectionId,
    });

    const data = await this.collectionService.updateCollection(
      collectionId,
      userId,
      dto,
    );

    return ResponseHelper.success(
      data,
      'Collection updated successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Delete()
  async deleteCollection(
    @Req() req: Request,
    @Body() dto: DeleteCollectionDto,
  ) {
    const userId = req['user'].userId;
    const data = await this.collectionService.deleteCollection(userId, dto);

    for (const element of data) {
      if (!element.image) continue;
      await this.fileUploadService.deleteOldCollectionImage({
        userId: userId,
        deleteFilename: path.basename(element.image),
      });
    }

    return ResponseHelper.success(
      true,
      'Collection deleted successfully',
      HttpStatus.OK,
    );
  }
}
