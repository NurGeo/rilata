export type { DTO } from './dto.js';
export type { Locale, LocaleHint } from './locale.js';
export type {
  ARDT, DodType, ErrorDod, EventDod, ErrorType,
  DomainMeta, RequestDod, SimpleARDT, DomainAttrs,
  GeneralARDT, GeneralArParams, GeneralErrorDod, GeneralEventDod,
  GeneralRequestDod, AggregateRootParams,
} from './domain-data/domain-types.js';
export type {
  GeneralAR, GetARParams, RoleAttrs, GroupRoleAttrs,
} from './domain-object/types.js';
export * from './domain-object/domain-object.js';
export * from './domain-object/aggregate-root.js';
export * from './domain-object/aggregate-helper.js';
export * from './domain-object/aggregate-factory.js';
export * from './domain-object/role/role.js';
export * from './domain-object/role/group-role.js';
