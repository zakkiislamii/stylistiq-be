import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value) && value.length === 1 && value[0] === '') {
      return [];
    }
    return value as string[];
  })
  clothesIds?: string[];
}
