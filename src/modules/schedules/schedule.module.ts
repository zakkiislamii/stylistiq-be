import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ScheduleProviders } from './schedule.providers';
import { ScheduleRepository } from './schedule.repository';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [DatabaseModule],
  providers: [...ScheduleProviders, ScheduleRepository, ScheduleService],
  exports: [ScheduleService, ScheduleRepository],
})
export class ScheduleModule {}
