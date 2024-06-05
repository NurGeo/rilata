/* eslint-disable @typescript-eslint/no-unused-vars */
import { DTO } from '../../domain/dto.js';
import { TestRepository } from './test.repository.js';

export type BusPayloadAsJson = string;

export type Asyncable<ASYNC extends boolean, T> = ASYNC extends true ? Promise<T> : T;

type GetTestRepoName<R extends TestRepository<string, DTO, boolean>> =
  R extends TestRepository<infer N, infer _, infer _> ? N : never

type GetTestRepoRecord<R extends TestRepository<string, DTO, boolean>> =
  R extends TestRepository<infer _, infer REC, infer _> ? REC : never

export type TestBatchRecords<R extends TestRepository<string, DTO, boolean>> =
  Record<GetTestRepoName<R>, GetTestRepoRecord<R>[]>
