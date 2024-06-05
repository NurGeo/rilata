import {
  describe, test, expect, beforeEach, jest,
  spyOn,
} from 'bun:test';
import { responseUtility } from './response-utility.js';

describe('response utility tests', () => {
  describe('response utility method createJsonResponse', () => {
    test('should return correct headers and body for a normal object', async () => {
      const data = { key: 'value', anotherKey: 'anotherValue' };
      const response = responseUtility.createJsonResponse(data) as Response;

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Length')).toBe('43');
      expect(await response.text()).toBe('{"key":"value","anotherKey":"anotherValue"}');
    });

    test('should return correct headers and body for an empty object', async () => {
      const data = {};
      const response = responseUtility.createJsonResponse(data) as Response;

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Length')).toBe('2');
      expect(await response.text()).toBe('{}');
    });

    test('should return correct headers and body for a nested object', async () => {
      const data = { key: { nestedKey: 'nestedValue' } };
      const response = responseUtility.createJsonResponse(data) as Response;

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Length')).toBe('35');
      expect(await response.text()).toBe('{"key":{"nestedKey":"nestedValue"}}');
    });

    test('should return correct headers and body for an object with various types', async () => {
      const data = { number: 123, boolean: true, array: [1, 2, 3] };
      const response = responseUtility.createJsonResponse(data) as Response;

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Length')).toBe('45');
      expect(await response.text()).toBe('{"number":123,"boolean":true,"array":[1,2,3]}');
    });
  });

  describe('response utility method createFileResponse', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    const textEncoder = new TextEncoder();

    test('should return a response with correct headers and content when shouldCompress is true and format is gzip', async () => {
      const mockFileContent = new Uint8Array([1, 2, 3, 4]);

      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileSize').mockResolvedValue('4');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileContent').mockResolvedValue('file content');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'compressFile').mockResolvedValue(mockFileContent);

      const response = await responseUtility.createFileResponse('/dir/name.ext', {
        disposition: 'attachment',
        compressionFormat: 'gzip',
      });

      const { headers } = response;
      expect(headers.get('Content-Type')).toBe('text/plain'); // default content type
      expect(headers.get('Content-Encoding')).toBe('gzip'); // should compress
      expect(headers.get('Content-Disposition')).toBe('attachment; filename="name.ext.zip"');
      expect(headers.get('Content-Length')).toBe('4');

      const content = await response.arrayBuffer();
      expect(new Uint8Array(content)).toEqual(mockFileContent);
    });

    test('should return a response with correct headers and content when shouldCompress is true and format is br', async () => {
      const mockFileContent = new Uint8Array([1, 2, 3, 4]);

      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileSize').mockResolvedValue('4');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileContent').mockResolvedValue('file content');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'compressFile').mockResolvedValue(mockFileContent);

      const response = await responseUtility.createFileResponse('/dir/file.json', {
        shouldCompress: true,
        disposition: 'attachment',
        mimeType: 'json',
      });

      const { headers } = response;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Content-Encoding')).toBe('br');
      expect(headers.get('Content-Disposition')).toBe('attachment; filename="file.json"');
      expect(headers.get('Content-Length')).toBe('4');

      const content = await response.arrayBuffer();
      expect(new Uint8Array(content)).toEqual(mockFileContent);
    });

    test('should return a response with correct headers and content for inline disposition and format deflate', async () => {
      const mockFileContent = '<h1>Hello world!</h1>';
      const compressedContent = new Uint8Array([5, 6, 7, 8]);

      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileSize').mockResolvedValue('21');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileContent').mockResolvedValue(mockFileContent);
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'compressFile').mockResolvedValue(compressedContent);

      const response = await responseUtility.createFileResponse('/dir/index.html', {
        shouldCompress: true,
        disposition: 'attachment',
        compressionFormat: 'deflate',
        status: 201,
      });

      const { headers } = response;
      expect(headers.get('Content-Type')).toBe('text/html');
      expect(headers.get('Content-Encoding')).toBe('deflate'); // should compress
      expect(headers.get('Content-Disposition')).toBe('attachment; filename="index.html.zip"');
      expect(headers.get('Content-Length')).toBe('4');
      expect(response.status).toBe(201);

      const content = await response.arrayBuffer();
      expect(new Uint8Array(content)).toEqual(compressedContent);
    });

    test('should return a response with correct headers and content when shouldCompress is false and format is br', async () => {
      const mockFileContent = '<h1>Hello world!</h1>';

      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileSize').mockResolvedValue('21');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileContent').mockResolvedValue(mockFileContent);

      const response = await responseUtility.createFileResponse('/dir/index.html', {
        shouldCompress: false,
        disposition: 'inline',
        compressionFormat: 'br',
        status: 201,
      });

      const { headers } = response;
      expect(headers.get('Content-Type')).toBe('text/html');
      expect(headers.get('Content-Encoding')).toBeNull(); // should not compress
      expect(headers.get('Content-Disposition')).toBe('inline');
      expect(headers.get('Content-Length')).toBe('21');
      expect(response.status).toBe(201);

      const content = await response.arrayBuffer();
      expect(new Uint8Array(content)).toEqual(textEncoder.encode(mockFileContent));
    });

    test('should handle errors correctly', async () => {
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileSize').mockResolvedValue('12');
      // @ts-expect-error private method mocked
      spyOn(responseUtility, 'fileContent').mockImplementation(() => {
        throw new Error('File not found');
      });

      const response = await responseUtility.createFileResponse('/dir/file.txt');

      const { headers } = response;

      expect(headers.get('Content-Type')).toBe('application/json');

      const content = await response.json();
      expect(Object.keys(content)).toEqual(['type', 'message', 'stack']);
      expect(content.type).toBe('fail file response create error');
      expect(content.message).toBe('File not found');
      expect(content.stack).toContain('at compressFile (');
    });
  });
});
