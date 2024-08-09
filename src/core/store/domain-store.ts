/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { ConsoleLogger } from '#core/logger/console-logger.js';
import { DomainStorePayload } from '../types.js';

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

  private setCount = 0;

  id = getId;

  getPayload<P extends DomainStorePayload>(): P {
    if (this.payload === undefined) throw Error('not inited store payload');
    return { ...this.payload } as P;
  }

  setPaylod(payload: DomainStorePayload): void {
    const logger = this.payload?.logger ?? payload?.logger ?? new ConsoleLogger('all');
    const runMode = this.payload?.runMode ?? payload?.runMode ?? 'prod';
    if (this.setCount > 0 && runMode !== 'test') {
      logger.warning(
        'domain payload repeated setted',
        { count: this.setCount, stack: Error().stack, old: this.payload, new: payload },
      );
    }
    this.payload = Object.freeze(payload);
    this.setCount += 1;
  }
}

// гарантируем синглтон через global;
export const domainStore: DomainStore = (globalThis as any).domainStore || new DomainStore();
(globalThis as any).domainStore = domainStore;
