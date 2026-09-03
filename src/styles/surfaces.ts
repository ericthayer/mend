import { alpha, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

/**
 * Shared layout tokens for the section-level Paper surfaces. Every section
 * uses the same spacing-scale padding (16px / 24px); width is owned by the
 * dashboard grid in App.tsx, not by the card.
 */
export const sectionSurfaceSx: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
};

/**
 * Soft tint + ink pair used for each section's icon tile. Tints are
 * decorative identifiers only — every section also carries a text heading —
 * so they sit outside the locked semantic palette (primary / warning / error).
 */
export type SectionTintKey = 'case' | 'review' | 'actions' | 'records' | 'drafts' | 'activity' | 'safety';

export const SECTION_TINTS: Record<
  SectionTintKey,
  { light: { bg: string; fg: string }; dark: { bg: string; fg: string } }
> = {
  case: {
    light: { bg: '#e6eefa', fg: '#174a84' },
    dark: { bg: '#243b55', fg: '#a8cdf5' },
  },
  review: {
    light: { bg: '#fbefd6', fg: '#8f6210' },
    dark: { bg: '#493a20', fg: '#f0c66d' },
  },
  actions: {
    light: { bg: '#e1f3e9', fg: '#1f7a4d' },
    dark: { bg: '#1e4434', fg: '#70d3a0' },
  },
  records: {
    light: { bg: '#ebe7fb', fg: '#5a48b5' },
    dark: { bg: '#393451', fg: '#c9c0f6' },
  },
  drafts: {
    light: { bg: '#dcf2f3', fg: '#0f6d75' },
    dark: { bg: '#1e4146', fg: '#8edce1' },
  },
  activity: {
    light: { bg: '#ecece9', fg: '#4b5563' },
    dark: { bg: '#303943', fg: '#c1ccd8' },
  },
  safety: {
    light: { bg: '#fbe6e6', fg: '#a13d3f' },
    dark: { bg: '#4a292d', fg: '#ef8d8f' },
  },
};

export function sectionTintSx(tint: SectionTintKey) {
  const colors = SECTION_TINTS[tint];

  return [
    {
      bgcolor: colors.light.bg,
      color: colors.light.fg,
    },
    (theme: Theme) =>
      theme.applyStyles('dark', {
        bgcolor: colors.dark.bg,
        color: colors.dark.fg,
      }),
  ] as const;
}

/**
 * The "needs your review" surface is the one place in the app where the
 * person must exercise the human authority boundary. It uses the locked amber
 * review-state token as a warm tint so it reads as distinct from the white
 * reference sections around it. Elevation is declared once (border), so no
 * shadow.
 */
export function reviewSurfaceSx(theme: Theme) {
  return {
    p: { xs: 2, sm: 3 },
    backgroundColor: alpha(theme.palette.warning.light, 0.07),
    borderColor: alpha(theme.palette.warning.main, 0.35),
  } as const;
}
