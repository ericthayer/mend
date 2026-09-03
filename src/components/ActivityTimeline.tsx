import { Box, Stack, Typography } from '@mui/material';
import { SECTION_TINTS } from '../styles/surfaces';
import { ClockIcon } from './icons';
import { SectionCard } from './SectionCard';
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
    <SectionCard id="activity" tint="activity" icon={<ClockIcon />} title="Activity">
      {sorted.length === 0 ? (
        <Typography component="p" variant="body1" color="text.secondary">
          No activity yet.
        </Typography>
      ) : (
        <Stack component="ol" role="list" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none', position: 'relative' }}>
          {sorted.map((event, index) => (
            <Stack
              key={event.id}
              component="li"
              direction="row"
              spacing={1.5}
              sx={{ position: 'relative', pb: index === sorted.length - 1 ? 0 : 2.5 }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  position: 'relative',
                  flex: '0 0 auto',
                  width: 12,
                  display: 'flex',
                  justifyContent: 'center',
                  pt: '7px',
                  '&::before':
                    index === sorted.length - 1
                      ? undefined
                      : {
                          content: '""',
                          position: 'absolute',
                          top: 19,
                          bottom: -20,
                          left: 5,
                          width: 2,
                          bgcolor: 'divider',
                        },
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: event.actor === 'user' ? 'primary.main' : SECTION_TINTS.activity.fg,
                    boxShadow: '0 0 0 3px #ffffff',
                  }}
                />
              </Box>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography component="p" variant="body1" sx={{ fontWeight: 600 }}>
                  {event.summary}
                </Typography>
                <Typography component="p" variant="body2" color="text.secondary">
                  Type: {event.entityType} · Actor: {event.actor} · Source: {event.source} ·{' '}
                  <time dateTime={event.createdAt}>{formatTimestamp(event.createdAt)}</time>
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
