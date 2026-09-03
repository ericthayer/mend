import { useEffect, useState } from 'react';
import {
  Button,
  Chip,
  FormControl,
  FormLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { RecoveryPlan } from '../domain/types';

type ReviewDecision = 'approve' | 'request_changes';

type PlanReviewProps = {
  pendingPlan: RecoveryPlan;
  approvedPlan: RecoveryPlan | null;
  submitting?: boolean;
  onSubmit: (input: { planId: string; decision: ReviewDecision; note?: string }) => void;
};

export function PlanReview({
  pendingPlan,
  approvedPlan,
  submitting = false,
  onSubmit,
}: PlanReviewProps) {
  const [decision, setDecision] = useState<ReviewDecision>('approve');
  const [note, setNote] = useState('');

  useEffect(() => {
    setDecision('approve');
    setNote('');
  }, [pendingPlan.id]);

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 860 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
          <Typography component="h2" variant="h2" sx={{ mr: 'auto' }}>
            Needs your review
          </Typography>
          <Chip label={`Plan v${pendingPlan.version}`} color="warning" variant="outlined" />
        </Stack>

        <Typography component="p" variant="body2" color="text.secondary">
          {approvedPlan
            ? `Approved plan v${approvedPlan.version} stays active until you confirm this revision.`
            : 'No plan is active until you confirm this review decision.'}
        </Typography>

        <Typography component="p" variant="body1" sx={{ fontWeight: 600 }}>
          {pendingPlan.goal}
        </Typography>

        <Stack component="ol" spacing={1.2} sx={{ m: 0, pl: 2.5 }}>
          {pendingPlan.tasks.map((task) => (
            <Stack key={task.id} component="li" spacing={0.5}>
              <Typography component="p" variant="body1" sx={{ fontWeight: 600 }}>
                {task.title}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                {task.rationale}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                Priority: {task.priority}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Stack
          component="form"
          spacing={1.5}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({
              planId: pendingPlan.id,
              decision,
              note: note.trim() || undefined,
            });
          }}
        >
          <FormControl size="small" sx={{ maxWidth: 260 }}>
            <FormLabel id="review-decision-label">Decision</FormLabel>
            <Select
              aria-labelledby="review-decision-label"
              value={decision}
              onChange={(event) => setDecision(event.target.value as ReviewDecision)}
            >
              <MenuItem value="approve">Approve plan</MenuItem>
              <MenuItem value="request_changes">Request changes</MenuItem>
            </Select>
          </FormControl>

          <TextField
            multiline
            minRows={3}
            maxRows={6}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            label="Review note (optional)"
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button type="submit" variant="contained" disabled={submitting}>
              Confirm decision
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
