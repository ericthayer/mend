import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Chip,
  FormControl,
  FormLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { CommandResult, RecoveryPlan } from '../domain/types';

type ReviewDecision = 'approve' | 'request_changes';

type ReviewSubmitResult = CommandResult<RecoveryPlan>;

type ToolActivatedDetail = {
  toolName?: string;
  params?: Record<string, unknown>;
};

type ToolCancelDetail = {
  toolName?: string;
};

type ToolSubmitEvent = SubmitEvent & {
  agentInvoked?: boolean;
  respondWith?: (response: unknown) => void;
};

const START_PLAN_REVIEW_TOOL_NAME = 'start_plan_review';
const START_PLAN_REVIEW_TOOL_DESCRIPTION =
  'Prefills and focuses the review decision for the current pending recovery plan. The person must manually submit the visible form; this does not approve the plan or perform any recovery task.';
const DECISION_TOOL_PARAM_DESCRIPTION =
  'The proposed review decision. The person can change it before submitting.';
const NOTE_TOOL_PARAM_DESCRIPTION =
  'Optional review note for the plan history.';

type PlanReviewProps = {
  pendingPlan: RecoveryPlan;
  approvedPlan: RecoveryPlan | null;
  submitting?: boolean;
  onSubmit: (input: {
    planId: string;
    decision: ReviewDecision;
    note?: string;
  }) => ReviewSubmitResult;
};

