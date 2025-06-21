import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Clothes } from './clothe.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Timestamp;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Timestamp;

  @ManyToOne(() => User, (user) => user.collections)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Clothes, (clothes) => clothes.collections)
  clothes: Clothes[];
}
