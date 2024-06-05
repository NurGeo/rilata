import { UuidType } from '../../core/types.js';
import { BusPayloadAsJson } from '../database/types.js';

/** тип сообщения шины. Позволяет за разе подписаться на любое событие агрегата. */
export type BusMessageType = 'message' | 'event' | 'aggregate';

type SubcribeToMessageBody = {
  busMessageName: string, // имя сообщения на которое выполняется подписка (имя события)
  publishModuleName: string, // имя модуля которое публикует событие
  handlerModuleName: string, // имя модуля которое подписывается на событие
  handlerServiceName: string, // имя сервиса которая будет обрабатывать событие
}

export type SubcribeToMessage = SubcribeToMessageBody & {
  type: 'message',
}

export type SubcribeToEvent = SubcribeToMessageBody & {
  type: 'event',
}

export type SubcribeToAggregate = SubcribeToMessageBody & {
  type: 'aggregate',
}

/** Тип для подписки в шину */
export type SubcribeToBusMessage = SubcribeToMessage | SubcribeToEvent | SubcribeToAggregate;

export type MessageBodyType = {
  id: UuidType,
  name: string,
  payload: BusPayloadAsJson,
  requestId: UuidType,
  isPublished: 0 | 1,
}

export type EventBodyType = MessageBodyType & {
  aRootName: string,
  aRootId: string,
}

export type DeliveryMessage = MessageBodyType & {
  type: 'message',
}

export type DeliveryEvent = EventBodyType & {
  type: 'event',
}

/** Тип для доставщика в шину */
export type DeliveryBusMessage = DeliveryMessage | DeliveryEvent;

type PublishBodyType = {
  publishModuleName: string,
}
export type PublishMessage = DeliveryMessage & PublishBodyType;

export type PublishEvent = DeliveryEvent & PublishBodyType;

/** Тип для публикации в шину */
export type PublishBusMessage = PublishMessage | PublishEvent;
