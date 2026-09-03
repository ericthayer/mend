import { Alert, Box, Chip, Stack, Typography } from '@mui/material';

export type WebMCPCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'registering'
  | 'error';

type WebMCPStatusProps = {
  status: WebMCPCapabilityStatus;
  errorMessage?: string;
};

const CHIP_BY_STATUS: Record<
  WebMCPCapabilityStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default' }
> = {
  supported: { label: 'Agent tools: supported', color: 'success' },
  registering: { label: 'Agent tools: registering', color: 'warning' },
  error: { label: 'Agent tools: error', color: 'error' },
  unsupported: { label: 'Agent tools: unavailable', color: 'default' },
};

export function WebMCPStatusChip({ status }: Pick<WebMCPStatusProps, 'status'>) {
  const chip = CHIP_BY_STATUS[status];

  return (
    <Chip
      color={chip.color}
      variant="outlined"
      size="small"
      label={chip.label}
      icon={
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            width: 8,
            height: 8,
            ml: 1.25,
            borderRadius: '50%',
            bgcolor: chip.color === 'default' ? 'text.secondary' : `${chip.color}.main`,
          }}
        />
      }
    />
  );
}

export function WebMCPStatusNotice({ status, errorMessage }: WebMCPStatusProps) {
  if (status === 'error') {
    return (
      <Alert severity="error" variant="outlined">
        Agent tool registration failed. You can continue with manual planning controls.
        {errorMessage ? ` ${errorMessage}` : ''}
      </Alert>
    );
  }

  if (status === 'unsupported') {
    return (
      <Alert severity="info" variant="outlined">
        Agent tools unavailable in this browser. The planner still works manually.
        <Box
          component="details"
          sx={{
            mt: 0.5,
            '& summary': {
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              px: 1,
              mx: -1,
              borderRadius: 2,
              cursor: 'pointer',
              fontWeight: 600,
              color: 'primary.main',
            },
          }}
        >
          <summary>Chrome 149+ setup hint</summary>
          <Typography component="p" variant="body2" sx={{ mt: 0.5 }}>
            Open Chrome and enable the WebMCP testing flag:
            {' '}<code>chrome://flags/#enable-webmcp-testing</code>.
          </Typography>
        </Box>
      </Alert>
    );
  }

  return null;
}

export function WebMCPStatus({ status, errorMessage }: WebMCPStatusProps) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      <WebMCPStatusChip status={status} />
      <WebMCPStatusNotice status={status} errorMessage={errorMessage} />
    </Stack>
  );
}
