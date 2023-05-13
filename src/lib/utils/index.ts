/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import * as fs from 'fs';
import * as iconv from 'iconv-lite';

async function loadJson(file: string, encoding: BufferEncoding | 'Shift_JIS' | string = 'utf8'): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
          if (err) {
              reject(err);
          }
          const decoded = iconv.decode(data, encoding);
          const json = JSON.parse(decoded) as Record<string, any>;
          return resolve(json);
        });
  });
}

/**
 * update map object using given data.
 * @param map map object
 * @param data array object like [[key1, value1], [key2, value2], ...]
 * @example
 * const rule = new Map<string, string>();
 * updateMap(rule, [['hoge', 'fuga'], ['fuga', 'hoge_fuga']]);
 * console.log(rule)    //-> Map(2) { 'hoge' => 'fuga', 'fuga' => 'hoge_fuga' }
 */
function updateMap<T>(map: Map<T, T>, data: [T, T][]) {
  for (let i = 0; i < data.length; i++) {
    const arr = data[i];
    map.set(arr[0], arr[1]);
  }
};

/**
 * omap({ a: 1, b: 2, c: 3 }, v => v * 2, ["b", "c"]);
 *   -> { a: 1, b: 4, c: 6 }
 */
const omap = (object: { [key: string]: any }, func: (value: any) => any, specifiedProps: string[]) => {
  const result: typeof object[keyof typeof object] = {};
  const props = specifiedProps ?? Object.keys(object);
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    result[prop] = func ? func(object[prop]) : null;
  }
  return result;
};


const areSame = <T extends { [key: string]: any }>(a: T, b: T) => {
  const props = Object.keys(b);
  let same = true;
  for (let i = 0; i < props.length; i++) {
    const prop = props[i];
    if (a[prop] !== b[prop]) {
      same = false;
      break;
    }
  }
  return same;
};


export {
  loadJson,
  updateMap,
  omap,
  areSame,
};
