import { useState } from 'react';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { MailIcon } from './icons';
import { SectionCard } from './SectionCard';
import type { OutreachDraft } from '../domain/types';

type DraftListProps = {
  drafts: OutreachDraft[];
};

type CopyState =
  | { kind: 'idle' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatDraftForClipboard(draft: OutreachDraft): string {
  return `${draft.subject}\n\n${draft.body}`;
}

export function DraftList({ drafts }: DraftListProps) {
  const [copyState, setCopyState] = useState<CopyState>({ kind: 'idle' });

  const sorted = [...drafts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCopy = async (draft: OutreachDraft) => {
    const clipboardText = formatDraftForClipboard(draft);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable in this browser context.');
      }

      await navigator.clipboard.writeText(clipboardText);
      setCopyState({ kind: 'success', message: 'Draft copied to clipboard.' });
    } catch (error) {
      setCopyState({
        kind: 'error',
        message:
          error instanceof Error
            ? `Could not copy draft: ${error.message}`
            : 'Could not copy draft. Try selecting and copying manually.',
      });
    }
  };

  return (
    <SectionCard
      id="drafts"
      tint="drafts"
      icon={<MailIcon />}
      title="Drafts"
      meta={sorted.length > 0 ? <Chip label={`${sorted.length}`} size="small" variant="outlined" /> : undefined}
    >
      {copyState.kind === 'success' ? <Alert severity="success">{copyState.message}</Alert> : null}
      {copyState.kind === 'error' ? <Alert severity="warning">{copyState.message}</Alert> : null}

      {sorted.length === 0 ? (
        <Typography component="p" variant="body1" color="text.secondary">
          No drafts prepared yet.
        </Typography>
      ) : (
        <Stack component="ol" role="list" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {sorted.map((draft, index) => (
            <Stack
              key={draft.id}
              component="li"
              spacing={1.5}
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
                  {draft.subject}
                </Typography>
                <Chip label="Draft — not sent" size="small" color="warning" variant="outlined" />
              </Box>

              <Typography
                component="p"
                variant="body1"
                sx={{
                  maxWidth: '65ch',
                  whiteSpace: 'pre-wrap',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'background.default',
                }}
              >
                {draft.body}
              </Typography>

              <Typography component="p" variant="body2" color="text.secondary">
                Audience: {draft.audience} · By: {draft.createdBy} · Created:{' '}
                <time dateTime={draft.createdAt}>{formatTimestamp(draft.createdAt)}</time>
              </Typography>

              <Button type="button" variant="outlined" sx={{ width: 'fit-content' }} onClick={() => handleCopy(draft)}>
                Copy draft text
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </SectionCard>
  );
}
