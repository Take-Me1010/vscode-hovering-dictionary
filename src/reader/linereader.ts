/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

export class LineReader {
  data: string;
  lineFeedString: string | null;
  currentIndex: number;
  currentLine: string | null;

  constructor(data: string) {
    this.data = data;
    this.lineFeedString = this.detectLineFeedString(data);
    this.currentIndex = 0;
    this.currentLine = null;
  }

  private detectLineFeedString(data: string): string | null {
    const index = data.indexOf("\n");
    if (index < 0) {
      return null;
    }
    if (data[index - 1] === "\r") {
      return "\r\n";
    }
    return "\n";
  }

  public next() {
    if (this.currentIndex === -1) {
      this.currentLine = null;
      return false;
    }
    if (this.lineFeedString === null) {
      this.currentIndex = -1;
      this.currentLine = this.data;
      return true;
    }
    const nextLfIndex = this.data.indexOf(this.lineFeedString, this.currentIndex);
    if (nextLfIndex >= 0) {
      this.currentLine = this.data.substring(this.currentIndex, nextLfIndex);
      this.currentIndex = nextLfIndex + this.lineFeedString.length;
      if (this.currentIndex === this.data.length) {
        this.currentIndex = -1;
      }
      return true;
    }
    this.currentLine = this.data.substring(this.currentIndex);
    this.currentIndex = -1;
    return true;
  }

  public getLine(): string | null {
    return this.currentLine;
  }
}
