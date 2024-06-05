import { Caller } from '../../../api/controller/types.js';
import { requestStoreDispatcher } from '../../../api/request-store/request-store-dispatcher.js';
import { ValidationError } from '../../../api/service/error-types.js';
import { GeneralRequestDod, GeneralErrorDod, GeneralEventDod } from '../../../domain/domain-data/domain-types.js';
import { UuidType } from '../../types.js';
import { dtoUtility } from '../dto/dto-utility.js';
import { uuidUtility } from '../uuid/uuid-utility.js';

/** Утилита для работы с объектами DomainObjectData */
class DodUtility {
  getAppError<ERR extends GeneralErrorDod>(
    name: ERR['name'],
    text: ERR['locale']['text'],
    hint: ERR['locale']['hint'],
  ): ERR {
    return {
      locale: { text, hint, name },
      name,
      meta: {
        errorType: 'app-error',
        domainType: 'error',
      },
    } as ERR;
  }

  getDomainError<ERR extends GeneralErrorDod>(
    name: ERR['name'],
    text: ERR['locale']['text'],
    hint: ERR['locale']['hint'],
  ): ERR {
    return {
      locale: { text, hint, name },
      name,
      meta: {
        errorType: 'domain-error',
        domainType: 'error',
      },
    } as ERR;
  }

  getRequestDod<A extends GeneralRequestDod>(
    name: A['meta']['name'],
    attrs: A['attrs'],
    requestId?: UuidType,
  ): A {
    return {
      meta: {
        name,
        requestId: requestId ?? uuidUtility.getNewUUID(),
        domainType: 'request',
      },
      attrs,
    } as A;
  }

  getEventDod<E extends GeneralEventDod>(
    name: E['meta']['name'],
    attrs: E['attrs'],
    aRootAttrs: E['aRoot'],
    storeData?: {
      requestId?: E['meta']['requestId'],
      moduleName?: E['meta']['moduleName'],
      serviceName?: string,
      caller?: E['caller'],
    },
  ): E {
    return {
      attrs,
      meta: {
        eventId: uuidUtility.getNewUUID(),
        requestId: storeData?.requestId ?? this.getCurrentRequestId(),
        name,
        moduleName: storeData?.moduleName ?? this.getCurrentModuleName(),
        serviceName: storeData?.serviceName ?? this.getCurrentServiceName(),
        domainType: 'event',
        created: Date.now(),
      },
      caller: storeData?.caller ?? this.getCurrentCaller(),
      aRoot: aRootAttrs,
    } as E;
  }

  /** Перевыпустить событие. Используется для перевыпуска cmd события в read модуле. */
  regenerateEvent(
    event: GeneralEventDod,
    serviceName: string,
    moduleName: string,
    newName?: string,
  ): GeneralEventDod {
    return dtoUtility.replaceAttrs(event, {
      meta: {
        name: newName ?? event.meta.name,
        eventId: uuidUtility.getNewUUID(),
        moduleName,
        serviceName,
        created: Date.now(),
      },
    });
  }

  getValidationError<E extends ValidationError>(errors: E['errors']): E {
    return {
      errors,
      name: 'Validation error',
      meta: {
        domainType: 'error',
        errorType: 'app-error',
      },
    } as E;
  }

  protected getCurrentRequestId(): string {
    return requestStoreDispatcher.getPayload().requestId ?? this.throwErr('not read requesid from store');
  }

  protected getCurrentModuleName(): string {
    return requestStoreDispatcher.getPayload().moduleName ?? this.throwErr('not read moduleName from store');
  }

  protected getCurrentServiceName(): string {
    return requestStoreDispatcher.getPayload().serviceName ?? this.throwErr('not read serviceName from store');
  }

  protected getCurrentCaller(): Caller {
    return requestStoreDispatcher.getPayload().caller ?? this.throwErr('not read caller from store');
  }

  protected throwErr(errStr: string): never {
    throw requestStoreDispatcher.getPayload().moduleResolver
      ? requestStoreDispatcher.getPayload().moduleResolver.getLogger().error(errStr)
      : new Error(errStr);
  }
}

export const dodUtility = Object.freeze(new DodUtility());
