import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Timestamp,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_body_profiles')
export class UserBodyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'chest_circumference', type: 'float', nullable: true })
  chestCircumference?: number;

  @Column({ type: 'float', nullable: true, name: 'waist_circumference' })
  waistCircumference?: number;

  @Column({ type: 'float', nullable: true, name: 'hip_circumference' })
  hipCircumference?: number;

  @Column({ type: 'float', nullable: true, name: 'shoulder_width' })
  shoulderWidth?: number;

  @Column({ type: 'float', nullable: true, name: 'arm_length' })
  armLength?: number;

  @Column({ type: 'float', nullable: true, name: 'leg_length' })
  legLength?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Timestamp;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Timestamp;

  @Column({ type: 'float', nullable: true })
  height?: number;

  @Column({ type: 'float', nullable: true })
  weight?: number;

  @OneToOne(() => User, (user) => user.bodyProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
