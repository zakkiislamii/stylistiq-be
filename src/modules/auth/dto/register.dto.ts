import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { PasswordMatchConstraint } from 'src/common/validators/password.validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @Validate(PasswordMatchConstraint, ['password'])
  confirmPassword: string;
}
