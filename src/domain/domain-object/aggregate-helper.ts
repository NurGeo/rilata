import { UuidType } from '../../core/types.js';
import { dtoUtility } from '../../core/utils/dto/dto-utility.js';
import { ARDT, GeneralArParams, GeneralEventDod } from '../domain-data/domain-types.js';
import { Logger } from '../../core/logger/logger.js';
import { Caller } from '../../api/controller/types.js';
import { dodUtility } from '../../core/utils/dod/dod-utility.js';
import { GetArrayType } from '../../core/type-functions.js';
import { domainStoreDispatcher } from '../../core/index.js';

/** Класс помощник агрегата. Забирает себе всю техническую работу агрегата,
    позволяя агрегату сосредоточиться на решении логики предметного уровня. */
export class AggregateRootHelper<PARAMS extends GeneralArParams> {
  private domainEvents: PARAMS['events'] = [];

  constructor(
    protected attrs: PARAMS['attrs'],
    protected aRootName: PARAMS['meta']['name'],
    protected idName: keyof PARAMS['attrs'] & string,
    protected version: number,
    protected outputExcludeAttrs: PARAMS['noOutKeys'],
  ) {
    this.validateVersion();
  }

  getMeta(): PARAMS['meta'] {
    return {
      name: this.aRootName,
      idName: this.idName,
      domainType: 'aggregate',
      version: this.version,
    };
  }

  // @ts-expect-error
  getOutput(): ARDT<PARAMS['attrs'], PARAMS['meta'], PARAMS['noOutKeys']> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs = dtoUtility.excludeDeepAttrs(this.attrs, this.outputExcludeAttrs) as any;
    return {
      attrs,
      meta: this.getMeta(),
    };
  }

  getVersion(): number {
    return this.version;
  }

  getId(): string {
    return this.attrs[this.idName];
  }

  getName(): string {
    return this.aRootName;
  }

  getLogger(): Logger {
    return domainStoreDispatcher.getPayload().logger;
  }

  registerEvent<EVENTS extends GetArrayType<PARAMS['events']>>(
    eventName: EVENTS['meta']['name'],
    eventAttrs: EVENTS['attrs'],
    requestId?: UuidType,
    caller?: Caller,
  ): void {
    const event: GeneralEventDod = dodUtility.getEventDod(
      eventName, eventAttrs, this.getOutput() as EVENTS['aRoot'], { requestId, caller },
    );
    this.domainEvents.push(event as EVENTS);
  }

  getEvents(): PARAMS['events'] {
    return this.domainEvents;
  }

  cleanEvents(): void {
    this.domainEvents = [];
  }

  private validateVersion(): void {
    if (typeof this.version !== 'number' || this.version < 0) {
      throw this.getLogger().error(
        `not valid version for aggregate ${this.aRootName}`,
        { aRootName: this.aRootName, version: this.version },
      );
    }
  }
}
