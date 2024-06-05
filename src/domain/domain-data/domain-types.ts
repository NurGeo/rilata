/* eslint-disable no-use-before-define */
import { Caller } from '../../api/controller/types.js';
import { ExcludeDeepDotNotationAttrs, GetDtoKeysByDotNotation } from '../../core/type-functions.js';
import { UuidType } from '../../core/types.js';
import { DTO } from '../dto.js';
import { Locale } from '../locale.js';

// ++++++++++ Domain Object Data - DOD ++++++++++

export type DomainAttrs = DTO;

export type DodType = 'aggregate' | 'event' | 'error' | 'request';

export type ErrorType = 'domain-error' | 'app-error';

export type DomainMeta<
  NAME extends string,
  ID_NAME extends string,
> = {
  name: NAME,
  idName: ID_NAME,
  domainType: 'aggregate',
  version: number,
}

/** полное описание доменного агрегата */
export type AggregateRootParams<
  ATTRS extends DomainAttrs,
  META extends DomainMeta<string, keyof ATTRS & string>,
  EVENTS extends GeneralEventDod,
  NO_OUT_KEYS extends GetDtoKeysByDotNotation<ATTRS>[]
> = {
  attrs: ATTRS,
  meta: META,
  events: EVENTS[],
  noOutKeys: NO_OUT_KEYS
}

export type GeneralArParams = AggregateRootParams<
  DomainAttrs, DomainMeta<string, string>, GeneralEventDod, string[]
>;

export type ARDT<
  ATTRS extends DTO,
  META extends DomainMeta<string, keyof ATTRS & string>,
  NO_OUT_KEYS extends GetDtoKeysByDotNotation<ATTRS>[]
> = {
  attrs: ExcludeDeepDotNotationAttrs<ATTRS, NO_OUT_KEYS>,
  meta: META,
}

export type GeneralARDT = ARDT<DTO, DomainMeta<string, string>, string[]>

export type ErrorDod<
  NAME extends string,
  LOCALE extends Locale<NAME>,
  TYPE extends ErrorType = 'domain-error'
> = {
  locale: LOCALE,
  name: NAME,
  meta: {
    domainType: 'error',
    errorType: TYPE,
  }
}

export type GeneralErrorDod = ErrorDod<string, Locale, ErrorType>;

export type SimpleARDT = {
  attrs: DTO,
  meta: DomainMeta<string, string>,
}

export type EventDod<
  NAME extends string,
  S_NAME extends string,
  M_NAME extends string,
  ATTRS extends DTO,
  ARDTF extends SimpleARDT,
  CALLER extends Caller = Caller
> = {
  attrs: ATTRS,
  meta: {
    eventId: UuidType,
    requestId: UuidType,
    name: NAME,
    moduleName: M_NAME,
    serviceName: S_NAME,
    domainType: 'event',
    created: number,
  }
  caller: CALLER,
  aRoot: ARDTF,
}

export type GeneralEventDod = EventDod<
  string, string, string, DTO, SimpleARDT
>;

export type RequestDod<NAME extends string, ATTRS extends DTO> = {
  meta: {
    name: NAME,
    requestId: UuidType,
    domainType: 'request',
  },
  attrs: ATTRS,
}

export type GeneralRequestDod = RequestDod<string, DTO>;
