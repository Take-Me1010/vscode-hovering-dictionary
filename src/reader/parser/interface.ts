
import { DictEntry } from '../types';

export interface DictParser {
    addLine(line: string): DictEntry | null;
    flush(): Record<string, string> | null;
}

