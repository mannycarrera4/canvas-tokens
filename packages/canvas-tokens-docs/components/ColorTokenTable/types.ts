import type * as React from 'react';

/** Metadata for a color token from JSON (value reference and optional comment) */
export interface ColorTokenMetadata {
  valueRef: string;
  comment?: string;
}

/** Extended color token row for the doc table (Color, Token Name, Description, Usage) */
export interface ColorTokenRow {
  /** CSS variable name (e.g. --cnvs-sys-color-surface-ai-hover) */
  cssVar: string;
  /** Formatted JS variable for display (with word-break) */
  jsVar: React.ReactNode;
  /** JS path string for token name pill (e.g. system.color.surface.ai.hover) */
  jsPath: string;
  /** Resolved/computed value from the CSS variable (e.g. rgb(...) or hex) */
  value: string;
  /** Purpose/use case from docs (e.g. "Surface color for navigation") */
  purpose?: string;
  /** Comment from token JSON */
  comment?: string;
  /** Base palette reference derived from valueRef (e.g. blue/A200) */
  baseRef?: string;
}
