
export type DictEntry = { head: string; desc: string };

export const DICT_FILE_ENCODINGS = ["Shift-JIS", "UTF-8", "UTF-16"] as const;
export type DictionaryFileEncoding = typeof DICT_FILE_ENCODINGS[number];

export const DICT_FILE_FORMAT = ["EIJIRO", "TSV", "PDIC_LINE", "JSON"] as const;
export type DictionaryFileFormat = typeof DICT_FILE_FORMAT[number];
