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
        maxWidth: 960,
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
              fontSize: { xs: '1.625rem', sm: '2rem' },
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              textWrap: 'balance',
            }}
          >
            Next useful step
          </Typography>
          <Typography
            component="p"
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '48ch', textWrap: 'pretty' }}
          >
            Start a local-only case to organize what happened, what you know, and what should happen
            next. No account is required.
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
            Data stays in your browser for this contest build and can be deleted at any time.
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
                You remain in control
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '35ch' }}>
                Mend keeps planning visible and local. It does not make decisions or contact anyone for you.
              </Typography>
            </Box>
            <Box component="ul" sx={{ display: 'grid', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}>
              <Box component="li" sx={{ borderLeft: '2px solid', borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  Your case stays in this browser.
                </Typography>
              </Box>
              <Box component="li" sx={{ borderLeft: '2px solid', borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  Plans wait for your review.
                </Typography>
              </Box>
              <Box component="li" sx={{ borderLeft: '2px solid', borderColor: 'primary.main', pl: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 650 }}>
                  No account is required.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
