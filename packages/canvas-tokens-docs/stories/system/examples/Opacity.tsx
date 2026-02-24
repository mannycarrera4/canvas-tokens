import * as React from 'react';
import {system} from '@workday/canvas-tokens-web';
import {TokenGrid, formatJSVar} from '../../../components/TokenGrid';

interface OpacityToken {
  /** The name of the CSS variable */
  cssVar: string;
  /** The formatted name of the JS variable */
  jsVar: React.ReactNode;
  /** The actual string value of the token */
  value: string;
  /** The decimal value (0-1) for display */
  decimalValue: string;
}

/** Flatten nested opacity object into { path, cssVar } entries */
function flattenOpacityTokens(
  obj: Record<string, unknown>,
  path: string[] = []
): Array<{path: string; cssVar: string}> {
  const entries: Array<{path: string; cssVar: string}> = [];
  for (const [key, val] of Object.entries(obj)) {
    const nextPath = [...path, key];
    const pathStr = `system.opacity.${nextPath.join('.')}`;
    if (typeof val === 'string' && val.startsWith('--')) {
      entries.push({path: pathStr, cssVar: val});
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      entries.push(...flattenOpacityTokens(val as Record<string, unknown>, nextPath));
    }
  }
  return entries;
}

const opacityEntries = flattenOpacityTokens(
  system.opacity as unknown as Record<string, unknown>
);

const opacityTokens: OpacityToken[] = opacityEntries.map(({path, cssVar}) => {
  const value =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(cssVar) || ''
      : '';
  const decimalValue = value ? parseFloat(value).toFixed(2) : '—';
  return {
    cssVar,
    jsVar: formatJSVar(path),
    value,
    decimalValue,
  };
});

export function OpacityTokens() {
  return (
    <TokenGrid
      caption="opacity tokens"
      headings={['Sample', 'CSS Variable', 'JS Variable', 'Value', 'Decimal']}
      rows={opacityTokens}
    >
      {token => (
        <>
          <TokenGrid.RowItem>
            <TokenGrid.Sample
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: `var(${system.color.bg.primary.default})`,
                opacity: `var(${token.cssVar})`,
              }}
            />
          </TokenGrid.RowItem>
          <TokenGrid.RowItem>
            <TokenGrid.MonospaceLabel>{token.cssVar}</TokenGrid.MonospaceLabel>
          </TokenGrid.RowItem>
          <TokenGrid.RowItem>
            <TokenGrid.MonospaceLabel>{token.jsVar}</TokenGrid.MonospaceLabel>
          </TokenGrid.RowItem>
          <TokenGrid.RowItem>{token.value || '—'}</TokenGrid.RowItem>
          <TokenGrid.RowItem>{token.decimalValue}</TokenGrid.RowItem>
        </>
      )}
    </TokenGrid>
  );
}
