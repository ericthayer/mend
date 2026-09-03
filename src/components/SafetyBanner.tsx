import { Alert, Typography } from '@mui/material';

export function SafetyBanner() {
  return (
    <Alert
      severity="warning"
      variant="outlined"
      role="note"
      sx={{
        borderRadius: 2,
        bgcolor: '#fff8e6',
        color: 'text.primary',
        '& .MuiAlert-icon': {
          color: 'warning.dark',
        },
      }}
    >
      <Typography component="p" variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        For recovery after immediate danger.
      </Typography>
      <Typography component="p" variant="body2">
        This tool helps organize recovery tasks after immediate danger has passed. It is not
        emergency, legal, medical, financial, insurance, or benefits advice. If you are in danger,
        contact local emergency services.
      </Typography>
    </Alert>
  );
}
