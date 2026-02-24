import * as React from 'react';
import type {ColorSwatch} from '../ColorGrid';
import type {ColorTokenMetadata, ColorTokenRow} from './types';
import {rgbStringToHex} from './colorUtils';
import {flattenSysColorTokens, jsPathToMetadataKey, parseBaseRefFromValueRef} from './utils';
import './index.css';

export {flattenSysColorTokens} from './utils';
export type {ColorTokenRow, ColorTokenMetadata} from './types';

/**
 * Merge palette (from buildPalette/buildPaletteGroup) with optional JSON metadata
 * to produce rows for ColorTokenTable. Use metadata from flattenSysColorTokens(sysJson.sys.color).
 */
export function buildColorTokenRows(
  swatches: ColorSwatch[],
  metadata?: Record<string, ColorTokenMetadata>
): ColorTokenRow[] {
  return swatches.map(swatch => {
    const key = jsPathToMetadataKey(swatch.jsPath);
    const meta = metadata?.[key];
    const baseRef = meta?.valueRef
      ? parseBaseRefFromValueRef(meta.valueRef)
      : undefined;
    return {
      cssVar: swatch.cssVar,
      jsVar: swatch.jsVar,
      jsPath: swatch.jsPath,
      value: swatch.value,
      purpose: swatch.purpose,
      comment: meta?.comment,
      baseRef,
    };
  });
}

/** Human-readable title from token path (e.g. system.color.surface.ai.hover -> Surface AI Hover) */
function pathToTitle(jsPath: string): string {
  const withoutPrefix = jsPath.replace(/^system\.color\./, '');
  return withoutPrefix
    .split(/[.\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function getSwatchStyle(token: ColorTokenRow): React.CSSProperties {
  const property = token.value.startsWith('linear-gradient(')
    ? 'backgroundImage'
    : 'backgroundColor';
  return {[property]: `var(${token.cssVar})`};
}

type ValueFormat = 'rgb' | 'hex';

function ComputedValueCell({value}: {value: string}) {
  const [format, setFormat] = React.useState<ValueFormat>('rgb');
  const isRgb = value.startsWith('rgb');
  const hexValue = isRgb ? rgbStringToHex(value) : value;
  const displayValue = format === 'hex' && isRgb ? hexValue : value;
  if (!value) return <span className="color-token-table__computed-value">—</span>;
  return (
    <div>
      <div className="color-token-table__format-toggles">
        <button
          type="button"
          className="color-token-table__format-toggle"
          data-active={format === 'rgb'}
          onClick={() => setFormat('rgb')}
        >
          {isRgb ? 'rgba' : 'value'}
        </button>
        {isRgb && (
          <button
            type="button"
            className="color-token-table__format-toggle"
            data-active={format === 'hex'}
            onClick={() => setFormat('hex')}
          >
            hex
          </button>
        )}
      </div>
      <div className="color-token-table__computed-value">{displayValue}</div>
    </div>
  );
}

export interface ColorTokenTableProps {
  caption: string;
  rows: ColorTokenRow[];
}

export function ColorTokenTable({caption, rows}: ColorTokenTableProps) {
  return (
    <table className="color-token-table">
      <caption className="color-token-table__caption cnvs-sys-type-subtext-large">
        {caption}
      </caption>
      <thead className="color-token-table__head">
        <tr className="color-token-table__row">
          <th className="color-token-table__head-item">Color</th>
          <th className="color-token-table__head-item">Token Name</th>
          <th className="color-token-table__head-item">Description</th>
          <th className="color-token-table__head-item">Usage</th>
        </tr>
      </thead>
      <tbody className="color-token-table__body">
        {rows.map((token, index) => (
          <tr key={index} className="color-token-table__row">
            <td className="color-token-table__cell">
              <div className="color-token-table__swatch-wrap">
                <span
                  className="color-token-table__swatch"
                  style={getSwatchStyle(token)}
                  title={token.value || undefined}
                />
                {token.baseRef && (
                  <span className="color-token-table__pill color-token-table__pill--small">
                    {token.baseRef}
                  </span>
                )}
              </div>
            </td>
            <td className="color-token-table__cell">
              <span className="color-token-table__pill color-token-table__token-name">
                ${token.jsPath.replace(/^system\./, '')}
              </span>
            </td>
            <td className="color-token-table__cell">
              <div className="color-token-table__description-title">
                {pathToTitle(token.jsPath)}
              </div>
              {(token.comment || token.purpose) && (
                <div className="color-token-table__description-text">
                  {token.comment ?? token.purpose}
                </div>
              )}
              <div className="color-token-table__computed-label">Computed Value</div>
              <ComputedValueCell value={token.value} />
            </td>
            <td className="color-token-table__cell">
              <div className="color-token-table__usage-group">
                <div className="color-token-table__usage-row">
                  <span className="color-token-table__usage-label">CSS</span>
                  <span className="color-token-table__pill">{token.cssVar}</span>
                </div>
                <div className="color-token-table__usage-row">
                  <span className="color-token-table__usage-label">JS</span>
                  <span className="color-token-table__pill">{token.jsPath}</span>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
