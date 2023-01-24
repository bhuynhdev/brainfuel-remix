export const safeGetKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;
