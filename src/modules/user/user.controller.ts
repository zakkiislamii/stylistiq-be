import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { JwtAuth } from 'src/common/guards/jwt.guard';
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
    const data = await this.userService.findUserById(userId);
    return ResponseHelper.success(
      data,
      'Successfully retrieved user profile',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Put('')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = req['user'];
    const userId = user.userId;
    const data = await this.userService.updateUser(userId, dto);
    return ResponseHelper.success(
      data,
      'User profile updated successfully',
      HttpStatus.OK,
    );
  }
}
