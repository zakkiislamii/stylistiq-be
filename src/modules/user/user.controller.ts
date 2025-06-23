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
import { JwtAuth } from 'src/common/guards/jwtAuth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from 'src/modules/user/dto/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuth)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req['user'];
    const userId = user.userId;
    console.log('userId', userId);
    const data = await this.userService.findUserById(userId);
    return ResponseHelper.success(data, 'Login successful', HttpStatus.OK);
  }

  @UseGuards(JwtAuth)
  @Post('')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req['user'];
    const userId = user.userId;
    const data = await this.userService.updateUser(userId, dto);
    return ResponseHelper.success(
      data,
      'Update profile successful',
      HttpStatus.OK,
    );
  }
}
