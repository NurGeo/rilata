import { DomainStorePayload } from './types.js';

/**
  Доставляет до доменного слоя технические объекты.
  Должна быть реализована и во фронтэнд и в бэкенда частях,
  так как доменные объекты могут использоваться в обеих частях приложения.
  */
export class DomainStoreDispatcher<P extends DomainStorePayload> {
  private payload!: P;

  getPayload(): P {
    if (this.payload === undefined) throw Error(`not inited "${this.constructor.name}" store dispatcher`);
    return this.payload;
  }

  setPaylod(payload: P): void {
    this.payload = payload;
  }
}

export const domainStoreDispatcher = new DomainStoreDispatcher();
