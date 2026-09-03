import { Box, Paper, Typography } from '@mui/material';
import { ShieldAlertIcon } from './icons';
import { IconTile } from './SectionCard';

export function SafetyBanner() {
  return (
    <Paper
      component="aside"
      role="note"
      aria-label="Safety boundary"
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 1.75, sm: 2 },
      }}
    >
      <IconTile tint="safety">
        <ShieldAlertIcon />
      </IconTile>
      <Box sx={{ display: 'flex', flexDirection: 'column', columnGap: 1, rowGap: 0.25, alignSelf: 'center' }}>
        <Typography component="p" variant="body2" sx={{ fontWeight: 700 }}>
          For recovery after immediate danger.
        </Typography>
        <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '78ch' }}>
          This tool helps organize recovery tasks after immediate danger has passed. It is not
          emergency, legal, medical, financial, insurance, or benefits advice. If you are in danger,
          contact local emergency services.
        </Typography>
      </Box>
    </Paper>
  );
}
