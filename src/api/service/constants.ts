import { Locale } from '../../domain/locale.js';
import {
  BadRequestError, InternalError, NotFoundError, PermissionDeniedError,
} from './error-types.js';

export const badRequestError: BadRequestError<Locale<'Bad request'>> = {
  locale: {
    text: 'Bad request',
    hint: {},
    name: 'Bad request',
  },
  name: 'Bad request',
  meta: {
    errorType: 'app-error',
    domainType: 'error',
  },
};

export const badRequestInvalidCommandNameError: BadRequestError<Locale<'Bad request'>> = {
  locale: {
    text: 'Bad request, invalid command name',
    hint: {},
    name: 'Bad request',
  },
  name: 'Bad request',
  meta: {
    errorType: 'app-error',
    domainType: 'error',
  },
};

export const notFoundError: NotFoundError<Locale<'Not found'>> = {
  locale: {
    text: 'Page not found',
    hint: {},
    name: 'Not found',
  },
  name: 'Not found',
  meta: {
    errorType: 'app-error',
    domainType: 'error',
  },
};

export const internalError: InternalError<Locale<'Internal error'>> = {
  locale: {
    text: 'Internal error',
    hint: {},
    name: 'Internal error',
  },
  name: 'Internal error',
  meta: {
    errorType: 'app-error',
    domainType: 'error',
  },
};

export const permissionDeniedError: PermissionDeniedError<Locale<'Permission denied'>> = {
  locale: {
    text: 'Действие не доступно',
    hint: {},
    name: 'Permission denied',
  },
  name: 'Permission denied',
  meta: {
    errorType: 'domain-error',
    domainType: 'error',
  },
};

export const authPermissionDeniedError: PermissionDeniedError<Locale<'Permission denied'>> = {
  locale: {
    text: 'Действие доступно только для аутентифицированных пользователей.',
    hint: {},
    name: 'Permission denied',
  },
  name: 'Permission denied',
  meta: {
    errorType: 'domain-error',
    domainType: 'error',
  },
};
