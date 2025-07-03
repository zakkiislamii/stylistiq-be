import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ClothesProviders } from './clothes.providers';
import { ClothesService } from './clothes.service';
import { ClothesRepository } from './clothes.repository';

@Module({
  imports: [DatabaseModule],
  providers: [...ClothesProviders, ClothesRepository, ClothesService],
  exports: [ClothesService, ClothesRepository],
})
export class ClothesModule {}
