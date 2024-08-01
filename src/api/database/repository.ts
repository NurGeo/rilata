import { MaybePromise } from '#core/types.js';
import { DatabaseServiceStatus } from './types.ts';

export interface Repository<
  T_NAME extends string,
  REC extends Record<string, unknown>
> {
  tableName: T_NAME

  isCreated(): MaybePromise<boolean>

  create(): MaybePromise<void>

  getMigrateStatus(): MaybePromise<DatabaseServiceStatus | 'notRequired'>

  migrate(): MaybePromise<void>

  clear(): MaybePromise<void>

  addBatch(records: REC[]): MaybePromise<void>
}
