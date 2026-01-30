export function escapeWhitespace(str: string): string { return str.replace(/\n/g, "\\n").replace(/\t/g, "\\t"); }
