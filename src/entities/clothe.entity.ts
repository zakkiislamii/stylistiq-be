import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Schedule } from './schedule.entity';
import { ClothesCategory } from 'src/common/enums/clothes_category.enum';
import { Collection } from './collection.entity';

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

  @ManyToMany(() => Schedule, (schedule) => schedule.clothes)
  @JoinTable({
    name: 'clothes_schedules',
    joinColumn: {
      name: 'clothe_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'schedule_id',
      referencedColumnName: 'id',
    },
  })
  schedules: Schedule[];

  @ManyToMany(() => Collection, (collection) => collection.clothes)
  @JoinTable({
    name: 'clothes_collections',
    joinColumn: {
      name: 'clothe_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'collection_id',
      referencedColumnName: 'id',
    },
  })
  collections: Collection[];
}
