import { Collection } from 'src/entities/collection.entity';
import { DataSource } from 'typeorm';

export const CollectionProviders = [
  {
    provide: 'COLLECTION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Collection),
    inject: ['DATA_SOURCE'],
  },
];
