import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';

export const AuthProviders = [
  {
    provide: 'AUTH_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
];
