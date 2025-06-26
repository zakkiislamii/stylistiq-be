import { UserBodyProfile } from 'src/entities/userBodyProfile.entity';
import { DataSource } from 'typeorm';

export const UserBodyProfileProviders = [
  {
    provide: 'USER_BODY_PROFILE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UserBodyProfile),
    inject: ['DATA_SOURCE'],
  },
];
