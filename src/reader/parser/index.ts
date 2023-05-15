
import { SimpleDictParser } from "./simpledictparser";
import { JsonDictParser } from "./jsondictparser";
import { EijiroParser } from "./eijiroparser";
import { DictionaryFileFormat } from '../types';

export { DictParser } from './interface';

export const createDictParser = (format: DictionaryFileFormat) => {
    switch (format) {
        case "TSV":
            return new SimpleDictParser("\t");
        case "PDIC_LINE":
            return new SimpleDictParser(" /// ");
        case "EIJIRO":
            return new EijiroParser();
        case "JSON":
            return new JsonDictParser();
        default:
            throw new Error("Unknown File Format: " + format);
    }
};
