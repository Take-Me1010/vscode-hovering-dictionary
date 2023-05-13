/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { DictEntry } from "../types";
import { DictParser } from './interface';

export class SimpleDictParser implements DictParser {
  delimiter: string;
  constructor(delimiter: string) {
    this.delimiter = delimiter;
  }

  addLine(line: string): DictEntry | null {
    let hd: DictEntry | null = null;
    const didx = line.indexOf(this.delimiter);
    if (didx >= 0) {
      const head = line.substring(0, didx);
      const desc = line.substring(didx + this.delimiter.length);
      if (head && desc) {
        hd = { head, desc };
      }
    }
    return hd;
  }

  flush() {
    return null;
  }
}
