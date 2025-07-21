import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client, estypes } from '@elastic/elasticsearch';
import { ElasticClothesDocument } from '../clothes/dto/elasticClothesDocument.dto';
import { PaginationClothesDto } from '../clothes/dto/paginationClothes,dto';
import { SearchClothesDto } from '../clothes/dto/searchClothes.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject('ELASTICSEARCH_CLIENT') private readonly esClient: Client,
  ) {}

  async indexClothes(
    index: string,
    id: string,
    document: ElasticClothesDocument,
  ) {
    return this.esClient.index({
      index,
      id,
      document,
      refresh: true,
    });
  }

  async searchClothes(index: string, query: estypes.QueryDslQueryContainer) {
    const searchRequest: estypes.SearchRequest = {
      index,
      query,
    };
    return this.esClient.search(searchRequest);
  }

  async searchMultiTerm(
    index: string,
    userId: string,
    searchDto: SearchClothesDto,
  ) {
    const terms = searchDto.q?.trim() ?? '';
    const page = searchDto?.page ?? 1;
    const limit = searchDto?.limit ?? 10;
    const from = (page - 1) * limit;

    const mustClauses: estypes.QueryDslQueryContainer[] = [
      {
        term: {
          'userId.keyword': {
            value: userId,
          },
        },
      },
    ];

    if (terms) {
      mustClauses.push({
        multi_match: {
          query: terms,
          fields: ['category', 'itemType', 'color', 'note'],
          type: 'best_fields',
          fuzziness: 'AUTO',
          operator: 'or',
        },
      });
    }

    const query: estypes.QueryDslQueryContainer = {
      bool: {
        must: mustClauses,
      },
    };

    const searchRequest: estypes.SearchRequest = {
      index,
      query,
      from,
      size: limit,
    };

    return this.esClient.search(searchRequest);
  }

  async updateClothes(
    index: string,
    id: string,
    partialDocument: ElasticClothesDocument,
  ) {
    return this.esClient.update({
      index,
      id,
      doc: partialDocument,
      refresh: true,
    });
  }

  async deleteClothes(index: string, id: string) {
    return this.esClient.delete({
      index,
      id,
    });
  }

  async deleteClothesByQuery(
    index: string,
    query: estypes.QueryDslQueryContainer,
  ) {
    return this.esClient.deleteByQuery({
      index,
      query,
    });
  }
}
