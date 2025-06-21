import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from 'src/common/dtos/auth/login.dto';
import { RegisterDto } from 'src/common/dtos/auth/register.dto';
import { ApiSuccessResponse } from 'src/common/interfaces/response.interface';
import { User } from 'src/entities/user.entity';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async regsiter(
    @Body() registerDto: RegisterDto,
  ): Promise<ApiSuccessResponse<User>> {
    const data = await this.authService.register(registerDto);
    return ResponseHelper.success(
      data,
      'Registration successful',
      HttpStatus.OK,
    );
  }

  @Post('/login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<ApiSuccessResponse<{ token: string }>> {
    const token = await this.authService.login(loginDto);
    return ResponseHelper.success(token, 'Login successful', HttpStatus.OK);
  }
}
