import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';
import { ClothesStatus } from 'src/contracts/enums/clothesStatus.enum';

export class ElasticClothesDocument {
  id?: string;
  category: ClothesCategory;
  itemType: string | null;
  color: string | null;
  note?: string | null;
  status: ClothesStatus;
  image?: string | null;
  userId: string;
}
