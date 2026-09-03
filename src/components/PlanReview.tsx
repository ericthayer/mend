import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material';
import { reviewSurfaceSx, sectionTintSx } from '../styles/surfaces';
import { ClipboardCheckIcon } from './icons';
import { SectionCard } from './SectionCard';
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

const NATIVE_FIELD_STYLE = {
  borderRadius: 10,
  border: '1px solid var(--mui-palette-divider)',
  fontSize: '1rem',
  fontFamily: 'inherit',
  backgroundColor: 'var(--mui-palette-background-paper)',
  color: 'var(--mui-palette-text-primary)',
} as const;

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
    <SectionCard
      id="review"
      tint="review"
      icon={<ClipboardCheckIcon />}
      title="Needs your review"
      sx={reviewSurfaceSx}
      meta={
        <Chip
          label={`Plan v${pendingPlan.version}`}
          size="small"
          variant="outlined"
          sx={{ color: 'text.primary', borderColor: 'warning.main' }}
        />
      }
    >
      <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '65ch' }}>
        {approvedPlan
          ? `Approved plan v${approvedPlan.version} stays active until you confirm this revision.`
          : 'No plan is active until you confirm this review decision.'}
      </Typography>

      <Typography component="p" variant="body1" sx={{ fontWeight: 650, maxWidth: '65ch' }}>
        {pendingPlan.goal}
      </Typography>

      <Stack component="ol" role="list" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
        {pendingPlan.tasks.map((task, index) => (
          <Stack
            key={task.id}
            component="li"
            direction="row"
            spacing={1.5}
            sx={{
              py: 1.5,
              borderTop: index === 0 ? 'none' : '1px solid',
              borderColor: 'rgb(var(--mui-palette-warning-mainChannel) / 0.18)',
            }}
          >
            <Box
              aria-hidden="true"
              sx={[
                ...sectionTintSx('review'),
                {
                  width: 28,
                  height: 28,
                  flex: '0 0 auto',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                },
              ]}
            >
              {index + 1}
            </Box>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography component="p" variant="body1" sx={{ fontWeight: 650 }}>
                {task.title}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '65ch' }}>
                {task.rationale}
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                Priority: {task.priority}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <Typography component="p" role="status" aria-live="polite" variant="body2" sx={{ minHeight: 22, fontWeight: 600 }}>
        {liveAnnouncement || ' '}
      </Typography>

      <Stack
        component="form"
        ref={formRef}
        data-tool-active={isToolFormActive ? 'true' : 'false'}
        spacing={2}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
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
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 260px) 1fr' } }}>
          <FormControl size="small">
            <FormLabel htmlFor="review-decision" sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}>
              Decision
            </FormLabel>
            <select
              id="review-decision"
              ref={decisionSelectRef}
              name="decision"
              required
              value={decision}
              onChange={(event) => setDecision(event.target.value as ReviewDecision)}
              style={{
                ...NATIVE_FIELD_STYLE,
                minHeight: 44,
                padding: '0 12px',
              }}
            >
              <option value="approve">Approve plan</option>
              <option value="request_changes">Request changes</option>
            </select>
          </FormControl>

          <Stack spacing={0.75}>
            <FormLabel htmlFor="review-note" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Review note (optional)
            </FormLabel>
            <textarea
              id="review-note"
              ref={noteTextareaRef}
              name="note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              style={{
                ...NATIVE_FIELD_STYLE,
                width: '100%',
                minHeight: 88,
                padding: '10px 12px',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </Stack>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ minWidth: 200 }}>
            Confirm decision
          </Button>
          <Typography component="p" variant="body2" color="text.secondary">
            Nothing changes until you confirm. Your assistant can only prepare this form.
          </Typography>
        </Stack>
      </Stack>
    </SectionCard>
  );
}
