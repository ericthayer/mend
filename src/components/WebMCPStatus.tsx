import { Alert, Chip, Stack, Typography } from '@mui/material';

export type WebMCPCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'registering'
  | 'error';

type WebMCPStatusProps = {
  status: WebMCPCapabilityStatus;
  errorMessage?: string;
};

export function WebMCPStatus({ status, errorMessage }: WebMCPStatusProps) {
  if (status === 'supported') {
    return (
      <Chip
        color="success"
        variant="outlined"
        size="small"
        label="Agent tools: supported"
      />
    );
  }

  if (status === 'registering') {
    return (
      <Chip
        color="warning"
        variant="outlined"
        size="small"
        label="Agent tools: registering"
      />
    );
  }

  if (status === 'error') {
    return (
      <Stack spacing={1} sx={{ width: '100%' }}>
        <Chip color="error" variant="outlined" size="small" label="Agent tools: error" />
        <Alert severity="error" variant="outlined">
          Agent tool registration failed. You can continue with manual planning controls.
          {errorMessage ? ` ${errorMessage}` : ''}
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Chip
        color="default"
        variant="outlined"
        size="small"
        label="Agent tools: unavailable"
      />
      <Alert severity="info" variant="outlined">
        Agent tools unavailable in this browser. The planner still works manually.
      </Alert>
      <details>
        <summary>Chrome 149+ setup hint</summary>
        <Typography component="p" variant="body2" sx={{ mt: 1 }}>
          Open Chrome and enable the WebMCP testing flag:
          {' '}<code>chrome://flags/#enable-webmcp-testing</code>.
        </Typography>
      </details>
    </Stack>
  );
}
