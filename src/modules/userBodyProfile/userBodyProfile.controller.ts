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
import { JwtAuth } from 'src/common/guards/jwt.guard';
import { UserBodyProfileService } from './userBodyProfile.service';
import { UpdateUserBodyProfileDto } from './dto/updateUserBodyProfile.dto';

@Controller('user/body-profile')
export class UserBodyProfileController {
  constructor(
    private readonly userBodyProfileService: UserBodyProfileService,
  ) {}

  @UseGuards(JwtAuth)
  @Post('')
  async updateBodyProfile(
    @Req() req: Request,
    @Body() dto: UpdateUserBodyProfileDto,
  ) {
    const user = req['user'];
    const userId = user.userId;
    const data = await this.userBodyProfileService.updateUserBodyProfile(
      userId,
      dto,
    );
    return ResponseHelper.success(
      data,
      'Update body profile successful',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Get('')
  async getBodyProfile(@Req() req: Request) {
    const user = req['user'];
    const userId = user.userId;
    const data = await this.userBodyProfileService.getUserBodyProfile(userId);
    return ResponseHelper.success(
      data,
      'get body profile successful',
      HttpStatus.OK,
    );
  }
}
