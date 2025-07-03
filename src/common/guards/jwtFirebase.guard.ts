import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from 'src/configs/env.config';

@Injectable()
export class JwtFirebaseAuth implements CanActivate {
  private googleClient: OAuth2Client;
  constructor() {
    this.googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      request['user'] = payload;
      return true;
    } catch (firebaseError) {
      throw new UnauthorizedException(
        `Invalid or expired token. Firebase Error: ${firebaseError.message}`,
      );
    }
  }
}
