import { uuidv7 } from 'uuidv7';
import { UuidType } from '../../types.js';
import { AssertionException } from '../../exeptions.js';
import { domainStore } from '#core/domain-store.js';

class UUIDUtility {
  private uuidRegex = '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

  getNewUuidV4(): UuidType {
    return crypto.randomUUID();
  }

  getNewUuidV7(): UuidType {
    return uuidv7();
  }

  isValidValue(value?: unknown): boolean {
    return typeof value === 'string' && new RegExp(this.uuidRegex).test(value);
  }

  cleanValue(value?: unknown): UuidType {
    if (this.isValidValue(value)) {
      return value as UuidType;
    }
    throw new AssertionException(
      `Значение ${value} не является валидным для типа UUID`,
    );
  }

  extractUuid(url: string, position = 1): string {
    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;

    const matchResults = Array.from(url.matchAll(uuidRegex));
    if (matchResults.length >= position) {
      return matchResults[position - 1][0];
    }
    throw domainStore.getPayload().logger.error(
      'Строка не содержит uuid в указанной позиции',
      { text: url, position },
    );
  }

  toBytes(uuid: UuidType): Uint8Array {
    if (!this.isValidValue(uuid)) throw Error(`not valid uuid: ${uuid}`);
    const sanitizedUuid = uuid.replace(/-/g, '');

    // Преобразуем каждую пару символов в байт
    const bytes = new Uint8Array(16);
    for (let i = 0; i < sanitizedUuid.length; i += 2) {
      bytes[i / 2] = parseInt(sanitizedUuid.substring(i, i + 2), 16);
    }
    return bytes;
  }

  fromBytes(bytes: Uint8Array): UuidType {
    if (bytes.length !== 16) throw Error(`Invalid byte array length for UUID: ${bytes.length}`);

    const hex = Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  }
}

export const uuidUtility = new UUIDUtility();
