import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';
import { ClothesStatus } from 'src/contracts/enums/clothesStatus.enum';

export class UpdateClothesDto {
  @IsOptional()
  @IsEnum(ClothesCategory)
  category?: ClothesCategory;

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
  @IsEnum(ClothesStatus)
  status?: ClothesStatus;
}
