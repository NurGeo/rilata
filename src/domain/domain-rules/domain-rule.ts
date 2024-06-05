import { Result } from '../../core/result/types.js';
import { GeneralErrorDod } from '../domain-data/domain-types.js';

/** Правила предметной области которые могут заблокировать выполнение запроса */
export interface DomainRule {
  check(...args: unknown[]): Result<GeneralErrorDod, undefined>;
}
