import { Result } from './types.js';
import { Success } from './success.js';

export class Failure<F, S> {
  readonly value: F;

  constructor(value: F) {
    this.value = value;
  }

  isFailure(): this is Failure<F, S> {
    return true;
  }

  isSuccess(): this is Success<F, S> {
    return false;
  }
}

export const failure = <F, S>(l: F): Result<F, S> => new Failure(l);
