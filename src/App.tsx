import { useEffect, useMemo, useState } from 'react';
import { AppShell } from './app/AppShell';
import { CaseSummary } from './components/CaseSummary';
import { EmptyState } from './components/EmptyState';
import { seedFloodDemo } from './data/floodDemo';
import { createRecoveryCommands } from './domain/commands';
import { useRecoveryStore } from './state/recoveryStore';
import type { WebMCPCapabilityStatus } from './components/WebMCPStatus';

function App() {
  const commands = useMemo(() => createRecoveryCommands(), []);
  const caseData = useRecoveryStore((state) => state.case);
  const storageWarning = useRecoveryStore((state) => state.storageWarning);

  const [busy, setBusy] = useState(false);
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

  return (
    <AppShell
      webmcpStatus={webmcpStatus}
      webmcpErrorMessage={webmcpErrorMessage}
      storageWarning={storageWarning}
      inlineError={inlineError}
    >
      {caseData ? (
        <CaseSummary caseData={caseData} />
      ) : (
        <EmptyState onStartBlank={handleStartBlank} onLoadDemo={handleLoadDemo} busy={busy} />
      )}
    </AppShell>
  );
}

export default App;
