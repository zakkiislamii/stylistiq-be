import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuth } from 'src/common/guards/jwt.guard';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ClothesService } from './clothes.service';
import { UpdateClothesDto } from './dto/updateClothes.dto';
import { CreateClothesDto } from './dto/createClothes.dto';
import { DeleteClothesDto } from './dto/deleteClothes.dto';
import { folder } from 'src/common/constants/variabel.constants';
import { DynamicFilesInterceptor } from 'src/common/interceptors/dynamicFiles.interceptor';
import { PaginationClothesDto } from './dto/paginationClothes,dto';
import { DynamicFileInterceptor } from 'src/common/interceptors/dynamicFile.interceptor';
import { BASE_URL } from 'src/configs/env.config';
import { FileUploadService } from '../fileUpload/fileUpload.service';
import { ClothesStatus } from 'src/contracts/enums/clothesStatus.enum';
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';
import { UserService } from '../user/user.service';
import { MatchClothesDto } from './dto/matchClothes.dto';
import { SearchService } from '../elasticSearch/elasticClothesSearch.service';

@Controller('clothes')
export class ClothesController {
  constructor(
    private readonly clothesService: ClothesService,
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
    private readonly searchService: SearchService,
  ) {}
  @UseGuards(JwtAuth)
  @Get(':id')
  async getClothesDetail(@Req() req: Request, @Param('id') id: string) {
    const userId = req['user'].userId;
    const clothesId = id;
    const data = await this.clothesService.findById(clothesId, userId);
    return ResponseHelper.success(
      data,
      'Successfully retrieved clothes detail',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Get()
  async getClothesByUser(
    @Query() paginationDto: PaginationClothesDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].userId;
    const data = await this.clothesService.findByUser(userId, paginationDto);
    return ResponseHelper.success(
      data,
      "Successfully retrieved user's clothes",
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Get('search/all')
  async searchAllClothesByUser(@Req() req: Request, @Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query parameter "q" is required.');
    }
    const userId = req['user'].userId;
    const searchResults = await this.searchService.searchMultiTerm(
      'clothes-index',
      query,
      userId,
    );

    const data = searchResults.hits.hits.map((hit) => hit._source);

    return ResponseHelper.success(
      data,
      'Successfully retrieved clothes based on search query',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Post()
  async createManyClothes(@Req() req: Request, @Body() dtos: CreateClothesDto) {
    const userId = req['user'].userId;
    const data = await this.clothesService.createManyClothes(userId, dtos);

    return ResponseHelper.success(
      data,
      'Clothes created successfully',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(JwtAuth)
  @Put(':id')
  @DynamicFileInterceptor('image', (req: Request) => {
    const userId = req['user'].userId;
    const paths = folder(userId).clothes;
    return paths;
  })
  async updateClothes(
    @Req() req: Request,
    @Body() dto: UpdateClothesDto,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    imageFile: Express.Multer.File,
  ) {
    const userId = req['user'].userId;
    const clothesId = id;
    if (imageFile) {
      const filename = imageFile.filename;
      dto.image = `${BASE_URL}/file/${userId}/clothes/${filename}`;

      await this.fileUploadService.deleteOldClothesImage({
        userId: userId,
        clothesId: clothesId,
      });
    }

    const data = await this.clothesService.updateClothes(
      clothesId,
      userId,
      dto,
    );

    const document = {
      category: data.category,
      itemType: data.itemType ?? null,
      color: data.color ?? null,
      note: data.note ?? null,
      status: data.status,
      images: data.image ?? null,
      userId: userId,
    };

    await this.searchService.updateClothes(
      'clothes-index',
      clothesId,
      document,
    );

    return ResponseHelper.success(
      data,
      'Clothes updated successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Delete()
  async deleteClothes(@Req() req: Request, @Body() dto: DeleteClothesDto) {
    const userId = req['user'].userId;
    const data = await this.clothesService.deleteClothes(userId, dto);

    for (const id of dto.clothesIds) {
      await this.searchService.deleteClothes('clothes-index', id);
    }

    return ResponseHelper.success(
      data,
      'Clothes deleted successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Post('analyze')
  @DynamicFilesInterceptor(
    'images',
    (req: Request) => {
      const userId = req['user'].userId;
      const paths = folder(userId).clothes;
      return paths;
    },
    {
      multiple: true,
      maxCount: 10,
      fileSize: 5 * 1024 * 1024,
      allowedMimes: ['image/jpeg', 'image/png', 'image/jpg'],
    },
  )
  async clothesAnalyze(
    @Req() req: Request,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    images: Array<Express.Multer.File>,
  ) {
    const userId = req['user'].userId;

    if (!images || images.length === 0) {
      throw new BadRequestException('No images were uploaded.');
    }

    const results = await this.clothesService.clothesAnalyze(userId, images);
    const createdClothes = await this.clothesService.createManyClothes(userId, {
      clothes: results,
    } as CreateClothesDto);

    for (const clothes of createdClothes) {
      const document = {
        category: clothes.category,
        itemType: clothes.itemType ?? null,
        color: clothes.color ?? null,
        note: clothes.note ?? null,
        status: clothes.status,
        images: clothes.image ?? null,
        userId: userId,
      };

      // Assuming `cloth.id` is the unique ID from your database
      await this.searchService.indexClothes(
        'clothes-index',
        clothes.id,
        document,
      );
    }

    return {
      message: 'Images uploaded and processed successfully!',
      userId: userId,
      clothes: createdClothes,
    };
  }

  @UseGuards(JwtAuth)
  @Post('match')
  async matchClothes(@Req() req: Request, @Body() dto: MatchClothesDto) {
    const userId = req['user'].userId;
    const user = await this.userService.findUserById(userId);

    const ownedClothes = await this.clothesService.findByUser(
      userId,
      undefined,
      ClothesStatus.DIMILIKI,
    );

    const groupedData = {};
    Object.values(ClothesCategory).forEach((category) => {
      groupedData[category] = [];
    });

    const data = ownedClothes.reduce((acc, clothes) => {
      const { user, collections, schedules, ...clothesWithoutUser } = clothes;
      acc[clothes.category].push(clothesWithoutUser);
      return acc;
    }, groupedData);

    const result = await this.clothesService.matchClothes(
      user,
      data,
      dto.clothesIds,
    );

    const clothesResult = await this.clothesService.findAllByIds(result);

    return ResponseHelper.success(
      clothesResult,
      'Owned clothes fetched successfully',
      HttpStatus.OK,
    );
  }
}
