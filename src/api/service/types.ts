/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
import { Result } from '../../core/result/types.js';
import {
  DomainAttrs, EventDod,
  GeneralArParams,
  GeneralErrorDod, GeneralEventDod, GeneralRequestDod, SimpleARDT,
} from '../../domain/domain-data/domain-types.js';
import { DtoFieldValidator } from '../../domain/validator/field-validator/dto-field-validator.js';
import { GeneralModuleResolver, GetModuleResolves } from '../module/types.js';
import { ServiceBaseErrors } from './error-types.js';
import { QueryService } from './concrete-service/query.service.js';
import { CommandService } from './concrete-service/command.service.js';
import { EventService } from './concrete-service/event.service.js';
import { ResultDTO } from '../controller/types.js';

export type AppEventType = 'command-event' | 'read-module' | 'event';

export type BaseServiceParams<
  S_NAME extends string,
  AR_PARAMS extends GeneralArParams,
  IN extends GeneralRequestDod | GeneralEventDod, // что входит в service,
  SUCCESS_OUT, // ответ клиенту в случае успеха
  FAIL_OUT, // возвращаемый ответ в случае не успеха
  EVENTS, // публикуемые доменные события
> = {
  serviceName: S_NAME,
  aRootName: AR_PARAMS['meta']['name'],
  input: IN,
  successOut: SUCCESS_OUT,
  errors: FAIL_OUT,
  events: EVENTS
}

export type GeneralBaseServiceParams = BaseServiceParams<
  string, GeneralArParams, GeneralRequestDod | GeneralEventDod, unknown, unknown, unknown
>

export type QueryServiceParams<
  S_NAME extends string,
  AR_PARAMS extends GeneralArParams,
  REQ_DOD extends GeneralRequestDod, // что входит в service,
  SUCCESS_OUT, // ответ клиенту в случае успеха
  FAIL_OUT extends GeneralErrorDod, // возвращаемый ответ в случае не успеха
> = BaseServiceParams<
  S_NAME, AR_PARAMS, REQ_DOD, SUCCESS_OUT, FAIL_OUT, never
>
export type GeneralQueryServiceParams = QueryServiceParams<
  string, GeneralArParams, GeneralRequestDod, unknown, GeneralErrorDod
>;

export type GeneraQueryService = QueryService<GeneralQueryServiceParams, GeneralModuleResolver>;

export type CommandServiceParams<
  S_NAME extends string,
  AR_PARAMS extends GeneralArParams,
  REQ_DOD extends GeneralRequestDod, // что входит в service,
  SUCCESS_OUT, // ответ в случае успеха
  FAIL_OUT extends GeneralErrorDod, // доменные ошибки при выполнении запроса
  EVENTS extends EventDod<string, S_NAME, string, DomainAttrs, SimpleARDT>[], // публикуемые доменные события
> = BaseServiceParams<
  S_NAME, AR_PARAMS, REQ_DOD, SUCCESS_OUT, FAIL_OUT, EVENTS
>

export type GeneralCommandServiceParams = CommandServiceParams<
  string, GeneralArParams, GeneralRequestDod, unknown, GeneralErrorDod, GeneralEventDod[]
>;

export type GeneralCommandService = CommandService<
  GeneralCommandServiceParams, GeneralModuleResolver
>;

export type EventServiceParams<
  S_NAME extends string,
  AR_PARAMS extends GeneralArParams,
  EVENT_DOD extends GeneralEventDod, // входящее событие,
  EVENTS extends EventDod<string, S_NAME, string, DomainAttrs, SimpleARDT>[], // публикуемые доменные события
> = BaseServiceParams<S_NAME, AR_PARAMS, EVENT_DOD, void, never, EVENTS>

export type GeneralEventServiceParams =
  EventServiceParams<string, GeneralArParams, GeneralEventDod, GeneralEventDod[]>

export type GeneralEventService = EventService<
  GeneralEventServiceParams, GeneralModuleResolver
>;

export type InputDodValidator<
  DOD extends GeneralRequestDod | GeneralEventDod
> = DtoFieldValidator<
    DOD['meta']['name'],
    true, false,
    DOD['attrs']
  >

export type ServiceResult<P extends GeneralBaseServiceParams> =
  Result<P['errors'], P['successOut']>

export type FullServiceResult<
  P extends GeneralBaseServiceParams
> = Result<P['errors'] | ServiceBaseErrors, P['successOut']>

export type FullServiceResultDTO<
  P extends GeneralQueryServiceParams | GeneralCommandServiceParams
> = ResultDTO<P['errors'] | ServiceBaseErrors, P['successOut']>

export type GetModuleName<RES extends GeneralModuleResolver> = GetModuleResolves<RES>['moduleName']
