import { useEffect, useMemo, useState } from 'react';
import { Stack } from '@mui/material';
import { AppShell } from './app/AppShell';
import { CaseSummary } from './components/CaseSummary';
import { EmptyState } from './components/EmptyState';
import { NextActions } from './components/NextActions';
import { PlanReview } from './components/PlanReview';
import { seedFloodDemo } from './data/floodDemo';
import { createRecoveryCommands } from './domain/commands';
import {
  selectLatestApprovedPlan,
  selectPendingPlan,
} from './domain/selectors';
import { useRecoveryStore } from './state/recoveryStore';
import type { WebMCPCapabilityStatus } from './components/WebMCPStatus';
import type { TaskStatus } from './domain/types';

function App() {
  const commands = useMemo(() => createRecoveryCommands(), []);
  const caseData = useRecoveryStore((state) => state.case);
  const pendingPlan = useRecoveryStore(selectPendingPlan);
  const approvedPlan = useRecoveryStore(selectLatestApprovedPlan);
  const storageWarning = useRecoveryStore((state) => state.storageWarning);

  const [busy, setBusy] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [webmcpStatus, setWebmcpStatus] = useState<WebMCPCapabilityStatus>('registering');
  const [webmcpErrorMessage, setWebmcpErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      if (typeof document === 'undefined') {
        setWebmcpStatus('unsupported');
        return;
      }

      setWebmcpStatus(document.modelContext ? 'supported' : 'unsupported');
    } catch (error) {
      setWebmcpStatus('error');
      setWebmcpErrorMessage(error instanceof Error ? error.message : 'Unknown capability check error.');
    }
  }, []);

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

  return (
    <AppShell
      webmcpStatus={webmcpStatus}
      webmcpErrorMessage={webmcpErrorMessage}
      storageWarning={storageWarning}
      inlineError={inlineError}
    >
      {caseData ? (
        <Stack spacing={2.5}>
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
        </Stack>
      ) : (
        <EmptyState onStartBlank={handleStartBlank} onLoadDemo={handleLoadDemo} busy={busy} />
      )}
    </AppShell>
  );
}

export default App;
