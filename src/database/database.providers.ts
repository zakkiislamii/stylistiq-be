import { Env } from 'src/config/env.config';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: Env.DB_TYPE,
        host: Env.DB_HOST,
        port: Env.DB_PORT,
        username: Env.DB_USERNAME,
        password: Env.DB_PASSWORD,
        database: Env.DB_NAME,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: Env.NODE_ENV === 'dev' ? true : false,
      });
      return dataSource.initialize();
    },
  },
];
