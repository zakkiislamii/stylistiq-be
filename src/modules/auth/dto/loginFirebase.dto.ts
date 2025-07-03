import { IsEmail, IsString } from 'class-validator';

export class LoginFirebaseDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;
}
