/* eslint-disable no-console */
const styles = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',
};

const fgColor = {
  Black: '\x1b[30m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  White: '\x1b[37m',
};

const bgColor = {
  Black: '\x1b[40m',
  Red: '\x1b[41m',
  Green: '\x1b[42m',
  Yellow: '\x1b[43m',
  Blue: '\x1b[44m',
  Magenta: '\x1b[45m',
  Cyan: '\x1b[46m',
  White: '\x1b[47m',
};

class ConsoleColor {
  bright(text: string): string {
    return this.stylizeText(styles.Bright, text);
  }

  dim(text: string): string {
    return this.stylizeText(styles.Dim, text);
  }

  underscore(text: string): string {
    return this.stylizeText(styles.Underscore, text);
  }

  blink(text: string): string {
    return this.stylizeText(styles.Blink, text);
  }

  reverse(text: string): string {
    return this.stylizeText(styles.Reverse, text);
  }

  hidden(text: string): string {
    return this.stylizeText(styles.Hidden, text);
  }

  fgColor(text: string, color: keyof typeof fgColor): string {
    return this.stylizeText(fgColor[color], text);
  }

  bgColor(text: string, color: keyof typeof bgColor): string {
    return this.stylizeText(bgColor[color], text);
  }

  /** Примеры стилизации.
      Для знакомства, в тесте уберите skip и запустите тест.
  */
  test(text = 'text'): void {
    Object.entries({ styles, bgColor, fgColor }).forEach(([type, typeValue]) => {
      console.log(this.bright(`\ntype: ${type}`));
      Object.entries(typeValue).forEach(([styleKey, styleValue]) => {
        console.log(`${styleKey}: ${this.stylizeText(styleValue, text)}`);
      });
    });
  }

  private stylizeText(color: string, text: string): string {
    return `${color}${text}${styles.Reset}`;
  }
}

export const consoleColor = new ConsoleColor();
