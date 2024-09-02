/* eslint-disable no-underscore-dangle */
import { stat } from 'fs/promises';
import { MimeTypes, ResponseFileOptions } from '../../../api/controller/types.js';
import { mimeTypesMap, dispositionTypeMap, blobTypes } from '../../../api/controller/constants.js';

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
      return this.createJson((err as Error).message, 500);
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

      let disposition: string;
      if (!options?.disposition || options.disposition === 'inline') {
        disposition = 'inline';
      } else {
        const filenameString = `filename="${fileName}"`;
        disposition = `${dispositionTypeMap.attachment}; ${filenameString}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': mimeTypesMap[mimeType],
        'Content-Length': fileSize,
        'Content-Disposition': disposition,
      };

      const content = blobTypes.includes(mimeType)
        ? await this.fileContentAsBlob(filePath)
        : await this.fileContentAsText(filePath);

      return new Response(content, {
        status: options?.status ?? 200,
        headers,
      });
    } catch (err) {
      return this.createJson((err as Error).message, 500);
    }
  }

  /**
   * Читает содержимое файла.
   * @param path - Путь к файлу.
   * @returns Промис, который возвращает содержимое файла как строку.
   */
  protected fileContentAsText(path: string): Promise<string> {
    return Bun.file(path).text();
  }

  /**
   * Читает содержимое файла как Blob.
   * @param path - Путь к файлу.
   * @returns Промис, который возвращает содержимое файла как Blob.
   */
  protected async fileContentAsBlob(path: string): Promise<Blob> {
    const buffer = await Bun.file(path).arrayBuffer();
    return new Blob([buffer]);
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
