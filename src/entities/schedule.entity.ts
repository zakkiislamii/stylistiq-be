import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinColumn,
  Timestamp,
} from 'typeorm';
import { User } from './user.entity';
import { Clothes } from './clothe.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'date', nullable: true })
  reminder?: Timestamp;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Timestamp;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Timestamp;

  @ManyToOne(() => User, (user) => user.schedules)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Clothes, (clothe) => clothe.schedules)
  clothes: Clothes[];
}
