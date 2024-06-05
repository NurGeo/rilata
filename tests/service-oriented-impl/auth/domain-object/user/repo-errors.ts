import { UuidType } from '../../../../../src/core/types.js';
import { ErrorDod } from '../../../../../src/domain/domain-data/domain-types.js';

export type UserDoesNotExistByLoginError = ErrorDod<'UserDoesNotExistByIdError', {
  name: 'UserDoesNotExistByIdError',
  text: 'Не найден пользователь с id {{id}}',
  hint: { id: UuidType }
}>

export type UserDoesNotExistByIdError = ErrorDod<'UserDoesNotExistByIdError', {
  name: 'UserDoesNotExistByIdError',
  text: 'Не найден пользователь с id {{id}}',
  hint: { id: UuidType }
}>
