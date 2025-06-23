import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Timestamp,
} from 'typeorm';
import { Clothes } from './clothe.entity';
import { Schedule } from './schedule.entity';
import { Collection } from './collection.entity';
import { Gender } from 'src/contracts/enums/gender.enum';
import { UserBodyProfile } from './userBodyProfile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  age?: string;

  @Column({ type: 'float', nullable: true })
  height?: number;

  @Column({ type: 'float', nullable: true })
  weight?: number;

  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ nullable: true, name: 'profile_photo' })
  profilePhoto?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Timestamp;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Timestamp;

  @OneToMany(() => Clothes, (clothes) => clothes.user)
  clothes: Clothes[];

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedules: Schedule[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToOne(() => UserBodyProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn({ name: 'body_profile_id' })
  bodyProfile: UserBodyProfile;
}
