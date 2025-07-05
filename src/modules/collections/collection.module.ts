import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CollectionProviders } from './collection.providers';
import { CollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';

@Module({
  imports: [DatabaseModule],
  providers: [...CollectionProviders, CollectionRepository, CollectionService],
  exports: [CollectionService, CollectionRepository],
})
export class CollectionModule {}
