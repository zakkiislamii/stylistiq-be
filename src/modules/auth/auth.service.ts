import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { AuthRepository } from 'src/modules/auth/auth.repository';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { ForgotPasswordDto } from 'src/modules/auth/dto/forgotPassword.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/resetPassword.dto';
import { ChangePasswordDto } from 'src/modules/auth/dto/changePassword.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginFirebaseDto } from './dto/loginFirebase.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltOrRounds);
    return this.authRepository.register(registerDto.email, passwordHash);
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const user = await this.authRepository.login(loginDto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email };
    const token = this.jwtTokenService.sign(payload);

    return { token };
  }

  async loginFirebase(
    loginFirebaseDto: LoginFirebaseDto,
  ): Promise<{ token: string }> {
    const user = await this.authRepository.loginFirebase(
      loginFirebaseDto.email,
      loginFirebaseDto.name,
    );

    const payload = { userId: user.id, email: user.email };
    const token = this.jwtTokenService.sign(payload);

    return { token };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.authRepository.findByEmail(forgotPasswordDto.email);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    return { message: 'Password reset instructions sent to your email' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltOrRounds);
    await this.authRepository.resetPassword(email, passwordHash);
    return { message: 'Password reset successful' };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new UnauthorizedException('Password not set');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const saltOrRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltOrRounds);
    await this.authRepository.updatePassword(userId, passwordHash);
    return { message: 'Password changed successfully' };
  }
}
