import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw,
  Repository,
} from 'typeorm';
import { Schedule } from 'src/entities/schedule.entity';
import { CreateScheduleDto } from './dto/createSchedule.dto';
import { UpdateScheduleDto } from './dto/updateSchedule.dto';
import { DeleteScheduleDto } from './dto/deleteSchedule.dto';
import { User } from 'src/entities/user.entity';
import { Clothes } from 'src/entities/clothe.entity';
import { PaginationScheduleDto } from './dto/paginationSchedule.dto';

@Injectable()
export class ScheduleRepository {
  constructor(
    @Inject('SCHEDULE_REPOSITORY')
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async findById(scheduleId: string): Promise<Schedule | null> {
    return this.scheduleRepository.findOneOrFail({
      where: { id: scheduleId },
      relations: ['user', 'clothes'],
    });
  }

  async findByUser(
    paginationDto: PaginationScheduleDto,
    userId: string,
  ): Promise<Schedule[]> {
    const { startDate, endDate } = paginationDto;

    const where: FindOptionsWhere<Schedule> = {
      user: { id: userId },
    };

    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = Between(startOfDay, endOfDay);
    } else if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);

      where.date = MoreThanOrEqual(startOfDay);
    } else if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = LessThanOrEqual(endOfDay);
    }

    return this.scheduleRepository.find({
      where,
      relations: ['user', 'clothes'],
    });
  }

  async findByDate(userId: string, date: string): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: {
        user: { id: userId },
        // Use Raw to apply the DATE function to the timestamp column
        date: Raw((alias) => `DATE(${alias}) = :date`, { date }),
      },
      relations: ['user', 'clothes'],
    });
  }

  async createSchedule(
    userId: string,
    dto: CreateScheduleDto,
  ): Promise<Schedule> {
    const schedule = new Schedule();
    schedule.user = { id: userId } as User;
    schedule.date = new Date(dto.date);
    schedule.note = dto.note;
    schedule.reminder = dto.reminder ? new Date(dto.reminder) : undefined;

    if (dto.clothesIds && dto.clothesIds.length > 0) {
      schedule.clothes = dto.clothesIds.map((id) => ({ id: id }) as Clothes);
    } else {
      schedule.clothes = [];
    }

    const saved = await this.scheduleRepository.save(schedule);

    return this.scheduleRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['user', 'clothes'],
    });
  }

  async updateSchedule(
    scheduleId: string,
    userId: string,
    dto: UpdateScheduleDto,
  ): Promise<Schedule> {
    const existingSchedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, user: { id: userId } },
      relations: ['user', 'clothes'],
    });

    if (!existingSchedule) {
      throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
    }

    // 1. Destructure clothesIds from the DTO
    const { clothesIds, ...scheduleData } = dto;

    // 2. Merge only the schedule fields (like note, date)
    const updatedSchedule = this.scheduleRepository.merge(
      existingSchedule,
      scheduleData,
    );

    // 3. If new clothesIds are provided, update the relationship
    if (clothesIds) {
      updatedSchedule.clothes = clothesIds.map((id) => ({ id }) as Clothes);
    }

    await this.scheduleRepository.save(updatedSchedule);

    return this.scheduleRepository.findOneOrFail({
      where: { id: scheduleId },
      relations: ['user', 'clothes'],
    });
  }

  async deleteSchedule(
    userId: string,
    dto: DeleteScheduleDto,
  ): Promise<Schedule[]> {
    const schedulesToDelete = await this.scheduleRepository.find({
      where: {
        id: In(dto.scheduleIds),
        user: { id: userId },
      },
    });

    if (schedulesToDelete.length === 0) {
      throw new NotFoundException('No matching schedules found to delete');
    }

    return this.scheduleRepository.remove(schedulesToDelete);
  }
}
