import { IsEnum, IsOptional, IsString, IsUUID, IsArray } from 'class-validator';
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';

export class UpdateClothesDto {
  @IsEnum(ClothesCategory)
  category: ClothesCategory;

  @IsOptional()
  @IsString()
  itemType?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  scheduleIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  collectionIds?: string[];
}
