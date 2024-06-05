import { BackendBaseErrors } from '../service/error-types.js';

/**
 * dispositionTypeMap - Карта типов disposition для заголовка Content-Disposition.
 * @property {string} inline - Отображает содержимое непосредственно в браузере.
 * @property {string} attachment - Принудительно загружает файл с указанным именем.
 */
export const dispositionTypeMap = {
  inline: 'inline',
  attachment: 'attachment',
};

/**
 * mimeTypesMap - Карта типов MIME, поддерживаемых в системе.
 */
export const mimeTypesMap = {
  html: 'text/html',
  txt: 'text/plain',
  json: 'application/json',
  js: 'application/javascript',
  css: 'text/css',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
  zip: 'application/zip',
  mp3: 'audio/mpeg',
  ico: 'image/x-icon',
};

/**
 * STATUS_CODES - Карта статусов HTTP, связанных с определенными ошибками.
 */
export const STATUS_CODES: Record<BackendBaseErrors['name'], number> = {
  'Not found': 404,
  'Permission denied': 403,
  'Internal error': 500,
  'Bad request': 400,
  'Validation error': 400,
  'Net error': 400,
  IncorrectTokenError: 400,
  NotValidTokenPayloadError: 400,
  TokenExpiredError: 400,
  JwtVerifyError: 400,
};
