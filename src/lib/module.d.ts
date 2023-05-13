/**
 * interface for deinja
 */
declare module "deinja" {
    export const build: (data: Record<string, [string, string, number][]>) => (word: string) => string[];
}
