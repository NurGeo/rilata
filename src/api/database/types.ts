/* eslint-disable @typescript-eslint/no-unused-vars */
import { DTO } from '../../domain/dto.js';
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
