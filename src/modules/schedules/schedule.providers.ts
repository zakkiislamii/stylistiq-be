import { Schedule } from 'src/entities/schedule.entity';
import { DataSource } from 'typeorm';

export const ScheduleProviders = [
  {
    provide: 'SCHEDULE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Schedule),
    inject: ['DATA_SOURCE'],
  },
];
