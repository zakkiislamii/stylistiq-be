import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/password.validator';

export class RegisterDto {
  @IsEmail()
  email: string;

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

  @IsNotEmpty()
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;
}
