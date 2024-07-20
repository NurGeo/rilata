import { Database } from './database.ts';
import { ServiceDatabase } from './service.database.ts';
import { TestDatabase } from './test.database.ts';

export interface FullDatabase extends
  Database,
  TestDatabase,
  ServiceDatabase {}
