import { domainStore } from '#core/domain-store.js';

const CHARS_COUNT = 25;
const CODE_OF_A_LETTER = 97;

const randomGenerators = {
  h: (): string => Math.floor(Math.random() * 16).toString(16),
  d: (): string => Math.floor(Math.random() * 10).toString(),
  b: (): string => Math.floor(Math.random() * 2).toString(),
  o: (): string => Math.floor(Math.random() * 8).toString(),
  z: (): string => String.fromCharCode(
    Math.floor(Math.random() * CHARS_COUNT) + CODE_OF_A_LETTER,
  ),

  0: (maxDigit: number): string => Math.floor(Math.random() * (maxDigit + 1)).toString(),
};

/* eslint-disable no-plusplus */
class StringUtility {
  /**
   * Генерирует отформатированную строку на основе заданного формата и разделителя.
   * Каждый символ в строке формата указывает тип значения для генерации:
   * - 'h' для шестнадцатеричного числа (0-9, a-f)
   * - 'd' для десятичного числа (0-9)
   * - 'b' для двоичного числа (0, 1)
   * - 'o' для восьмеричного числа (0-7)
   * - 'z' для латинского алфавита (a-z)
   * - цифры (0-9) указывают случайное число от 0 до указанной цифры
   *
   * @param format Строка формата, указывающая структуру и типы значений.
   * @param [delimiter='-'] Разделитель, используемый для разделения сегментов.
   * @returns Сгенерированная строка, соответствующая указанному формату и разделителю.
   *
   * @example
   * random('hh-hhhh-hhhh'); // 'a3-4f7b-9acd'
   * random('dd.dddd.dddd', '.'); // '73.5489.1920'
   * random('bb-bbbb-bbbb'); // '01-1010-0111'
   * random('oo-oooo'); // '01-7264'
   * random('3-34-4h-hhh'); // '1-23-7d-8fc'
   * random('zzzz#ddd', '#'); // 'hisr#836'
   */
  random(format: string, delimiter = '-'): string {
    const segments = format.split(delimiter);

    return segments.map((segment) => (
      segment.split('').map((char) => {
        if (char === 'h' || char === 'd' || char === 'b' || char === 'o' || char === 'z') {
          return randomGenerators[char]();
        }

        const digit = Number(char);
        if (isNaN(digit)) throw domainStore.getPayload().logger.error(`not valid char: ${char}`);
        return randomGenerators[0](digit);
      }).join('')
    )).join(delimiter);
  }

  /**
   * Удаляет указанные символы с начала и конца строки.
   *
   * @param target - Исходная строка.
   * @param chars - Символы для удаления, по умолчанию пробелы, табуляции и вертикальные табуляции.
   * @returns Строка без указанных символов с начала и конца.
   */
  trim(target: string, chars: string): string {
    return this.trimStart(this.trimEnd(target, chars), chars);
  }

  /**
   * Удаляет указанные символы с начала строки.
   *
   * @param target - Исходная строка.
   * @param chars - Символы для удаления, по умолчанию пробелы, табуляции и вертикальные табуляции.
   * @returns Строка без указанных символов с начала.
   */
  trimStart(target: string, chars: string): string {
    let start = 0;
    const end = target.length;
    while (start < end && chars.includes(target[start])) {
      start += 1;
    }
    return target.substring(start, end);
  }

  /**
   * Удаляет указанные символы с конца строки.
   *
   * @param target - Исходная строка.
   * @param chars - Символы для удаления, по умолчанию пробелы, табуляции и вертикальные табуляции.
   * @returns Строка без указанных символов с конца.
   */
  trimEnd(target: string, chars: string): string {
    let end = target.length;
    while (end > 0 && chars.includes(target[end - 1])) {
      end -= 1;
    }
    return target.substring(0, end);
  }

  /**
   * Делает первую букву строки заглавной.
   *
   * @param str - Исходная строка.
   * @returns Строка с заглавной первой буквой.
   */
  makeFirstLetterUppercase(str: string): string {
    return str.length > 0
      ? str[0].toUpperCase() + str.substring(1)
      : str;
  }

  /**
   * Преобразует строку из camelCase в kebab-case.
   *
   * @param text - Исходная строка в camelCase.
   * @returns Строка в kebab-case.
   */
  camelCaseToKebab(text: string): string {
    return this.camelToSnakeKebabCase(text, false, '-');
  }

  /**
   * Преобразует строку из camelCase в super-kebab-case (верхний регистр).
   *
   * @param text - Исходная строка в camelCase.
   * @returns Строка в super-kebab-case.
   */
  camelCaseToSuperKebab(text: string): string {
    return this.camelToSnakeKebabCase(text, true, '-');
  }

  /**
   * Преобразует строку из camelCase в snake_case.
   *
   * @param text - Исходная строка в camelCase.
   * @returns Строка в snake_case.
   */
  camelCaseToSnake(text: string): string {
    return this.camelToSnakeKebabCase(text, false, '_');
  }

  /**
   * Преобразует строку из camelCase в super-snake_case (верхний регистр).
   *
   * @param text - Исходная строка в camelCase.
   * @returns Строка в super-snake_case.
   */
  camelCaseToSuperSnake(text: string): string {
    return this.camelToSnakeKebabCase(text, true, '_');
  }

