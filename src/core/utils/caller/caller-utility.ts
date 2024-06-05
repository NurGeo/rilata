import { Caller } from '../../../api/controller/types.js';
import { AssertionException } from '../../exeptions.js';
import { UserId } from '../../types.js';

class CallerUtility {
  /** если пользователь не авторизован, то вернет undefined, иначе userId */
  findUserId(caller: Caller): UserId | undefined {
    if (caller.type === 'AnonymousUser') return undefined;
    if (caller.type === 'DomainUser') return caller.userId;
    if (caller.user.type === 'AnonymousUser') return undefined;
    return caller.user.userId;
  }

  /** возвращает userId, если пользователь не авторизован, то выкинет исключение */
  getUserId(caller: Caller): UserId {
    const finded = this.findUserId(caller);
    if (finded) return finded;
    throw new AssertionException('user id is not finded');
  }
}

export const callerUtility = new CallerUtility();
