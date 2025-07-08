import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuth } from 'src/common/guards/jwt.guard';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ClothesService } from './clothes.service';
import { UpdateClothesDto } from './dto/updateClothes.dto';
import { CreateClothesDto } from './dto/createClothes.dto';
import { DeleteClothesDto } from './dto/deleteClothes.dto';

@Controller('clothes')
export class ClothesController {
  constructor(private readonly clothesService: ClothesService) {}
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
  async getClothesByUser(@Req() req: Request) {
    const userId = req['user'].userId;
    const data = await this.clothesService.findByUser(userId);
    return ResponseHelper.success(
      data,
      "Successfully retrieved user's clothes",
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
  async updateClothes(
    @Req() req: Request,
    @Body() dto: UpdateClothesDto,
    @Param('id') id: string,
  ) {
    const userId = req['user'].userId;
    const clothesId = id;
    const data = await this.clothesService.updateClothes(
      clothesId,
      userId,
      dto,
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
    return ResponseHelper.success(
      data,
      'Clothes deleted successfully',
      HttpStatus.OK,
    );
  }
}
