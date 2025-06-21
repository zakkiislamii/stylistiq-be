import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard';
import { UserService } from 'src/services/user.service';
import { UpdateUserDto } from 'src/common/dtos/user/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req['user'];
    const userId = user.user.id;
    console.log('userId', userId);
    const data = await this.userService.findUserById(userId);
    return ResponseHelper.success(data, 'Login successful', HttpStatus.OK);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req['user'];
    const userId = user.user.id;
    const data = await this.userService.updateUser(userId, dto);
    return ResponseHelper.success(
      data,
      'Update profile successful',
      HttpStatus.OK,
    );
  }
}
