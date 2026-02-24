import type {ColorTokenMetadata} from './types';

/**
 * Extract base palette reference from a token value reference string.
 * e.g. "{base.palette.blue.A200}" -> "blue/A200"
 * Only handles base.palette.* references; returns undefined otherwise.
 */
export function parseBaseRefFromValueRef(valueRef: string): string | undefined {
  const match = valueRef.match(/^\s*\{\s*base\.palette\.([^.]+)\.([^}]+)\s*\}\s*$/);
  if (!match) return undefined;
  return `${match[1]}/${match[2]}`;
}

interface SysColorTokenNode {
  value?: string;
  comment?: string;
  type?: string;
  [key: string]: unknown;
}

/**
 * Flatten sys.color (or any nested color token object) into a map of path -> metadata.
 * Paths are relative to "color" e.g. "color.surface.ai.hover" for lookup with system.color.surface.ai.hover.
 */
export function flattenSysColorTokens(
  node: Record<string, unknown>,
  prefix = 'color'
): Record<string, ColorTokenMetadata> {
  const out: Record<string, ColorTokenMetadata> = {};
  for (const [key, val] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const obj = val as SysColorTokenNode;
      if ('value' in obj && typeof obj.value === 'string') {
        out[path] = {
          valueRef: obj.value,
          comment: typeof obj.comment === 'string' ? obj.comment : undefined,
        };
      } else {
        Object.assign(out, flattenSysColorTokens(val as Record<string, unknown>, path));
      }
    }
  }
  return out;
}

/**
 * Lookup key for merging palette with JSON metadata.
 * system.color.surface.ai.hover -> color.surface.ai.hover
 */
export function jsPathToMetadataKey(jsPath: string): string {
  return jsPath.replace(/^system\./, '');
}
