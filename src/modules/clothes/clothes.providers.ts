import { Clothes } from 'src/entities/clothe.entity';
import { DataSource } from 'typeorm';

export const ClothesProviders = [
  {
    provide: 'CLOTHES_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Clothes),
    inject: ['DATA_SOURCE'],
  },
];
