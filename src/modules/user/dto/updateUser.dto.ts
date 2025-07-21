import { IsOptional, IsString, IsDate, IsEnum, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from 'src/contracts/enums/gender.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @IsEmail()
  email?: string;
}
