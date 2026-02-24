/**
 * Parse rgb or rgba string and return hex (and optional alpha).
 * getComputedStyle typically returns "rgb(r, g, b)" or "rgba(r, g, b, a)".
 */
export function rgbStringToHex(rgb: string): string {
  const match = rgb.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
  );
  if (!match) return rgb;
  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  const a = match[4] !== undefined ? Number(match[4]) : 1;
  const hex =
    '#' +
    [r, g, b]
      .map(x => {
        const h = x.toString(16);
        return h.length === 1 ? '0' + h : h;
      })
      .join('');
  if (a < 1) {
    const aHex = Math.round(a * 255).toString(16);
    return hex + (aHex.length === 1 ? '0' + aHex : aHex);
  }
  return hex;
}
