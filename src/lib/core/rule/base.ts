/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

import { UniqList } from "../../uniqlist";
import { tryToReplaceTrailingStrings } from "../../text";

export default (rule: {noun: Map<string, string>, trailing: {
  search: string;
  new: string;
}[][], verb: Map<string, string>}, word: string) => {
  const list = new UniqList<string>();
  const v = rule.verb.get(word);
  if (v) {
    list.push(v);
  }
  const n = rule.noun.get(word);
  if (n) {
    list.push(n);
  }
  const otherForms = tryToReplaceTrailingStrings(word, rule.trailing);
  list.merge(otherForms);
  return list.toArray();
};