export function PlanReview({
  pendingPlan,
  approvedPlan,
  submitting = false,
  onSubmit,
}: PlanReviewProps) {
  const [decision, setDecision] = useState<ReviewDecision>('approve');
  const [note, setNote] = useState('');
  const [isToolFormActive, setIsToolFormActive] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const formRef = useRef<HTMLFormElement | null>(null);
  const decisionSelectRef = useRef<HTMLSelectElement | null>(null);
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const currentValuesRef = useRef<{ decision: ReviewDecision; note: string }>({
    decision: 'approve',
    note: '',
  });
  const prefillBaselineRef = useRef<{ decision: ReviewDecision; note: string } | null>(null);

  useEffect(() => {
    currentValuesRef.current = { decision, note };
  }, [decision, note]);

  useEffect(() => {
    setDecision('approve');
    setNote('');
    setIsToolFormActive(false);
    setLiveAnnouncement('');
    prefillBaselineRef.current = null;
  }, [pendingPlan.id]);

  useEffect(() => {
    const formElement = formRef.current;

    if (!formElement) {
      return undefined;
    }

    formElement.setAttribute('toolname', START_PLAN_REVIEW_TOOL_NAME);
    formElement.setAttribute('tooldescription', START_PLAN_REVIEW_TOOL_DESCRIPTION);
    decisionSelectRef.current?.setAttribute('toolparamdescription', DECISION_TOOL_PARAM_DESCRIPTION);
    noteTextareaRef.current?.setAttribute('toolparamdescription', NOTE_TOOL_PARAM_DESCRIPTION);

    const handleToolActivated = (event: Event) => {
      const toolEvent = event as CustomEvent<ToolActivatedDetail>;

      if (toolEvent.detail?.toolName !== START_PLAN_REVIEW_TOOL_NAME) {
        return;
      }

      prefillBaselineRef.current = currentValuesRef.current;

      const proposedDecision = toolEvent.detail.params?.decision;
      const proposedNote = toolEvent.detail.params?.note;

      const nextDecision: ReviewDecision =
        proposedDecision === 'request_changes' || proposedDecision === 'approve'
          ? proposedDecision
          : 'approve';
      const nextNote = typeof proposedNote === 'string' ? proposedNote.slice(0, 500) : '';

      setDecision(nextDecision);
      setNote(nextNote);
      setIsToolFormActive(true);
      setLiveAnnouncement(
        'Review form is ready. Please confirm the decision manually before anything changes.'
      );

      requestAnimationFrame(() => {
        decisionSelectRef.current?.focus();
      });
    };

    const handleToolCancel = (event: Event) => {
      const toolEvent = event as CustomEvent<ToolCancelDetail>;

      if (toolEvent.detail?.toolName !== START_PLAN_REVIEW_TOOL_NAME) {
        return;
      }

      const baseline = prefillBaselineRef.current ?? { decision: 'approve' as const, note: '' };
      setDecision(baseline.decision);
      setNote(baseline.note);
      setIsToolFormActive(false);
      setLiveAnnouncement('Review prefill cancelled. Previous values restored.');

      requestAnimationFrame(() => {
        decisionSelectRef.current?.focus();
      });
    };

    formElement.addEventListener('toolactivated', handleToolActivated as EventListener);
    formElement.addEventListener('toolcancel', handleToolCancel as EventListener);

    return () => {
      formElement.removeEventListener('toolactivated', handleToolActivated as EventListener);
      formElement.removeEventListener('toolcancel', handleToolCancel as EventListener);
    };
  }, []);

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 860 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
          <Typography component="h2" variant="h2" sx={{ mr: 'auto' }}>
            Needs your review
          </Typography>
          <Chip
            label={`Plan v${pendingPlan.version}`}
            color="warning"
            variant="outlined"
            sx={{ color: 'text.primary', borderColor: 'warning.main', fontWeight: 600 }}
          />
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

        <Typography component="p" role="status" aria-live="polite" variant="body2" sx={{ minHeight: 22 }}>
          {liveAnnouncement || ' '}
        </Typography>

        <Stack
          component="form"
          ref={formRef}
          data-tool-active={isToolFormActive ? 'true' : 'false'}
          spacing={1.5}
          onSubmit={(event) => {
            event.preventDefault();
            const result = onSubmit({
              planId: pendingPlan.id,
              decision,
              note: note.trim() || undefined,
            });

            setIsToolFormActive(false);
            setLiveAnnouncement(
              result.ok
                ? 'Review decision saved. The plan status is updated.'
                : 'Review decision was not saved. Check the message and try again.'
            );

            const nativeEvent = event.nativeEvent as ToolSubmitEvent;
            if (nativeEvent.agentInvoked && typeof nativeEvent.respondWith === 'function') {
              if (result.ok) {
                nativeEvent.respondWith({
                  ok: true,
                  code: result.code,
                  message: result.message,
                  data: {
                    planId: result.data.id,
                    status: result.data.status,
                  },
                  uiStateVersion: result.uiStateVersion,
                });

                return;
              }

              nativeEvent.respondWith({
                ok: false,
                code: result.code,
                message: result.message,
                retryable: result.retryable,
                fieldErrors: result.fieldErrors,
                uiStateVersion: result.uiStateVersion,
              });
            }
          }}
        >
          <FormControl size="small" sx={{ maxWidth: 260 }}>
            <FormLabel htmlFor="review-decision">Decision</FormLabel>
            <select
              id="review-decision"
              ref={decisionSelectRef}
              name="decision"
              required
              value={decision}
              onChange={(event) => setDecision(event.target.value as ReviewDecision)}
              style={{
                minHeight: 44,
                borderRadius: 8,
                border: '1px solid #7d8790',
                padding: '0 12px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                backgroundColor: '#fff',
                color: '#1f2a33',
              }}
            >
              <option value="approve">Approve plan</option>
              <option value="request_changes">Request changes</option>
            </select>
          </FormControl>

          <Stack spacing={0.5}>
            <FormLabel htmlFor="review-note">Review note (optional)</FormLabel>
            <textarea
              id="review-note"
              ref={noteTextareaRef}
              name="note"
              rows={4}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              style={{
                width: '100%',
                minHeight: 120,
                borderRadius: 8,
                border: '1px solid #7d8790',
                padding: '10px 12px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                color: '#1f2a33',
              }}
            />
          </Stack>

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
