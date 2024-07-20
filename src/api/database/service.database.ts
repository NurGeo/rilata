import { MaybePromise } from '#core/types.js';
import { DatabaseServiceStatus } from './types.ts';

export interface ServiceDatabase {
  createDb(): MaybePromise<void>

  migrateDb(): MaybePromise<void>

  creationStatus(): MaybePromise<DatabaseServiceStatus>

  migrationStatus(): MaybePromise<DatabaseServiceStatus>

  getStatusAsString(needPaint?: boolean): MaybePromise<string>
}
