/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import * as utils from "../utils";

import base from "./base";
import phrase from "./phrase";
import pronoun from "./pronoun";
import spelling from "./spelling";
import { build as buildDeinja } from "deinja";

// Lazy load
const nounRule = new Map<string, string>();
const phraseRule: number[][][] = [];
const pronounRule: Map<string, string>[] = [];
const spellingRule = new Map<string, string>();
const trailingRule: { search: string, new: string }[][] = [];
const verbRule = new Map<string, string>();
const lettersRule = new Map<number, number>();

let deinjaConvert = (word: string): string[] => [];
const registerLetters = (data: [number, number][]) => utils.updateMap<number>(lettersRule, data);
const registerNoun = (data: [string, string][]) => utils.updateMap(nounRule, data);
const registerPhrase = (data: number[][][]) => Object.assign(phraseRule, data);
const registerPronoun = (data: string[][][]) =>
  Object.assign(
    pronounRule,
    data.map((datum) => new Map(datum as Iterable<[string, string]>))
  );
const registerSpelling = (data: [string, string][]) => utils.updateMap(spellingRule, data);
const registerTrailing = (data: { search: string, new: string }[][]) => Object.assign(trailingRule, data);
const registerVerb = (data: [string, string][]) => utils.updateMap(verbRule, data);
const registerJa = (data: Record<string, [string, string, number][]>) => {
  deinjaConvert = buildDeinja(data);
};

const DEFAULT_RULE_FILE = "data/rule.json";

// Note: Parsing JSON is faster than long Object literals.
// https://v8.dev/blog/cost-of-javascript-2019
const readAndLoadRuleFiles = async (ruleFile: string) => {
  const rulePromise = utils.loadJson(ruleFile);

  // Redefine in order not to be executed twice
  loadBody = () => rulePromise;

  const loadedRuleData = await rulePromise;
  registerRuleData(loadedRuleData);

  return loadedRuleData;
};

export const registerRuleData = (ruleData: Record<string, any>) => {
  const processes = [
    { field: "letters", register: registerLetters },
    { field: "noun", register: registerNoun },
    { field: "phrase", register: registerPhrase },
    { field: "pronoun", register: registerPronoun },
    { field: "spelling", register: registerSpelling },
    { field: "trailing", register: registerTrailing },
    { field: "verb", register: registerVerb },
    { field: "ja", register: registerJa },
  ];

  for (let i = 0; i < processes.length; i++) {
    const proc = processes[i];
    const data = ruleData[proc.field];
    if (data) {
      proc.register(data);
    }
  }
};

let loadBody = readAndLoadRuleFiles;

export const load = async (ruleFile = DEFAULT_RULE_FILE) => {
  return loadBody(ruleFile);
};

export const doBase = (word: string) => base({ noun: nounRule, trailing: trailingRule, verb: verbRule }, word);
export const doLetters = (ch: number) => lettersRule.get(ch);
export const doPhrase = (words: string[]) => phrase(phraseRule, words);
export const doPronoun = (words: string[]) => pronoun(pronounRule, words);
export const doSpelling = (words: string[]) => spelling(spellingRule, words);
export const doJa = (word: string) => deinjaConvert(word);

export default {
  load,
  registerRuleData,
  doBase,
  doLetters,
  doPhrase,
  doPronoun,
  doSpelling,
  doJa,
};
