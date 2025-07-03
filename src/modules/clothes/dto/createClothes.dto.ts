import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';

export class CreateClothesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClothesInput)
  clothes: CreateClothesInput[];
}

export class CreateClothesInput {
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
