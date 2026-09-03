import { useEffect, useRef, type ReactNode } from 'react';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { SafetyBanner } from '../components/SafetyBanner';
import {
  WebMCPStatus,
  type WebMCPCapabilityStatus,
} from '../components/WebMCPStatus';

type AppShellProps = {
  webmcpStatus: WebMCPCapabilityStatus;
  webmcpErrorMessage?: string;
  storageWarning?: string | null;
  inlineError?: string | null;
  onResetRequested?: () => void;
  children: ReactNode;
};

export function AppShell({
  webmcpStatus,
  webmcpErrorMessage,
  storageWarning,
  inlineError,
  onResetRequested,
  children,
}: AppShellProps) {
  const inlineErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!inlineError) {
      return;
    }

    inlineErrorRef.current?.focus();
  }, [inlineError]);

  return (
    <Box component="div" sx={{ py: { xs: 2, sm: 4 } }}>
      <Container maxWidth="lg">
        <Stack spacing={2.5}>
          <Box component="header" sx={{ display: 'grid', gap: 1.25 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { sm: 'center' } }}
            >
              <Typography component="h1" variant="h1" sx={{ mr: 'auto' }}>
                Mend
              </Typography>
              <Typography component="p" variant="body2" color="text.secondary">
                Local-only contest build
              </Typography>
              {onResetRequested ? (
                <Button type="button" variant="outlined" color="error" onClick={onResetRequested}>
                  Delete local case
                </Button>
              ) : null}
            </Stack>
            <WebMCPStatus status={webmcpStatus} errorMessage={webmcpErrorMessage} />
          </Box>

          <SafetyBanner />

          {storageWarning ? (
            <Alert severity="warning" variant="outlined" role="status" aria-live="polite">
              {storageWarning}
            </Alert>
          ) : null}

          {inlineError ? (
            <Alert
              ref={inlineErrorRef}
              severity="error"
              variant="outlined"
              tabIndex={-1}
              aria-live="assertive"
            >
              {inlineError}
            </Alert>
          ) : null}

          <Box component="main">{children}</Box>
        </Stack>
      </Container>
    </Box>
  );
}
