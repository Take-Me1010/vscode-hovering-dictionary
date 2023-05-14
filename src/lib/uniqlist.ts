/**
 * UniqArray (https://github.com/wtetsu/uniqlist/)
 * 
 * Copyright (c) 2023 Take-Me
 * Licensed under MIT
 * 
 * The code is rewritten in TypScript.
 * (The original code is written in JavaScript.)
 * 
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export class UniqList<T> {
    private array: T[];
    private keys: Set<any>;
    private filter: null | ((item: T, key: any) => boolean);

    constructor(filter: ((item: T, key: any) => boolean) | null = null) {
      this.array = [];
      this.keys = new Set();
      this.filter = filter;
    }
  
    get(index: number) {
      return this.array[index];
    }

    /**
     * alias for `Uniqlist.keys.has()`
     */
    has(key: any) {
      return this.keys.has(key);
    }
  
    size() {
      return this.array.length;
    }
  
    push(newItem: T, key: any = null) {
      if (this.filter !== null && !this.filter(newItem, key)) {
        return;
      }
      const actualKey = key || newItem;
      if (this.keys.has(actualKey)) {
        return;
      }
      this.array.push(newItem);
      this.keys.add(actualKey);
    }

    unshift(newItem: T, key: any = null) {
      if (this.filter !== null && !this.filter(newItem, key)) {
        return;
      }
      const actualKey = key || newItem;
      if (this.keys.has(actualKey)) {
        return;
      }
      this.array.unshift(newItem);
      this.keys.add(actualKey);
    }
  
    merge(anotherArray: T[], keys: any[] = []) {
      for (let i = 0; i < anotherArray.length; i++) {
        this.push(anotherArray[i], keys[i]);
      }
    }
  
    toArray(): T[] {
      return [...this.array];
    }
  }
