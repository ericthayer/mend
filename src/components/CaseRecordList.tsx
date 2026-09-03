import { Chip, Paper, Stack, Typography } from '@mui/material';
import { sectionSurfaceSx } from '../styles/surfaces';
import type { CaseRecord } from '../domain/types';

type CaseRecordListProps = {
  records: CaseRecord[];
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function CaseRecordList({ records }: CaseRecordListProps) {
  const sorted = [...records].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Paper component="section" elevation={0} sx={sectionSurfaceSx}>
      <Stack spacing={1.5}>
        <Typography component="h2" variant="h2">
          Case records
        </Typography>

        {sorted.length === 0 ? (
          <Typography component="p" variant="body2" color="text.secondary">
            No records added yet.
          </Typography>
        ) : (
          <Stack component="ol" spacing={1.5} sx={{ m: 0, pl: 2.5 }}>
            {sorted.map((record) => (
              <Stack key={record.id} component="li" spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                  <Typography component="h3" variant="body1" sx={{ fontWeight: 650, mr: 'auto' }}>
                    {record.title}
                  </Typography>
                  <Chip label={record.category} size="small" variant="outlined" />
                </Stack>

                <Typography component="p" variant="body2" color="text.secondary">
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
      </Stack>
    </Paper>
  );
}
