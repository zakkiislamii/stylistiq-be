import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client, estypes } from '@elastic/elasticsearch';
import { ElasticClothesDocument } from '../clothes/dto/elasticClothesDocument.dto';
import { PaginationClothesDto } from '../clothes/dto/paginationClothes,dto';
import { SearchClothesDto } from '../clothes/dto/searchClothes.dto';
import { getRandomValues, randomUUID } from 'crypto';

type BulkError = {
  status: number;
  error: estypes.ErrorCause;
  operation: any;
  document: any;
};

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
        bool: {
          should: [
            {
              prefix: {
                'itemType.keyword': {
                  value: terms,
                },
              },
            },
            {
              multi_match: {
                query: terms,
                fields: ['category', 'color', 'note'],
                type: 'best_fields',
                fuzziness: 'AUTO',
                operator: 'or',
              },
            },
          ],
          minimum_should_match: 1,
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

  async deleteUserClothes(index: string, userId: string) {
    this.logger.log(
      `Deleting all clothes from index [${index}] for user [${userId}]`,
    );
    return this.esClient.deleteByQuery({
      index,
      query: {
        term: {
          'userId.keyword': {
            value: userId,
          },
        },
      },
      refresh: true,
    });
  }

  async bulkIndexClothes(index: string, documents: ElasticClothesDocument[]) {
    if (documents.length === 0) {
      this.logger.log('No documents to bulk index.');
      return;
    }

    this.logger.log(
      `Bulk indexing ${documents.length} documents into index [${index}]`,
    );

    const operations = documents.flatMap((doc) => [
      { index: { _index: index, _id: doc.id ?? randomUUID() } },
      doc,
    ]);

    const bulkResponse = await this.esClient.bulk({
      refresh: true,
      operations,
    });

    if (bulkResponse.errors) {
      const erroredDocuments: BulkError[] = [];
      bulkResponse.items.forEach((action, i) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: operations[i * 2],
            document: operations[i * 2 + 1],
          });
        }
      });
      this.logger.error('Some documents failed to index', erroredDocuments);
    }

    return bulkResponse;
  }
}
