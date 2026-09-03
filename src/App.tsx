import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Stack } from '@mui/material';
import { AppShell } from './app/AppShell';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CaseSummary } from './components/CaseSummary';
import { CaseRecordList } from './components/CaseRecordList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DraftList } from './components/DraftList';
import { EmptyState } from './components/EmptyState';
import { NextActions } from './components/NextActions';
import { PlanReview } from './components/PlanReview';
import { SafetyBanner } from './components/SafetyBanner';
import { seedFloodDemo } from './data/floodDemo';
import { createRecoveryCommands } from './domain/commands';
import {
  selectAllowedActions,
  selectLatestApprovedPlan,
  selectPendingPlan,
} from './domain/selectors';
import { getCurrentDomainState, useRecoveryStore } from './state/recoveryStore';
import type { WebMCPCapabilityStatus } from './components/WebMCPStatus';
import type { TaskStatus } from './domain/types';
import { registerRecoveryTools } from './webmcp/registerRecoveryTools';
import {
  createRecoveryImperativeTools,
  selectStateAwareImperativeTools,
} from './webmcp/toolDefinitions';

function App() {
  const commands = useMemo(() => createRecoveryCommands(), []);
  const imperativeTools = useMemo(() => createRecoveryImperativeTools(commands), [commands]);
  const caseData = useRecoveryStore((state) => state.case);
  const pendingPlan = useRecoveryStore(selectPendingPlan);
  const approvedPlan = useRecoveryStore(selectLatestApprovedPlan);
  const webmcpRegistrationStateKey = useRecoveryStore((state) =>
    selectAllowedActions(state).join('|')
  );
  const records = useRecoveryStore((state) => state.records);
  const drafts = useRecoveryStore((state) => state.drafts);
  const activity = useRecoveryStore((state) => state.activity);
  const storageWarning = useRecoveryStore((state) => state.storageWarning);

  const [busy, setBusy] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingFocus, setPendingFocus] = useState<'next-actions' | null>(null);
  const nextActionsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const [webmcpStatus, setWebmcpStatus] = useState<WebMCPCapabilityStatus>('registering');
  const [webmcpErrorMessage, setWebmcpErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const state = getCurrentDomainState();
    const tools = selectStateAwareImperativeTools(state, imperativeTools);

    const registration = registerRecoveryTools({
      tools,
      onStatusChange: (status, errorMessage) => {
        setWebmcpStatus(status);
        setWebmcpErrorMessage(errorMessage);
      },
    });

    if (registration.errorMessage) {
      setWebmcpErrorMessage(registration.errorMessage);
    }

    setWebmcpStatus(registration.status);

    return () => {
      registration.cleanup();
    };
  }, [imperativeTools, webmcpRegistrationStateKey]);

  useEffect(() => {
    if (pendingFocus !== 'next-actions') {
      return;
    }

    nextActionsHeadingRef.current?.focus();
    setPendingFocus(null);
  }, [pendingFocus, approvedPlan]);

  const handleStartBlank = () => {
    setBusy(true);
    setInlineError(null);

    const result = commands.createCase(
      {
        incidentType: 'other',
        summary: 'A household disruption occurred and recovery details will be added next.',
        safetyStatus: 'confirmed_safe',
        locationLabel: 'home',
        householdNeeds: [],
      },
      {
        actor: 'user',
        source: 'ui',
      }
    );

    if (!result.ok) {
      setInlineError(result.message);
    }

    setBusy(false);
  };

  const handleLoadDemo = () => {
    setBusy(true);
    setInlineError(null);

    commands.resetLocalData({
      actor: 'user',
      source: 'ui',
    });

    const result = seedFloodDemo();
    if (!result.ok) {
      setInlineError(result.message);
    }

    setBusy(false);
  };

  const handleReviewSubmit = (input: {
    planId: string;
    decision: 'approve' | 'request_changes';
    note?: string;
  }) => {
    setInlineError(null);
    setReviewSubmitting(true);

    const result = commands.reviewPlan(
      {
        ...input,
        expectedUiStateVersion: useRecoveryStore.getState().uiStateVersion,
      },
      {
        actor: 'user',
        source: 'ui',
      }
    );

    if (!result.ok) {
      setInlineError(result.message);
    } else if (input.decision === 'approve') {
      setStatusMessage(
        `Plan v${result.data.version} approved. Your next actions are ready below.`
      );
      setPendingFocus('next-actions');
    } else {
      setStatusMessage('Changes requested. The plan stays in review until a new version is ready.');
    }

    setReviewSubmitting(false);

    return result;
  };

  const handleUpdateTaskStatus = (input: {
    planId: string;
    taskId: string;
    status: TaskStatus;
  }) => {
    setInlineError(null);
    setUpdatingTaskId(input.taskId);

    const result = commands.updateTaskStatus(input, {
      actor: 'user',
      source: 'ui',
    });

    if (!result.ok) {
      setInlineError(result.message);
    }

    setUpdatingTaskId(null);
  };

  const handleConfirmReset = () => {
    setInlineError(null);
    setStatusMessage(null);
    const result = commands.resetLocalData({
      actor: 'user',
      source: 'ui',
    });

    if (!result.ok) {
      setInlineError(result.message);
    }

    setIsResetDialogOpen(false);
  };

  return (
    <AppShell
      webmcpStatus={webmcpStatus}
      webmcpErrorMessage={webmcpErrorMessage}
      storageWarning={storageWarning}
      inlineError={inlineError}
      statusMessage={statusMessage}
      onDismissStatus={() => setStatusMessage(null)}
      onResetRequested={caseData ? () => setIsResetDialogOpen(true) : undefined}
    >
      {caseData ? (
        <Stack spacing={0} sx={{ gap: 3 }}>
          <CaseSummary caseData={caseData} />
          <SafetyBanner />
          {pendingPlan ? (
            <PlanReview
              pendingPlan={pendingPlan}
              approvedPlan={approvedPlan}
              submitting={reviewSubmitting}
              onSubmit={handleReviewSubmit}
            />
          ) : null}
          <Box
            data-testid="supporting-workspace-masonry"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 3,
              alignItems: 'stretch',
              minHeight: { md: 'calc(100dvh - 28rem)' },
            }}
          >
            <Stack spacing={3} sx={{ minWidth: 0, height: '100%', minHeight: 0 }}>
              <DraftList drafts={drafts} sx={{ flex: '1 1 auto', minHeight: 0 }} />
              <CaseRecordList records={records} sx={{ flex: '1 1 auto', minHeight: 0 }} />
            </Stack>
            <Stack spacing={3} sx={{ minWidth: 0, height: '100%', minHeight: 0 }}>
              <NextActions
                approvedPlan={approvedPlan}
                busyTaskId={updatingTaskId}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                headingRef={nextActionsHeadingRef}
              />
              <ActivityTimeline activity={activity} sx={{ flex: 1, minHeight: 0 }} />
            </Stack>
          </Box>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <EmptyState onStartBlank={handleStartBlank} onLoadDemo={handleLoadDemo} busy={busy} />
          <SafetyBanner />
        </Stack>
      )}

      <ConfirmDialog
        open={isResetDialogOpen}
        title="Delete local case?"
        message="This removes all local case records, plans, drafts, and activity from this browser."
        confirmLabel="Delete local case"
        onCancel={() => setIsResetDialogOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </AppShell>
  );
}

export default App;
