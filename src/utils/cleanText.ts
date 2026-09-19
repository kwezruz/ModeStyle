export function cleanText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&lt;|&gt;/gi, '')
    .replace(/<|>/g, '')
    .trim();
}
