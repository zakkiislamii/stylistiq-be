import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { JwtAuthGuard } from 'src/common/guards/JwtAuthGuard.guard';

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    const user = req['user'];
    return ResponseHelper.success(user, 'Login successful', HttpStatus.OK);
  }
}
