import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ClothesCollection } from './clothe_collection.entity';

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

  @OneToMany(() => ClothesCollection, (cc) => cc.collection)
  clothesCollections: ClothesCollection[];

  @ManyToOne(() => User, (user) => user.collections)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
