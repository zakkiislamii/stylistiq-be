import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';

export class ClothesAnalysisResult {
  category: ClothesCategory;
  itemType: string;
  color: string;
  image?: string;
}
