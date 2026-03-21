/**
 * Décode les entités HTML courantes dans une chaîne.
 * Utile car @tmcw/togeojson peut laisser passer des entités non décodées
 * dans les noms de traces (ex: &#039; pour l'apostrophe).
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
