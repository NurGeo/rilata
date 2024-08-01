import { DomainStorePayload } from './types.js';

/**
  Доставляет до доменного слоя технические объекты.
  Должна быть реализована и во фронтэнд и в бэкенда частях,
  так как доменные объекты могут использоваться в обеих частях приложения.
  */
export class DomainStore {
  private payload!: DomainStorePayload;

  getPayload<P extends DomainStorePayload>(): P {
    if (this.payload === undefined) throw Error(`not inited "${this.constructor.name}" store dispatcher`);
    return this.payload as P;
  }

  setPaylod(payload: DomainStorePayload): void {
    this.payload = payload;
  }
}

// гарантируем синглтон через global;
export const domainStore = (globalThis as any).domainStore || new DomainStore();
(globalThis as any).domainStore = domainStore;
