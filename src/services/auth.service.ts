import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { AuthRepository } from 'src/repositories/auth.repository';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/common/dtos/auth/register.dto';
import { UserService } from './user.service';
import { LoginDto } from 'src/common/dtos/auth/login.dto';
import { JwtTokenService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
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

    const payload = { user };
    const token = this.jwtTokenService.sign(payload);

    return { token };
  }
}
