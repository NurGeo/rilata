import { DelivererToBus } from '#api/bus/deliverer-to-bus.js';
import { DeliveryEvent, EventBodyType } from '#api/bus/types.js';
import { BusMessageRepository } from '#api/database/bus-message.repository.js';
import { EventRepository } from '#api/database/event.repository.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { GeneralArParams, GeneralEventDod } from '#domain/domain-data/domain-types.js';
import { BunSqliteRepository } from '../repository.js';
import { MigrateRow } from '../types.js';

export class EventRepositorySqlite
  extends BunSqliteRepository<'events', GeneralEventDod>
  implements EventRepository<false>, BusMessageRepository<false> {
  tableName = 'events' as const;

  migrationWRows: MigrateRow[] = [];

  protected delivererToBus?: DelivererToBus;

  create(): void {
    this.db.sqliteDb.run(
      `CREATE TABLE ${this.tableName} (
        id TEXT(36) PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        payload TEXT NOT NULL,
        requestId TEXT(36) NOT NULL,
        isPublished INTEGER NOT NULL CHECK (isPublished IN (0, 1)),
        aRootName TEXT NOT NULL,
        aRootId TEXT(36) NOT NULL
      );
      CREATE INDEX eventsReqIdIndex ON ${this.tableName} (requestId);
      CREATE INDEX eventsArootIdIndex ON ${this.tableName} (aRootId);
      CREATE INDEX eventsIsPblshIndex ON ${this.tableName} (isPublished) WHERE isPublished=0; `,
    );
  }

  addEvents(events: GeneralEventDod[]): void {
    const sql = `INSERT INTO ${this.tableName} VALUES ($id, $name, $pload, $reqId, 0, $aggName, $aggId)`;
    const addEvent = this.db.sqliteDb.prepare(sql);

    const addEventsTransaction = this.db.sqliteDb.transaction((tEvents: GeneralEventDod[]) => {
      tEvents.forEach((event) => {
        const attrs = {
          $id: event.meta.eventId,
          $name: event.meta.name,
          $pload: JSON.stringify(event),
          $reqId: event.meta.requestId,
          $aggName: event.aRoot.meta.name,
          $aggId: event.aRoot.attrs[event.aRoot.meta.idName],
        };
        addEvent.run(attrs);
      });
    });
    addEventsTransaction(events);
  }

  // eslint-disable-next-line max-len
  getAggregateEvents<A extends GeneralArParams>(aRootId: string): A['events'] {
    const sql = `SELECT payload FROM ${this.tableName} WHERE aRootId='${aRootId}'`;
    const plds = this.db.sqliteDb.prepare(sql).all() as { payload: string }[];
    return plds.map((pld) => JSON.parse(pld.payload)) as A['events'];
  }

  findEvent(id: string): GeneralEventDod | undefined {
    const sql = `SELECT payload FROM ${this.tableName} WHERE id='${id}'`;
    const result = this.db.sqliteDb.query(sql).get() as { payload: string } | undefined;
    if (!result) return undefined;
    return JSON.parse(result.payload);
  }

  isExist(id: string): boolean {
    const sql = `SELECT id FROM ${this.tableName} WHERE id='${id}'`;
    return Boolean(this.db.sqliteDb.query(sql).get());
  }

  getNotPublished(): DeliveryEvent[] {
    const sql = `SELECT id, name, payload, requestId, isPublished, aRootName, aRootId FROM ${this.tableName} WHERE isPublished=0`;
    const bodies = this.db.sqliteDb.query(sql).all() as EventBodyType[];
    return bodies.map((b) => dtoUtility.extendAttrs(b, { type: 'event' }));
  }

  markAsPublished(id: string): { count: number } {
    const sql = `UPDATE ${this.tableName} SET isPublished=1 WHERE id='${id}'`;
    this.db.sqliteDb.run(sql);
    return this.db.sqliteDb.query(`SELECT CHANGES() as count FROM ${this.tableName}`).get() as { count: number };
  }

  subscribe(delivererToBus: DelivererToBus): void {
    this.delivererToBus = delivererToBus;
  }
}
