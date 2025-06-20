import {
  Entity,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Collection } from './collection.entity';
import { Clothes } from './clothe.entity';

@Entity('clothes_collections')
export class ClothesCollection {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => Collection, (collection) => collection.clothesCollections)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => Clothes, (clothe) => clothe.clothesCollections)
  @JoinColumn({ name: 'clothe_id' })
  clothe: Clothes;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
