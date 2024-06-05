/* eslint-disable no-underscore-dangle */
import { stat } from 'fs/promises';
import { createGzip, createDeflate, brotliCompress } from 'zlib';
import { promisify } from 'util';
import { MimeTypes, ResponseFileOptions } from '../../../api/controller/types.js';
import { mimeTypesMap, dispositionTypeMap } from '../../../api/controller/constants.js';

const brotliCompressAsync = promisify(brotliCompress);

class ResponseUtility {
  /**
   * Создает JSON-ответ.
   * @param data - Данные для включения в тело ответа.
   * @param status - HTTP статус ответа. По умолчанию 200.
   * @returns Ответ с данными в формате JSON.
   */
  createJsonResponse(data: unknown, status = 200): Response {
    try {
      return this.createJson(data, status);
    } catch (err) {
      return this.createError(err as Error, 'json');
    }
  }

  /**
   * Создает ответ с файлом.
   * @param filePath - Путь к файлу.
   * @param options - Опции для ответа.
   * @returns Ответ с содержимым файла.
   */
  async createFileResponse(filePath: string, options?: ResponseFileOptions): Promise<Response> {
    try {
      const fileSize = await this.fileSize(filePath);
      const mimeType = options?.mimeType ?? this.fileMimeType(filePath);
      const fileName = filePath.split('/').pop() ?? filePath;

      const shouldCompress = options?.shouldCompress ?? true;
      const compressionFormat = options?.compressionFormat ?? 'br'; // поддержка различных форматов сжатия, по умолчанию 'br'
      let disposition: string;
      if (!options?.disposition || options.disposition === 'inline') {
        disposition = 'inline';
      } else {
        let filenameString: string;
        if (shouldCompress && (compressionFormat === 'gzip' || compressionFormat === 'deflate')) {
          filenameString = `filename="${fileName}.zip"`;
        } else {
          filenameString = `filename="${fileName}"`;
        }
        disposition = `${dispositionTypeMap.attachment}; ${filenameString}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': mimeTypesMap[mimeType],
        'Content-Length': fileSize,
        'Content-Disposition': disposition,
      };

      let content: Uint8Array | string;
      if (shouldCompress) {
        content = await this.compressFile(filePath, compressionFormat);
        headers['Content-Encoding'] = compressionFormat;
        headers['Content-Length'] = content.length.toString();
      } else {
        content = await this.fileContent(filePath);
      }

      return new Response(content, {
        status: options?.status ?? 200,
        headers,
      });
    } catch (err) {
      return this.createError(err as Error, 'file');
    }
  }

  /**
   * Читает содержимое файла.
   * @param path - Путь к файлу.
   * @returns Промис, который возвращает содержимое файла как строку.
   */
  protected fileContent(path: string): Promise<string> {
    return Bun.file(path).text();
  }

  /**
   * Определяет размер файла.
   * @param path - Путь к файлу.
   * @returns Промис, который возвращает размер файла в байтах.
   */
  private async fileSize(path: string): Promise<string> {
    const fileStat = await stat(path);
    return fileStat.size.toString();
  }

  /**
   * Сжимает файл.
   * @param path - Путь к файлу.
   * @param format - Формат сжатия (gzip, deflate, br).
   * @returns Промис, который возвращает сжатое содержимое файла.
   */
  private async compressFile(path: string, format: string): Promise<Uint8Array> {
    const fileContent = await this.fileContent(path);
    const buffer = Buffer.from(fileContent);

    switch (format) {
      case 'br':
        return brotliCompressAsync(buffer);
      case 'gzip':
        return this.compressWithStream(buffer, createGzip);
      case 'deflate':
        return this.compressWithStream(buffer, createDeflate);
      default:
        throw new Error(`Unsupported compression format: ${format}`);
    }
  }

  /**
   * Сжимает данные с помощью потока.
   * @param buffer - Данные для сжатия.
   * @param createStream - Функция создания потока сжатия.
   * @returns Промис, который возвращает сжатые данные.
   */
  private compressWithStream(
    buffer: Buffer,
    createStream: () => NodeJS.ReadWriteStream,
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = createStream();

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      stream.end(buffer);
    });
  }

  /**
   * Создает JSON-ответ с сообщением об ошибке.
   * @param err - Объект ошибки.
   * @param errType - Тип ошибки file | json.
   * @returns Ответ с сообщением об ошибке в формате JSON.
   */
  private createError(err: Error, errType: string): Response {
    return this.createJson({
      type: `fail ${errType} response create error`,
      message: (err as Error).message || `create file ${errType} response error`,
      stack: (err as Error).stack || 'trace stack not found',
    }, 500);
  }

  /**
   * Создает JSON-ответ.
   * @param data - Данные для включения в тело ответа.
   * @param status - HTTP статус ответа.
   * @returns Ответ с данными в формате JSON.
   */
  private createJson(data: unknown, status: number): Response {
    const jsonString = JSON.stringify(data);
    const contentLength = Buffer.byteLength(jsonString);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': contentLength.toString(),
    };
    return new Response(jsonString, {
      status,
      headers,
    });
  }

  /**
   * Определяет MIME-тип файла на основе его расширения.
   * @param path - Путь к файлу.
   * @returns MIME-тип файла.
   */
  private fileMimeType(path: string): MimeTypes {
    const fileExt = path.split('.').pop();
    if (fileExt && fileExt in mimeTypesMap) return fileExt as MimeTypes;
    return 'txt';
  }
}

export const responseUtility = new ResponseUtility();
