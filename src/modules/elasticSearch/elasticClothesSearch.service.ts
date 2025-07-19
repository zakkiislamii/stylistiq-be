// import { Inject, Injectable, Logger } from '@nestjs/common';
// import { Client, estypes } from '@elastic/elasticsearch';
// import { ElasticClothesDocument } from '../clothes/dto/elasticClothesDocument.dto';

// @Injectable()
// export class SearchService {
//   private readonly logger = new Logger(SearchService.name);

//   constructor(
//     @Inject('ELASTICSEARCH_CLIENT') private readonly esClient: Client,
//   ) {}

//   /**
//    * Indexes a new document or overwrites an existing one.
//    * @param index The name of the index.
//    * @param id The unique ID for the document.
//    * @param document The document body to index.
//    */
//   async indexClothes(
//     index: string,
//     id: string,
//     document: ElasticClothesDocument,
//   ) {
//     return this.esClient.index({
//       index,
//       id,
//       document,
//       refresh: true,
//     });
//   }

//   /**
//    * Searches for documents in an index.
//    * @param index The name of the index.
//    * @param query The Elasticsearch query container.
//    */
//   async searchClothes(index: string, query: estypes.QueryDslQueryContainer) {
//     const searchRequest: estypes.SearchRequest = {
//       index,
//       query,
//     };
//     return this.esClient.search(searchRequest);
//   }

//   /**
//    * Partially updates an existing document.
//    * @param index The name of the index.
//    * @param id The ID of the document to update.
//    * @param partialDocument The partial document containing fields to update.
//    */
//   async updateClothes(
//     index: string,
//     id: string,
//     partialDocument: ElasticClothesDocument,
//   ) {
//     return this.esClient.update({
//       index,
//       id,
//       doc: partialDocument,
//       refresh: true,
//     });
//   }

//   /**
//    * Deletes a document from an index.
//    * @param index The name of the index.
//    * @param id The ID of the document to delete.
//    */
//   async deleteClothes(index: string, id: string) {
//     return this.esClient.delete({
//       index,
//       id,
//     });
//   }

//   /**
//    * Deletes documents from an index based on a query.
//    * This is useful for deleting multiple documents that share a common field, like a userId.
//    * @param index The name of the index.
//    * @param query The Elasticsearch query container.
//    */
//   async deleteClothesByQuery(
//     index: string,
//     query: estypes.QueryDslQueryContainer,
//   ) {
//     return this.esClient.deleteByQuery({
//       index,
//       query,
//     });
//   }
// }
