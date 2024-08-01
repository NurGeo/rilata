/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { DomainStorePayload } from './types.js';

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
  Доставляет до доменного слоя технические объекты.
  Должна быть реализована и во фронтэнд и в бэкенда частях,
  так как доменные объекты могут использоваться в обеих частях приложения.
  */
class DomainStore {
  private payload!: DomainStorePayload;

  id = getId;

  getPayload<P extends DomainStorePayload>(): P {
    if (this.payload === undefined) throw Error(`not inited "${this.constructor.name}" store dispatcher`);
    return this.payload as P;
  }

  setPaylod(payload: DomainStorePayload): void {
    this.payload = payload;
  }
}

// гарантируем синглтон через global;
export const domainStore: DomainStore = (globalThis as any).domainStore || new DomainStore();
(globalThis as any).domainStore = domainStore;
