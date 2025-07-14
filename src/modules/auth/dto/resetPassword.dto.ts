import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { PasswordMatchConstraint } from 'src/common/validators/password.validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
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
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Validate(PasswordMatchConstraint, ['newPassword'])
  confirmPassword: string;
}
