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
  @IsUUID('all', { each: true })
  clothesIds?: string[];
}
