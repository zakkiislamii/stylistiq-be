import { IsEnum, IsString } from 'class-validator';
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';

export class ClothesAnalysisResult {
  @IsEnum(ClothesCategory)
  category: ClothesCategory;

  @IsString()
  itemType: string;

  @IsString()
  color: string;

  @IsString()
  image?: string;
}
