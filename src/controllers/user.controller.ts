import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/services/user.service';
import { ResponseHelper } from 'src/helpers/response.helper';
import { User } from 'src/entities/user.entity';
import { ApiSuccessResponse } from 'src/common/interfaces/response.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  async findAll(): Promise<ApiSuccessResponse<User[]>> {
    try {
      const users = await this.userService.findAll();
      return ResponseHelper.success(
        users,
        'Users retrieved successfully',
        HttpStatus.OK,
      );
    } catch (error) {
      const errorResponse = ResponseHelper.error(
        'Failed to retrieve users',
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      throw new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
