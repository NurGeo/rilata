/* eslint-disable @typescript-eslint/no-unused-vars */
import { TupleToUnion } from '#core/tuple-types.js';
import { DTO } from '../../domain/dto.js';
import { suppliesCommands } from './db-manager.ts';
import { ServiceDatabase } from './service.database.ts';
import { TestRepository } from './test.repository.js';

export type BusPayloadAsJson = string;

export type Asyncable<ASYNC extends boolean, T> = ASYNC extends true ? Promise<T> : T;

type GetTestRepoName<R extends TestRepository<string, DTO>> =
  R extends TestRepository<infer N, infer _> ? N : never

type GetTestRepoRecord<R extends TestRepository<string, DTO>> =
  R extends TestRepository<infer _, infer REC> ? REC : never

export type TestBatchRecords<R extends TestRepository<string, DTO>> =
  Record<GetTestRepoName<R>, GetTestRepoRecord<R>[]>

export type DatabaseServiceStatus = 'complete' | 'partial' | 'none';

export type DatabaseServiceRow = Array<{
  moduleName: string,
  db: ServiceDatabase,
}>

export type ServiceCommands = TupleToUnion<typeof suppliesCommands>;

export type SqlMethod = 'run' | 'get' | 'all';

export type Args = Record<string, string>;
