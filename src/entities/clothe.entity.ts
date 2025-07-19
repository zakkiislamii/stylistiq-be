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
import { ClothesCategory } from 'src/contracts/enums/clothesCategory.enum';
import { Collection } from './collection.entity';
import { ClothesStatus } from 'src/contracts/enums/clothesStatus.enum';

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

  @Column({ name: 'item_type', type: 'varchar', nullable: true })
  itemType?: string | null;

  @Column({ name: 'color', type: 'varchar', nullable: true })
  color?: string | null;

  @Column({ name: 'image', type: 'varchar', nullable: true })
  image?: string | null;

  @Column({ name: 'note', type: 'varchar', nullable: true })
  note?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ClothesStatus,
    default: ClothesStatus.DIMILIKI,
  })
  status: ClothesStatus;

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
  schedules?: Schedule[] | null;

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
  collections?: Collection[] | null;
}
