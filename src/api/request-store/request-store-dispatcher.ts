import { AssertionException } from '../../core/exeptions.js';
import { RequestStorePayload, RequestStore } from './types.js';

/**
  Оберка над asyncLocalStorage.
  В момент выполнения запроса, все что находится "ниже" сервиса может получить через
  данный диспетчер доступ к контексту запроса.
  Должен использоваться только в объектах которые гарантированно будут работать только
  в бэкенд части. Для остальных случаев необходимо использовать DomainStoreDispatcher.

  Данный диспетчер тажке позволяет в момент выполнения тестов установить заглушку пустышку
  через метод setStore и тестировать различные тестовые ситуации.
  */
export class RequestStoreDispatcher<T extends RequestStorePayload> {
  private requestStore!: RequestStore<T>;

  setRequestStore(requestStore: RequestStore<T>): void {
    this.requestStore = requestStore;
  }

  getRequestStore(): RequestStore<T> {
    return this.requestStore;
  }

  getPayload(): T {
    const payload = this.requestStore?.getStore();
    if (!payload) throw new AssertionException('not found async local storage store');
    return payload;
  }
}

export const requestStoreDispatcher = new RequestStoreDispatcher<RequestStorePayload>();
