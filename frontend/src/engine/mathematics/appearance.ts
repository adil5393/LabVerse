/**
 * Shared Appearance & Color System for LabVerse Mathematics Laboratory
 *
 * Implements accessible color palettes, contrast helpers, and color utilities
 * for points, line segments, infinite lines, and committed measurements.
 */

import type { MathDefaultColors } from './types';

export interface ColorSwatch {
  name: string;
  value: string;
  textClass?: string;
}

/**
 * Curated preset color palette optimized for high contrast on dark LabVerse canvas.
 */
export const MATH_COLOR_PALETTE: readonly ColorSwatch[] = [
  { name: 'Blue', value: '#60A5FA' },
  { name: 'Purple', value: '#A78BFA' },
  { name: 'Cyan', value: '#22D3EE' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Green', value: '#34D399' },
  { name: 'Rose', value: '#FB7185' },
  { name: 'White', value: '#F8FAFC' },
  { name: 'Orange', value: '#F97316' },
] as const;

/**
 * Default color settings for newly created geometry objects and measurements.
 */
export const DEFAULT_MATH_COLORS: MathDefaultColors = {
  point: '#60A5FA', // Blue
  segment: '#A78BFA', // Purple
  line: '#22D3EE', // Cyan
  measurement: '#F59E0B', // Amber
};

/**
 * Normalizes hex colors to uppercase #RRGGBB.
 */
export function normalizeHexColor(hex: string): string {
  if (!hex) return '#FFFFFF';
  let clean = hex.trim();
  if (!clean.startsWith('#')) clean = `#${clean}`;
  if (clean.length === 4) {
    // #RGB -> #RRGGBB
    clean = `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
  }
  return clean.toUpperCase();
}

/**
 * Checks if a color matches one of the standard presets.
 */
export function isPresetColor(color: string): boolean {
  const norm = normalizeHexColor(color);
  return MATH_COLOR_PALETTE.some((p) => p.value.toUpperCase() === norm);
}

/**
 * Converts a hex color string to rgba format with the specified opacity.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const norm = normalizeHexColor(hex);
  const r = parseInt(norm.slice(1, 3), 16) || 0;
  const g = parseInt(norm.slice(3, 5), 16) || 0;
  const b = parseInt(norm.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Determines whether light or dark text provides better contrast against a background.
 */
export function getContrastingTextColor(hex: string): '#0f172a' | '#f8fafc' {
  const norm = normalizeHexColor(hex);
  const r = parseInt(norm.slice(1, 3), 16) || 0;
  const g = parseInt(norm.slice(3, 5), 16) || 0;
  const b = parseInt(norm.slice(5, 7), 16) || 0;
  // Perceived luminance formula (ITU-R BT.709)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? '#0f172a' : '#f8fafc';
}
