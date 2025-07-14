import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { PasswordMatchConstraint } from 'src/common/validators/password.validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Validate(PasswordMatchConstraint, ['newPassword'])
  confirmPassword: string;
}
