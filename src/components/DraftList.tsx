import { useState } from 'react';
import { Alert, Button, Chip, Paper, Stack, Typography } from '@mui/material';
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
    <Paper component="section" elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 860 }}>
      <Stack spacing={1.5}>
        <Typography component="h2" variant="h2">
          Drafts
        </Typography>

        {copyState.kind === 'success' ? <Alert severity="success">{copyState.message}</Alert> : null}
        {copyState.kind === 'error' ? <Alert severity="warning">{copyState.message}</Alert> : null}

        {sorted.length === 0 ? (
          <Typography component="p" variant="body2" color="text.secondary">
            No drafts prepared yet.
          </Typography>
        ) : (
          <Stack component="ol" spacing={1.5} sx={{ m: 0, pl: 2.5 }}>
            {sorted.map((draft) => (
              <Stack key={draft.id} component="li" spacing={0.8}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                  <Typography component="h3" variant="body1" sx={{ fontWeight: 650, mr: 'auto' }}>
                    {draft.subject}
                  </Typography>
                  <Chip label="Draft — not sent" size="small" color="warning" variant="outlined" />
                </Stack>

                <Typography component="p" variant="body2" color="text.secondary">
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
      </Stack>
    </Paper>
  );
}
