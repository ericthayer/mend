import { alpha, type Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';

/**
 * Shared layout tokens for the section-level Paper surfaces (Case summary,
 * Next actions, Case records, Drafts, Activity). Keeping this in one place
 * ensures every section uses the same spacing-scale values (16px / 24px)
 * instead of ad hoc, off-scale padding.
 */
export const SECTION_MAX_WIDTH = 860;

export const sectionSurfaceSx: SxProps<Theme> = {
  p: { xs: 2, sm: 3 },
  maxWidth: SECTION_MAX_WIDTH,
};

/**
 * The "needs your review" surface is the one place in the app where the
 * person must exercise the human authority boundary. It uses the app's
 * locked amber review-state token as a subtle tinted surface so it reads as
 * distinct from the neutral reference sections around it.
 */
export function reviewSurfaceSx(theme: Theme) {
  return {
    p: { xs: 2, sm: 3 },
    maxWidth: SECTION_MAX_WIDTH,
    backgroundColor: alpha(theme.palette.warning.light, 0.08),
    borderColor: alpha(theme.palette.warning.main, 0.4),
    boxShadow: `0 10px 26px ${alpha(theme.palette.warning.main, 0.16)}`,
  } as const;
}
