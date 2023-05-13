
import entryGeneratorJa from "./ja";
import entryGeneratorEn from "./en";

// Can add other languages here
const generators = {
    en: entryGeneratorEn,
    ja: entryGeneratorJa,
    default: entryGeneratorEn,
};
type SupportedLanguages = 'en' | 'ja';

let detectLanguage = (text: string): SupportedLanguages => (isEnglishText(text) ? "en" : "ja");

const isEnglishText = (str: string) => {
    let result = true;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        const isEnglishLike = (0x20 <= code && code <= 0x7e) || code === 0x2011 || code === 0x200c;
        if (!isEnglishLike) {
            result = false;
            break;
        }
    }
    return result;
};


const builder = (languageDetector: (text: string) => SupportedLanguages, generators: {
    en: (rawSourceStr: string, withCapitalized?: boolean, mustIncludeOriginalText?: boolean) => string[];
    ja: (sourceStr: string) => string[];
    default: (rawSourceStr: string, withCapitalized?: boolean, mustIncludeOriginalText?: boolean) => string[];
}) => {
    return (text: string, withCapitalized?: boolean, mustIncludeOriginalText?: boolean) => {
        const lang = languageDetector(text);
        const generator = generators[lang] ?? generators.default;
        const entries = generator(text, withCapitalized, mustIncludeOriginalText);
        return { entries, lang };
    };
};

export const build = () => {
    return builder(detectLanguage, generators);
};

