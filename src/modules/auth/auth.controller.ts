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
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgotPassword.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/resetPassword.dto';
import { ChangePasswordDto } from 'src/modules/auth/dto/changePassword.dto';
import { JwtFirebaseAuth } from 'src/common/guards/jwtFirebase.guard';
import { Request } from 'express';
import { JwtAuth } from 'src/common/guards/jwt.guard';

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

  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const result = await this.authService.forgotPassword(forgotPasswordDto);
    return ResponseHelper.success(
      result,
      'Password reset instructions sent to your email',
      HttpStatus.OK,
    );
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return ResponseHelper.success(
      result,
      'Password reset successful',
      HttpStatus.OK,
    );
  }

  @UseGuards(JwtAuth)
  @Post('/change-password')
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const user = req['user'];
    const userId = user.userId;
    const result = await this.authService.changePassword(
      userId,
      changePasswordDto,
    );
    return ResponseHelper.success(
      result,
      'Password changed successfully',
      HttpStatus.OK,
    );
  }
}
