import { UuidType } from '../../../../../src/core/types.js';
import { AggregateRootParams, ARDT, DomainMeta } from '../../../../../src/domain/domain-data/domain-types.js';

export type UserAttrs = {
  userId: UuidType,
  personIin: string,
}

export type UserMeta = DomainMeta<'UserAR', 'userId'>;

export type UserParams = AggregateRootParams<
  UserAttrs, UserMeta, never, []
>;

export type UserARDT = ARDT<UserAttrs, UserMeta, []>;
