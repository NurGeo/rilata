/* eslint-disable @typescript-eslint/no-unused-vars */
import { DTO } from '../../domain/dto.js';
import { Database } from './database.ts';
import { Repository } from './repository.ts';

export type BusPayloadAsJson = string;

export type Asyncable<ASYNC extends boolean, T> = ASYNC extends true ? Promise<T> : T;

type GetRepoRecord<R extends Repository<string, DTO>> =
  R extends Repository<infer _, infer REC> ? REC : never

export type BatchRecords<R extends Repository<string, DTO>> =
  Record<R['tableName'], GetRepoRecord<R>[]>

export type DatabaseServiceStatus = 'complete' | 'partial' | 'none';

export type DatabaseServiceRow = {
  moduleName: string,
  db: Database,
}

export type SqlMethod = 'run' | 'get' | 'all';

export type Args = Record<string, string>;
