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

export const SECTION_TINTS: Record<SectionTintKey, { bg: string; fg: string }> = {
  case: { bg: '#e6eefa', fg: '#174a84' },
  review: { bg: '#fbefd6', fg: '#8f6210' },
  actions: { bg: '#e1f3e9', fg: '#1f7a4d' },
  records: { bg: '#ebe7fb', fg: '#5a48b5' },
  drafts: { bg: '#dcf2f3', fg: '#0f6d75' },
  activity: { bg: '#ecece9', fg: '#4b5563' },
  safety: { bg: '#fbe6e6', fg: '#a13d3f' },
};

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
