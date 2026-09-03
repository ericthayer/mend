import { useEffect, useRef, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { MendMark, MoonIcon, SunIcon } from '../components/icons';
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

const visuallyHiddenLabel = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
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
  const { mode, systemMode, setMode } = useColorScheme();

  useEffect(() => {
    if (!inlineError) {
      return;
    }

    inlineErrorRef.current?.focus();
  }, [inlineError]);

  const selectedMode: 'light' | 'dark' =
    mode === 'dark' || (mode !== 'light' && systemMode === 'dark') ? 'dark' : 'light';

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: 'rgb(var(--mui-palette-background-defaultChannel) / 0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
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
            <ToggleButtonGroup
              value={selectedMode}
              exclusive
              size="small"
              color="primary"
              aria-label="Color mode"
              onChange={(_, nextMode: 'light' | 'dark' | null) => {
                if (nextMode) {
                  setMode(nextMode);
                }
              }}
              sx={{
                '& .MuiToggleButton-root': {
                  minHeight: 44,
                  minWidth: { xs: 44, sm: 78 },
                  px: { xs: 1, sm: 1.25 },
                  gap: 0.75,
                  borderColor: 'divider',
                  color: 'text.secondary',
                },
                '& .MuiToggleButton-root.Mui-selected': {
                  color: 'text.primary',
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                },
              }}
            >
              <ToggleButton value="light" aria-label="Light mode">
                <SunIcon />
                <Box component="span" sx={visuallyHiddenLabel}>
                  Light
                </Box>
              </ToggleButton>
              <ToggleButton value="dark" aria-label="Dark mode">
                <MoonIcon />
                <Box component="span" sx={visuallyHiddenLabel}>
                  Dark
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
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
