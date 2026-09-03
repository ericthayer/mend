import { Button, Paper, Stack, Typography } from '@mui/material';
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
        p: { xs: 3, sm: 5 },
        mx: 'auto',
        maxWidth: 640,
        display: 'grid',
        justifyItems: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <IconTile tint="case" size={56}>
        <HouseIcon width={28} height={28} />
      </IconTile>
      <Typography component="h2" variant="h2" id="empty-state-heading" sx={{ fontSize: '1.375rem' }}>
        Next useful step
      </Typography>
      <Typography component="p" variant="body1" color="text.secondary" sx={{ maxWidth: '52ch' }}>
        Start a local-only case to organize what happened, what you know, and what should happen
        next. No account is required.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' }, pt: 1 }}>
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

      <Typography component="p" variant="body2" color="text.secondary">
        Data stays in your browser for this contest build and can be deleted at any time.
      </Typography>
    </Paper>
  );
}
