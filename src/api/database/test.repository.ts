import { DTO } from '../../domain/dto.js';
import { Asyncable } from './types.js';

export interface TestRepository<
  TABLE_NAME extends string, RECORDS extends DTO, ASYNC extends boolean
> {
  tableName: TABLE_NAME,

  addBatch(records: RECORDS[]): Asyncable<ASYNC, void>

  clear(): Asyncable<ASYNC, void>
}
