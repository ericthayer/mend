import { useEffect, useRef, type ReactNode } from 'react';
import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MendMark } from '../components/icons';
import { SafetyBanner } from '../components/SafetyBanner';
import {
  WebMCPStatusChip,
  WebMCPStatusNotice,
  type WebMCPCapabilityStatus,
} from '../components/WebMCPStatus';

type AppShellProps = {
  webmcpStatus: WebMCPCapabilityStatus;
  webmcpErrorMessage?: string;
  storageWarning?: string | null;
  inlineError?: string | null;
  statusMessage?: string | null;
  onDismissStatus?: () => void;
  onResetRequested?: () => void;
  children: ReactNode;
};

export function AppShell({
  webmcpStatus,
  webmcpErrorMessage,
  storageWarning,
  inlineError,
  statusMessage,
  onDismissStatus,
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

  const isDarkMode =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: isDarkMode ? theme.palette.grey[900] : alpha(theme.palette.background.default, 0.88),
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        })}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: 2,
            rowGap: 1,
            minHeight: 64,
            py: 1,
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <MendMark />
            <Typography component="h1" variant="h1">
              Mend
            </Typography>
          </Stack>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <WebMCPStatusChip status={webmcpStatus} />
            {onResetRequested ? (
              <Button
                type="button"
                variant="text"
                onClick={onResetRequested}
                sx={{ color: 'text.secondary', minHeight: 40, px: 1.5 }}
              >
                Delete local case
              </Button>
            ) : null}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ flex: 1, pt: { xs: 3, md: 5 }, pb: { xs: 5, md: 8 } }}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {webmcpStatus === 'error' ? (
            <WebMCPStatusNotice status={webmcpStatus} errorMessage={webmcpErrorMessage} />
          ) : null}

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

          <SafetyBanner />

          <Box role="status" aria-live="polite" sx={{ display: statusMessage ? 'block' : 'contents' }}>
            {statusMessage ? (
              <Alert severity="success" variant="outlined" onClose={onDismissStatus}>
                {statusMessage}
              </Alert>
            ) : null}
          </Box>

          <Box component="main">{children}</Box>

          {webmcpStatus === 'unsupported' ? (
            <Box component="footer">
              <WebMCPStatusNotice status={webmcpStatus} errorMessage={webmcpErrorMessage} />
            </Box>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}
