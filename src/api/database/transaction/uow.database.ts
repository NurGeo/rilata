import { UuidType } from '../../../core/types.js';
import { Database } from '../database.js';
import { Asyncable } from '../types.js';

type TransactionId = UuidType;

export interface UnitOfWorkDatabase<ASYNC extends boolean> extends Database {
  startTransaction(): Asyncable<ASYNC, TransactionId>

  commit(transactionId: TransactionId): Asyncable<ASYNC, void>

  rollback(transactionId: TransactionId): Asyncable<ASYNC, void>
}
