import { Database } from './database.ts';
import { ServiceDatabase } from './service.database.ts';
import { TestDatabase } from './test.database.ts';

export interface FullDatabase<R extends boolean> extends
  Database,
  TestDatabase<R>,
  ServiceDatabase {}
