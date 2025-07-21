import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
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

  @IsString()
  itemType: string;

  @IsString()
  color: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
