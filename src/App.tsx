import { useEffect, useMemo, useState } from 'react';
import { Stack } from '@mui/material';
import { AppShell } from './app/AppShell';
import { ActivityTimeline } from './components/ActivityTimeline';
import { CaseSummary } from './components/CaseSummary';
import { CaseRecordList } from './components/CaseRecordList';
import { ConfirmDialog } from './components/ConfirmDialog';
import { DraftList } from './components/DraftList';
import { EmptyState } from './components/EmptyState';
import { NextActions } from './components/NextActions';
import { PlanReview } from './components/PlanReview';
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
      onResetRequested={caseData ? () => setIsResetDialogOpen(true) : undefined}
    >
      {caseData ? (
        <Stack spacing={3}>
          <CaseSummary caseData={caseData} />
          <NextActions
            approvedPlan={approvedPlan}
            busyTaskId={updatingTaskId}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
          {pendingPlan ? (
            <PlanReview
              pendingPlan={pendingPlan}
              approvedPlan={approvedPlan}
              submitting={reviewSubmitting}
              onSubmit={handleReviewSubmit}
            />
          ) : null}
          <CaseRecordList records={records} />
          <DraftList drafts={drafts} />
          <ActivityTimeline activity={activity} />
        </Stack>
      ) : (
        <EmptyState onStartBlank={handleStartBlank} onLoadDemo={handleLoadDemo} busy={busy} />
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
