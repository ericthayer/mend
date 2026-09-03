import type { ReactNode, Ref } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { sectionSurfaceSx, sectionTintSx, type SectionTintKey } from '../styles/surfaces';

type IconTileProps = {
  tint: SectionTintKey;
  children: ReactNode;
  size?: number;
};

export function IconTile({ tint, children, size = 44 }: IconTileProps) {
  return (
    <Box
      aria-hidden="true"
      sx={[
        ...sectionTintSx(tint),
        {
          width: size,
          height: size,
          flex: '0 0 auto',
          display: 'grid',
          placeItems: 'center',
          borderRadius: Math.round(size * 0.32),
        },
      ]}
    >
      {children}
    </Box>
  );
}

type SectionCardProps = {
  id: string;
  tint: SectionTintKey;
  icon: ReactNode;
  title: string;
  titleSx?: SxProps<Theme>;
  meta?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
  sx?: SxProps<Theme>;
  children: ReactNode;
};

export function SectionCard({
  id,
  tint,
  icon,
  title,
  titleSx,
  meta,
  headingRef,
  sx,
  children,
}: SectionCardProps) {
  const headingId = `${id}-heading`;

  return (
    <Paper
      component="section"
      id={id}
      elevation={0}
      aria-labelledby={headingId}
      sx={[sectionSurfaceSx, ...(Array.isArray(sx) ? sx : [sx])] as SxProps<Theme>}
    >
      <Stack spacing={2}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: 1.5,
            rowGap: 1,
          }}
        >
          <IconTile tint={tint}>{icon}</IconTile>
          <Typography
            component="h2"
            variant="h2"
            id={headingId}
            ref={headingRef}
            tabIndex={headingRef ? -1 : undefined}
            sx={[
              { mr: 'auto', outlineOffset: 4 },
              ...(titleSx ? (Array.isArray(titleSx) ? titleSx : [titleSx]) : []),
            ] as SxProps<Theme>}
          >
            {title}
          </Typography>
          {meta ? (
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {meta}
            </Box>
          ) : null}
        </Box>
        {children}
      </Stack>
    </Paper>
  );
}
