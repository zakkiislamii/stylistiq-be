import { Injectable, Logger } from '@nestjs/common';
import { SearchService } from './elasticClothesSearch.service';
import { ClothesService } from '../clothes/clothes.service';
import { UserService } from '../user/user.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ElasticClothesDocument } from '../clothes/dto/elasticClothesDocument.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private readonly clothesIndex = 'clothes-index';

  constructor(
    private readonly searchService: SearchService,
    private readonly clothesService: ClothesService,
    private readonly usersService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log(
      'Starting scheduled sync between database and Elasticsearch...',
    );
    await this.syncAllClothesData();
    this.logger.log('Scheduled sync finished.');
  }

  private async syncAllClothesData() {
    try {
      const users = await this.usersService.findAll();
      if (!users || users.length === 0) {
        this.logger.log('No users found to sync.');
        return;
      }

      for (const user of users) {
        this.logger.log(`Syncing data for user: ${user.id}`);
        const clothesFromDb = await this.clothesService.findByUser(user.id);
        const clothesIdsFromDb = new Set(clothesFromDb.map((c) => c.id));
        const searchResult = await this.searchService.searchMultiTerm(
          this.clothesIndex,
          user.id,
          {},
        ); // Fetch all docs
        const clothesInEs = searchResult.hits.hits;

        const clothesToDelete: string[] = [];
        for (const esDoc of clothesInEs) {
          if (esDoc._id && !clothesIdsFromDb.has(esDoc._id)) {
            clothesToDelete.push(esDoc._id);
          }
        }

        for (const clothId of clothesToDelete) {
          await this.searchService.deleteClothes(this.clothesIndex, clothId);
          this.logger.log(
            `Deleted orphan cloth [${clothId}] from ES for user [${user.id}]`,
          );
        }

        const elasticDocuments: ElasticClothesDocument[] = clothesFromDb.map(
          (cloth) => {
            return {
              id: cloth.id,
              category: cloth.category,
              itemType: cloth.itemType,
              color: cloth.color,
              note: cloth.note,
              status: cloth.status,
              image: cloth.image,
              userId: cloth.user.id,
            };
          },
        );

        if (elasticDocuments.length > 0) {
          await this.searchService.bulkIndexClothes(
            this.clothesIndex,
            elasticDocuments,
          );
          this.logger.log(
            `Successfully indexed ${elasticDocuments.length} documents for user ${user.id}`,
          );
        } else {
          this.logger.log(`No clothes found in DB for user ${user.id}.`);
        }
      }
    } catch (error) {
      this.logger.error('Error during data synchronization', error.stack);
    }
  }
}
