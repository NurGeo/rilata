/* eslint-disable lines-between-class-members */
import { CallbackQuery, ChatJoinRequest, ChatMemberUpdated, ChosenInlineResult, InlineQuery, Message, PollAnswer, PreCheckoutQuery, ShippingQuery, Update, User } from '@grammyjs/types';

class UpdateUtils {
  getUser(update: Update): User {
    const user = this.findUser(update);
    if (!user) throw Error('Не найден пользователь отправитель');
    return user;
  }

  /**
   * Возвращает идентификатор пользователя из объекта Update.
   */
  getUserId(update: Update): string {
    return String(this.getUser(update).id);
  }

  findUser(upd: { message: Message }): User;
  findUser(upd: { callback_query: CallbackQuery }): User;
  findUser(upd: { inline_query: InlineQuery }): User;
  findUser(upd: { chosen_inline_result: ChosenInlineResult }): User;
  findUser(upd: { shipping_query: ShippingQuery }): User;
  findUser(upd: { pre_checkout_query: PreCheckoutQuery }): User;
  findUser(upd: { poll_answer: PollAnswer }): User;
  findUser(upd: { my_chat_member: ChatMemberUpdated }): User;
  findUser(upd: { chat_member: ChatMemberUpdated }): User;
  findUser(upd: { chat_join_request: ChatJoinRequest }): User;
  findUser(upd: Update): User | undefined;
  findUser(upd: unknown): User | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findUser(upd: any): User | undefined {
    if (upd.message) return upd.message.from;
    if (upd.edited_message) return upd.edited_message.from;
    if (upd.callback_query) return upd.callback_query.from;
    if (upd.inline_query) return upd.inline_query.from;
    if (upd.chosen_inline_result) return upd.chosen_inline_result.from;
    if (upd.shipping_query) return upd.shipping_query.from;
    if (upd.pre_checkout_query) return upd.pre_checkout_query.from;
    if (upd.poll_answer) return upd.poll_answer.user;
    if (upd.my_chat_member) return upd.my_chat_member.from;
    if (upd.chat_member) return upd.chat_member.from;
    if (upd.chat_join_request) return upd.chat_join_request.from;

    return undefined;
  }
}

export const updateUtils = new UpdateUtils();
