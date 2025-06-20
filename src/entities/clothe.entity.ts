import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ClothesCollection } from './clothe_collection.entity';
import { Schedule } from './schedule.entity';
import { ClothesCategory } from 'src/common/enums/clothes_category.enum';

@Entity('clothes')
export class Clothes {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => User, (user) => user.clothes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'category',
    type: 'enum',
    enum: ClothesCategory,
  })
  category: ClothesCategory;

  @Column({ name: 'item_type', nullable: true })
  itemType?: string;

  @Column({ name: 'color', nullable: true })
  color?: string;

  @Column({ name: 'image', nullable: true })
  image?: string;

  @Column({ name: 'note', nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.clothe)
  schedules: Schedule[];

  @OneToMany(() => ClothesCollection, (cc) => cc.clothe)
  clothesCollections: ClothesCollection[];
}
