import { IsOptional, IsString, IsUUID, IsArray } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  clothesIds?: string[];
}
