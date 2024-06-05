/* eslint-disable @typescript-eslint/no-explicit-any */
import { Constructor } from '../types.js';

/** Позволяет через декоратор добавить методы одного класса (mixinConstr)
    добавить в другой класс (targetClass).

    interface Alable {
      getA(): string
    }

    class AlableMixin{
      declare a: string;
      getA(): string {
        return this.a
      }
    }

    @joinMethodsOf(AlableMixin)
    class A {
      a = 'AA string';
    }

    console.log((new A() as unknown as Alable).getA()); // "AA string"

    */
export function joinMethodsOf(mixinConstr: Constructor<any>) {
  return function mixinDecorator(targetClass: Constructor<any>): Constructor<any> {
    Object.getOwnPropertyNames(mixinConstr.prototype).forEach((name) => {
      Object.defineProperty(
        targetClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(mixinConstr.prototype, name) as PropertyDescriptor,
      );
    });
    return targetClass;
  };
}
