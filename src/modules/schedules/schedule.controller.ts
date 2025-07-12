import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuth } from 'src/common/guards/jwt.guard';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/createSchedule.dto';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';
import { DeleteScheduleDto } from './dto/deleteSchedule.dto';
import { PaginationScheduleDto } from './dto/paginationSchedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(JwtAuth)
  @Get(':id')
  async getScheduleDetail(@Req() req: Request, @Param('id') id: string) {
    const userId = req['user'].userId;
    const data = await this.scheduleService.findById(id, userId);
    return ResponseHelper.success(
      data,
      'Successfully retrieved schedule detail',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Get()
  async getSchedulesByUser(
    @Query() paginationDto: PaginationScheduleDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].userId;
    const data = await this.scheduleService.findByUser(paginationDto, userId);
    return ResponseHelper.success(
      data,
      "Successfully retrieved user's schedules",
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Get('date/:date')
  async getSchedulesByDate(@Req() req: Request, @Param('date') date: string) {
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormat.test(date)) {
      throw new BadRequestException(
        'Invalid date format. Please use YYYY-MM-DD.',
      );
    }

    const userId = req['user'].userId;
    const data = await this.scheduleService.findByDate(userId, date);
    return ResponseHelper.success(
      data,
      `Successfully retrieved schedules for date: ${date}`,
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Post()
  async createSchedule(@Req() req: Request, @Body() dto: CreateScheduleDto) {
    const userId = req['user'].userId;
    const data = await this.scheduleService.createSchedule(userId, dto);
    return ResponseHelper.success(
      data,
      'Schedule created successfully',
      HttpStatus.CREATED,
    );
  }

  @UseGuards(JwtAuth)
  @Put(':id')
  async updateSchedule(
    @Req() req: Request,
    @Body() dto: UpdateScheduleDto,
    @Param('id') id: string,
  ) {
    const userId = req['user'].userId;
    const data = await this.scheduleService.updateSchedule(id, userId, dto);
    return ResponseHelper.success(
      data,
      'Schedule updated successfully',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Delete()
  async deleteSchedule(@Req() req: Request, @Body() dto: DeleteScheduleDto) {
    const userId = req['user'].userId;
    await this.scheduleService.deleteSchedule(userId, dto);
    return ResponseHelper.success(
      true,
      'Schedules deleted successfully',
      HttpStatus.OK,
    );
  }
}
