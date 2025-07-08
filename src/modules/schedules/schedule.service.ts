import { Injectable, NotFoundException } from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { Schedule } from 'src/entities/schedule.entity';
import { CreateScheduleDto } from './dto/createSchedule.dto';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';
import { DeleteScheduleDto } from './dto/deleteSchedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly scheduleRepository: ScheduleRepository) {}

  async findById(scheduleId: string, userId: string): Promise<Schedule | null> {
    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule || schedule.user.id !== userId) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async findByUser(userId: string): Promise<Schedule[]> {
    return this.scheduleRepository.findByUser(userId);
  }

  async findByDate(userId: string, date: string): Promise<Schedule[]> {
    return this.scheduleRepository.findByDate(userId, date);
  }

  async createSchedule(
    userId: string,
    dto: CreateScheduleDto,
  ): Promise<Schedule> {
    return this.scheduleRepository.createSchedule(userId, dto);
  }

  async updateSchedule(
    scheduleId: string,
    userId: string,
    dto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const schedule = await this.scheduleRepository.updateSchedule(
      scheduleId,
      userId,
      dto,
    );
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async deleteSchedule(
    userId: string,
    dto: DeleteScheduleDto,
  ): Promise<Schedule[]> {
    return this.scheduleRepository.deleteSchedule(userId, dto);
  }
}
