/* eslint-disable @typescript-eslint/no-unused-vars */
import { uuidUtility } from '../../src/core/utils/uuid/uuid-utility.js';
import { GeneralModuleResolver } from '../../src/api/module/types.js';
import { CommandRequestStorePayload, RequestStorePayload, WebReqeustStorePayload } from '../../src/api/request-store/types.js';
import { requestStore } from '../../src/api/request-store/request-store.js';

export function requestStoreMock(
  store: Partial<CommandRequestStorePayload> & { resolver: GeneralModuleResolver},
  type: 'request' | 'commandRequest' = 'request',
): void {
  const requestPayload: RequestStorePayload = {
    caller: store.caller ?? {
      type: 'DomainUser',
      userId: 'fb8a83cf-25a3-2b4f-86e1-27f6de6d8374',
    },
    type: 'request',
    resolver: store.resolver,
    logger: store.resolver.getLogger(),
    requestId: store.requestId ?? uuidUtility.getNewUuidV4(),
    serviceName: store.serviceName ?? 'AddingUserService',
    moduleName: store.moduleName ?? 'SubjectModule',
  };

  const commandRequest: CommandRequestStorePayload = {
    ...requestPayload,
    type: 'commandRequest',
    databaseErrorRestartAttempts: store.databaseErrorRestartAttempts ?? 1,
    unitOfWorkId: store.unitOfWorkId,
  };

  requestStore.setStorage({
    getStore() {
      return type === 'request' ? requestPayload : commandRequest;
    },

    run <F, Fargs extends unknown[]>(
      s: WebReqeustStorePayload,
      fn: (...args: Fargs) => F,
      ...args: Fargs
    ): F {
      throw Error('Для тестовых моков данный метод не должен вызываться. При необходимости используйте настоящий store.');
    },
  });
}
