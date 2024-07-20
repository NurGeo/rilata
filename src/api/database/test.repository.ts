import { MaybePromise } from '#core/types.js';
import { DTO } from '../../domain/dto.js';

export interface TestRepository<
  TABLE_NAME extends string, RECORDS extends DTO
> {
  tableName: TABLE_NAME,

  addBatch(records: RECORDS[]): MaybePromise<void>

  clear(): MaybePromise<void>
}
