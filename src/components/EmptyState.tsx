import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { HouseIcon } from './icons';
import { IconTile } from './SectionCard';

type EmptyStateProps = {
  onStartBlank: () => void;
  onLoadDemo: () => void;
  busy?: boolean;
};

export function EmptyState({ onStartBlank, onLoadDemo, busy = false }: EmptyStateProps) {
  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="empty-state-heading"
      sx={{
        p: { xs: 1, sm: 1.5 },
        mx: 'auto',
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        boxShadow: '0 24px 56px rgb(var(--mui-palette-primary-darkChannel) / 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.12fr) minmax(17rem, 0.88fr)' },
          gap: { xs: 1, md: 1.5 },
          alignItems: 'stretch',
        }}
      >
        <Stack
          spacing={{ xs: 2, sm: 2.5 }}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            justifyContent: 'center',
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <IconTile tint="case" size={56}>
            <HouseIcon width={28} height={28} />
          </IconTile>
          <Typography
            component="h2"
            variant="h2"
            id="empty-state-heading"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem' },
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              textWrap: 'balance',
            }}
          >
            Choose how to begin
          </Typography>
          <Typography
            component="p"
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '48ch', textWrap: 'pretty' }}
          >
            Start a private case for your situation. If you want to see the flow first, load the sample
            flood case.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' }, pt: 0.5 }}
          >
            <Button
              type="button"
              variant="contained"
              onClick={onStartBlank}
              disabled={busy}
              sx={{ minWidth: 200 }}
            >
              Start a blank case
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={onLoadDemo}
              disabled={busy}
              sx={{ minWidth: 200 }}
            >
              Load flood demo
            </Button>
          </Stack>

          <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '52ch' }}>
            Stored only in this browser. No account is required, and you can delete it any time.
          </Typography>
        </Stack>

        <Box
          component="aside"
          aria-labelledby="start-control-heading"
          sx={{
            p: { xs: 2.5, sm: 3, md: 3.5 },
            display: 'flex',
            alignItems: 'center',
            borderRadius: '12px',
            backgroundColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.07)',
            border: '1px solid',
            borderColor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.14)',
          }}
        >
          <Stack spacing={2.25} sx={{ width: '100%' }}>
            <Box>
              <Typography component="h3" variant="h3" id="start-control-heading" sx={{ mb: 0.75 }}>
                What each choice does
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '35ch' }}>
                Both options keep planning visible and under your control.
              </Typography>
            </Box>
            <Box component="ul" sx={{ display: 'grid', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ borderLeft: '2px solid', borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  Start a blank case
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Creates a private space for your situation.
                </Typography>
              </Box>
              <Box component="li" sx={{ borderLeft: '2px solid', borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  Load flood demo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Opens a sample case so you can see the workflow.
                </Typography>
              </Box>
              <Box component="li" sx={{ borderLeft: '2px solid', borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  Review before deciding
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You review every proposed plan before it becomes active.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
