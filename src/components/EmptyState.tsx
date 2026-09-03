import { Button, Paper, Stack, Typography } from '@mui/material';

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
      sx={{ p: { xs: 2.5, sm: 3.5 }, display: 'grid', gap: 2, maxWidth: 720 }}
    >
      <Typography component="h2" variant="h2">
        Next useful step
      </Typography>
      <Typography component="p" variant="body1" sx={{ maxWidth: '68ch' }}>
        Start a local-only case to organize what happened, what you know, and what should happen
        next. No account is required.
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button
          type="button"
          variant="contained"
          onClick={onStartBlank}
          disabled={busy}
          sx={{ minWidth: 220 }}
        >
          Start a blank case
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={onLoadDemo}
          disabled={busy}
          sx={{ minWidth: 220 }}
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
