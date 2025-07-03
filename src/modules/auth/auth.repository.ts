import { Injectable, Inject } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository {
  constructor(
    @Inject('AUTH_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async register(email: string, password: string): Promise<User> {
    const user = this.userRepository.create({
      email,
      password,
    });
    return this.userRepository.save(user);
  }

  async login(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async loginFirebase(email: string, name: string): Promise<User> {
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({ email, name }),
      );
    }

    return user;
  }
}
