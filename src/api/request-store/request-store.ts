/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AssertionException } from '../../core/exeptions.js';
import { Storagable } from './storable.ts';
import { WebReqeustStorePayload } from './types.js';

function getId(): string {
  let result = '';

  for (const segmentLength of [2, 4, 4]) {
    for (let i = 0; i < segmentLength; i += 1) {
      result += Math.floor(Math.random() * 16).toString(16);
    }
    result += '-';
  }

  return result.slice(0, -1);
}

/**
  Оберка над asyncLocalStorage.
  В момент выполнения запроса, все что находится "ниже" сервиса может получить через
  данный диспетчер доступ к контексту запроса.
  Должен использоваться только в объектах которые гарантированно будут работать только
  в бэкенд части. Для остальных случаев необходимо использовать DomainStoreDispatcher.

  Данный диспетчер тажке позволяет в момент выполнения тестов установить заглушку пустышку
  через метод setStore и тестировать различные тестовые ситуации.
  */
export class RequestStore {
  private requestStore!: Storagable;

  id = getId();

  setStorage(store: Storagable): void {
    this.requestStore = store;
  }

  getStorage(): Storagable {
    return this.requestStore;
  }

  getPayload<T extends WebReqeustStorePayload>(): T {
    const payload = this.requestStore?.getStore();
    if (!payload) throw new AssertionException('not found async local storage store');
    return payload as T;
  }
}

// гарантируем синглтон через global;
export const requestStore: RequestStore = (globalThis as any).requestStore || new RequestStore();
(globalThis as any).requestStore = requestStore;
