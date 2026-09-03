import { Paper, Stack, Typography } from '@mui/material';
import type { ActivityEvent } from '../domain/types';

type ActivityTimelineProps = {
  activity: ActivityEvent[];
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function ActivityTimeline({ activity }: ActivityTimelineProps) {
  const sorted = [...activity].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 860 }}>
      <Stack spacing={1.5}>
        <Typography component="h2" variant="h2">
          Activity
        </Typography>

        {sorted.length === 0 ? (
          <Typography component="p" variant="body2" color="text.secondary">
            No activity yet.
          </Typography>
        ) : (
          <Stack component="ol" spacing={1.2} sx={{ m: 0, pl: 2.5 }}>
            {sorted.map((event) => (
              <Stack key={event.id} component="li" spacing={0.45}>
                <Typography component="p" variant="body1" sx={{ fontWeight: 600 }}>
                  {event.summary}
                </Typography>
                <Typography component="p" variant="body2" color="text.secondary">
                  Type: {event.entityType} · Actor: {event.actor} · Source: {event.source} ·{' '}
                  <time dateTime={event.createdAt}>{formatTimestamp(event.createdAt)}</time>
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