  /**
   * Вспомогательная функция для преобразования camelCase в snake_case или kebab-case.
   *
   * @param text - Исходная строка в camelCase.
   * @param isSuper - Указывает, должен ли результат быть в верхнем регистре.
   * @param caseChar - Символ для разделения слов, по умолчанию '-'.
   * @returns Преобразованная строка.
   */
  camelToSnakeKebabCase(text: string, isSuper: boolean, caseChar = '-'): string {
    if (text === '') return '';
    const cb = (prev: string, curr: string): string => prev + (StringUtility.isTitle(curr)
      ? `${caseChar}${curr.toLowerCase()}`
      : curr
    );
    return isSuper
      ? this.reduce(text.substring(1), cb, text[0].toLowerCase())
      : this.reduce(text, cb);
  }

  /**
   * Преобразует строку из kebab-case в camelCase.
   *
   * @param text - Исходная строка в kebab-case.
   * @returns Строка в camelCase.
   */
  kebabToCamelCase(text: string): string {
    return this.snakeKebabToCamelCase(text, false, '-');
  }

  /**
   * Преобразует строку из kebab-case в SuperCamelCase (первый символ заглавный).
   *
   * @param text - Исходная строка в kebab-case.
   * @returns Строка в SuperCamelCase.
   */
  kebabToSuperCamelCase(text: string): string {
    return this.snakeKebabToCamelCase(text, true, '-');
  }

  /**
   * Преобразует строку из snake_case в camelCase.
   *
   * @param text - Исходная строка в snake_case.
   * @returns Строка в camelCase.
   */
  snakeToCamelCase(text: string): string {
    return this.snakeKebabToCamelCase(text, false, '_');
  }

  /**
   * Преобразует строку из snake_case в SuperCamelCase (первый символ заглавный).
   *
   * @param text - Исходная строка в snake_case.
   * @returns Строка в SuperCamelCase.
   */
  snakeToSuperCamelCase(text: string): string {
    return this.snakeKebabToCamelCase(text, true, '_');
  }

  /**
   * Вспомогательная функция для преобразования snake_case или kebab-case в camelCase.
   *
   * @param text - Исходная строка в snake_case или kebab-case.
   * @param isSuper - Указывает, должен ли результат быть в верхнем регистре.
   * @param char - Символ для разделения слов, по умолчанию '-'.
   * @returns Преобразованная строка.
   */
  snakeKebabToCamelCase(text: string, isSuper: boolean, char = '-'): string {
    if (text === '') return '';
    const cb = (prev: string, curr: string): string => ((prev[prev.length - 1] === char)
      ? prev.substring(0, prev.length - 1) + curr.toUpperCase()
      : prev + curr);

    return isSuper
      ? this.reduce(text.substring(1), cb, text[0].toUpperCase())
      : this.reduce(text, cb);
  }

  /**
   * Заменяет шаблон в строке на указанную подстроку.
   *
   * @param text - Исходная строка, в которой необходимо выполнить замену.
   * @param tmpl - Шаблон, который нужно заменить. Может содержать пробелы.
   * @param replacement - Строка, на которую нужно заменить найденный шаблон.
   * @param brackets - Пара скобок для обрамления шаблона, по умолчанию '{}'.
   * @param bracketCount - Количество повторений открывающей и закрывающей скобок, по умолчанию 2.
   * @returns Строка с заменённым шаблоном.
   */
  replaceTemplate(
    text: string,
    tmpl: string,
    replacement: string,
    brackets: [string, string] = ['{', '}'],
    bracketCount = 2,
  ): string {
    const [openBracket, closeBracket] = brackets;

    // Экранирование шаблона и скобок для использования в регулярном выражении
    const escapedTemplate = tmpl.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const openBrackets = openBracket.repeat(bracketCount).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const closeBrackets = closeBracket.repeat(bracketCount).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regexPattern = `${openBrackets}\\s*${escapedTemplate}\\s*${closeBrackets}`;
    const regex = new RegExp(regexPattern, 'g');

    // Заменяем найденные шаблоны на replacement, удаляя пробелы
    return text.replace(regex, (match) => {
      const withoutSpaces = match.replace(/\s+/g, '');
      const finalPattern = new RegExp(`${openBrackets}${escapedTemplate}${closeBrackets}`);
      return withoutSpaces.replace(finalPattern, replacement);
    });
  }

  /**
   * Применяет функцию редуктора к каждому символу строки, начиная с левого.
   *
   * @param text - Исходная строка.
   * @param cb - Функция редуктора, принимающая предыдущий результат и текущий символ.
   * @param initial - Начальное значение для редуктора.
   * @returns Результат применения редуктора к каждому символу строки.
   */
  reduce<T>(text: string, cb: (prev: T, char: string) => T, initial?: T): T {
    let result: T;
    let startIndex: number;

    if (initial !== undefined) {
      result = initial;
      startIndex = 0;
    } else if (text.length > 0) {
      result = text[0] as unknown as T;
      startIndex = 1;
    } else {
      result = '' as unknown as T;
      startIndex = 0;
    }

    for (let i = startIndex; i < text.length; i++) {
      result = cb(result, text[i]);
    }
    return result;
  }

  /**
   * Проверяет, является ли символ заглавной буквой.
   *
   * @param char - Символ для проверки.
   * @returns true, если символ заглавная буква, иначе false.
   */
  protected static isTitle(char: string): boolean {
    return char >= 'A' && char <= 'Z';
  }
}

export const stringUtility = Object.freeze(new StringUtility());
