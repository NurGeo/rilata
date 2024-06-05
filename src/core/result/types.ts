/* eslint-disable @typescript-eslint/no-unused-vars */
import { Failure } from './failure.js';
import { Success } from './success.js';

// ----------- ResultType -------------
/** Основной тип Result */
export type Result<F, S> = Failure<F, S> | Success<F, S>;

/** Тип позволяет работать без дженериков в местах где это необходимо */
export type GeneralResult = Result<unknown, unknown>;
