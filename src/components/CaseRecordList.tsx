import { Box, Chip, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { FolderIcon } from './icons';
import { SectionCard } from './SectionCard';
import type { CaseRecord } from '../domain/types';

type CaseRecordListProps = {
  records: CaseRecord[];
  sx?: SxProps<Theme>;
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function CaseRecordList({ records, sx }: CaseRecordListProps) {
  const sorted = [...records].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <SectionCard
      id="records"
      tint="records"
      icon={<FolderIcon />}
      title="Case records"
      meta={sorted.length > 0 ? <Chip label={`${sorted.length}`} size="small" variant="outlined" /> : undefined}
      tabIndex={0}
      sx={sx}
    >
      {sorted.length === 0 ? (
        <Typography component="p" variant="body1" color="text.secondary">
          No records added yet.
        </Typography>
      ) : (
        <Stack component="ol" role="list" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {sorted.map((record, index) => (
            <Stack
              key={record.id}
              component="li"
              spacing={1}
              sx={{
                py: 2,
                borderTop: index === 0 ? 'none' : '1px solid',
                borderColor: 'divider',
                '&:first-of-type': { pt: 0.5 },
                '&:last-of-type': { pb: 0.5 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1.5, rowGap: 1 }}>
                <Typography component="h3" variant="h3" sx={{ mr: 'auto' }}>
                  {record.title}
                </Typography>
                <Chip label={record.category} size="small" variant="outlined" />
              </Box>

              <Typography component="p" variant="body2" sx={{ maxWidth: '65ch' }}>
                {record.note}
              </Typography>

              <Typography component="p" variant="body2" color="text.secondary">
                Type: {record.category} · By: {record.createdBy} · Logged:{' '}
                <time dateTime={record.createdAt}>{formatTimestamp(record.createdAt)}</time>
              </Typography>

              {record.dueAt ? (
                <Typography component="p" variant="body2" color="text.secondary">
                  Due: <time dateTime={record.dueAt}>{formatTimestamp(record.dueAt)}</time>
                </Typography>
              ) : null}
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
