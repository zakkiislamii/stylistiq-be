import { Module } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ELASTIC_SEARCH_URL } from 'src/configs/env.config';
import { SearchService } from './elasticClothesSearch.service';
@Module({
  providers: [
    SearchService,
    {
      provide: 'ELASTICSEARCH_CLIENT',
      useFactory: () => {
        return new Client({
          node: ELASTIC_SEARCH_URL,
        });
      },
    },
  ],
  exports: [SearchService],
})
export class ElasticSearchModule {}
