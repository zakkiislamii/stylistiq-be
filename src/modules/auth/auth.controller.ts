import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiSuccessResponse } from 'src/contracts/interfaces/response.interface';
import { User } from 'src/entities/user.entity';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { AuthService } from 'src/modules/auth/auth.service';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { JwtFirebaseAuth } from 'src/common/guards/jwtFirebase.guard';
import { Request } from 'express';

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

  @UseGuards(JwtFirebaseAuth)
  @Post('/login/firebase')
  async loginFirebase(
    @Req() req: Request,
  ): Promise<ApiSuccessResponse<{ token: string }>> {
    const user = req['user'];
    const LoginFirebaseDto = {
      email: user.email as string,
      name: user.name as string,
    };
    const token = await this.authService.loginFirebase(LoginFirebaseDto);
    return ResponseHelper.success(token, 'Login successful', HttpStatus.OK);
  }
}
