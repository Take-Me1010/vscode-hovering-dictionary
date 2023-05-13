/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import rule from "./core/rule";

const RE_NON_BREAKING_HYPHEN = /‑/g;

// aaa-bbb -> aaa-bbb
// aaa-\nbbb -> aaabbb
// aaa-%&*bbb -> aaabbb
export const dealWithHyphens = (sourceStr: string, doIsValidCharacter = isValidCharacter) => {
  const str = sourceStr.replace(RE_NON_BREAKING_HYPHEN, "-");
  let result = "";
  let currentIndex = 0;

  for (;;) {
    if (currentIndex >= str.length) {
      result += str.substring(currentIndex);
      break;
    }
    const hyphenIndex = str.indexOf("-", currentIndex);
    if (hyphenIndex === -1 || hyphenIndex === str.length - 1) {
      result += str.substring(currentIndex);
      break;
    }

    let found = false;
    result += str.substring(currentIndex, hyphenIndex);
    for (let i = hyphenIndex + 1; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (doIsValidCharacter(code)) {
        if (i === hyphenIndex + 1) {
          // right after the hyphen
          result += "-";
        }
        currentIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      currentIndex = str.length;
    }
  }
  return result;
};

/**
 * "American English" -> ["American", "English"]
 * "American.English" -> ["American", "English"]
 * "American,English" -> ["American", "English"]
 * "American-English" -> ["American-English"]
 * "American_English" -> ["American_English"]
 */
export const splitIntoWords = (str: string, doIsValidCharacter = isValidCharacter) => {
  const words: string[] = [];
  let startIndex: number | null = null;
  let i = 0;
  for (;;) {
    const code = str.charCodeAt(i);
    const isEnglishCharacter = doIsValidCharacter(code);
    if (isEnglishCharacter) {
      if (startIndex === null) {
        startIndex = i;
      }
    } else {
      if (startIndex !== null) {
        const newWord = str.substring(startIndex, i);
        words.push(newWord);
        startIndex = null;
      }
    }
    i += 1;

    if (i >= str.length) {
      if (startIndex !== null) {
        const newWord = str.substring(startIndex);
        words.push(newWord);
      }
      break;
    }
  }
  return words;
};

const makeArrayIncludingLoweredString = (str: string) => {
  const arr = [str];
  const loweredStr = str.toLowerCase();
  if (loweredStr !== str) {
    arr.push(loweredStr);
  }
  return arr;
};

/**
 * "camelCase" -> ["camel", "Case", "case"]
 * "Material-UI" -> ["Material", "material", "UI", "ui"]
 */
export const splitString = (str: string, minWordLength: number) => {
  const arr: string[] = [];
  let startIndex = 0;
  let i = 0;
  let prevIsCapital = true;
  while (i < str.length) {
    const chCode = str.charCodeAt(i);
    const isCapital = chCode >= 65 && chCode <= 90;
    let wordToAdd: string | null = null;
    // # - . _
    if (chCode === 35 || chCode === 45 || chCode === 46 || chCode === 95) {
      wordToAdd = str.substring(startIndex, i);
      startIndex = i + 1;
      prevIsCapital = false;
    } else if (isCapital && !prevIsCapital && startIndex - i !== 0) {
      wordToAdd = str.substring(startIndex, i);
      startIndex = i;
      prevIsCapital = false;
    } else {
      prevIsCapital = isCapital;
    }
    if (wordToAdd && wordToAdd.length >= minWordLength) {
      arr.push(...makeArrayIncludingLoweredString(wordToAdd));
    }
    i += 1;
  }
  if (startIndex > 0) {
    const lastWord = str.substring(startIndex);
    if (lastWord) {
      arr.push(...makeArrayIncludingLoweredString(lastWord));
    }
  }
  return arr;
};

export const replaceTrailingCharacters = (str: string, searchValue: string, newValue: string) => {
  let result: string | null = null;
  if (str.endsWith(searchValue)) {
    result = str.substring(0, str.length - searchValue.length) + newValue;
  }
  return result;
};

export const tryToReplaceTrailingStrings = (str: string, trailingRule: { search: string, new: string }[][], minLength = 3) => {
  let words: string[] = [];

  for (let i = 0; i < trailingRule.length; i++) {
    const tlist = trailingRule[i];
    for (let j = 0; j < tlist.length; j++) {
      const t = tlist[j];
      let w = replaceTrailingCharacters(str, t.search, t.new);
      if (w && w.length >= minLength) {
        words.push(w);
        break;
      }
    }
  }
  return words;
};

/**
 * ["American", "English"]
 * -> ["American English", "American", "american english", "american"]);
 *
 * ["dealt", "with"]
 * -> ["dealt with", "dealt", "deal with", "deal"]
 *
 * ["running", "away"]
 * -> ["running away", "running", "run away", "run"]
 */
export const linkWords = (words: string[], minWordNum = 1, enablePhrasing = true): string[] => {
  if (words.length === 0) {
    return [];
  }
  const firstWordsList = makeFirstWordsList(words[0]);
  const wordsWithoutFirstWord = words.slice(1);

  const result1: string[] = [];
  const result2: string[] = [];
  for (const wordList of firstWordsList) {
    wordList.push(...wordsWithoutFirstWord);
    const { linkedWords, phraseProcessedWords } = makeLinkedWords(wordList, minWordNum, enablePhrasing);
    result1.push(...linkedWords.reverse());
    result2.push(...phraseProcessedWords);
  }
  result1.push(...result2);

  return result1;
};

const makeLinkedWords = (wordList: string[], minWordNum: number, enablePhrasing = true) => {
  const linkedWords: string[] = [];
  const phraseProcessedWords: string[] = [];

  const currentWords: string[] = [];
  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];
    currentWords.push(word);
    if (i >= minWordNum - 1) {
      linkedWords.push(currentWords.join(" "));
      if (enablePhrasing) {
        const phraseProcessed = rule.doPhrase(currentWords).map((a) => a.join(" "));
        phraseProcessedWords.push(...phraseProcessed);
      }
    }
  }
  return { linkedWords, phraseProcessedWords };
};

const makeFirstWordsList = (firstWord: string) => {
  const firstWordsList = [[firstWord]];
  const base = rule.doBase(firstWord);
  if (base.length >= 1) {
    firstWordsList.push(...base.map((a) => [a]));
  }

  return firstWordsList;
};

const isValidCharacter = (code: number) => code >= 33 && code <= 126;

