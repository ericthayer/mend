import { Chip, Paper, Stack, Typography } from '@mui/material';
import { sectionSurfaceSx } from '../styles/surfaces';
import type { RecoveryCase } from '../domain/types';

const INCIDENT_LABELS: Record<RecoveryCase['incidentType'], string> = {
  home_flood: 'Home flood',
  home_fire: 'Home fire',
  severe_weather: 'Severe weather',
  temporary_displacement: 'Temporary displacement',
  other: 'Other disruption',
};

type CaseSummaryProps = {
  caseData: RecoveryCase;
};

export function CaseSummary({ caseData }: CaseSummaryProps) {
  return (
    <Paper component="section" elevation={0} sx={sectionSurfaceSx}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <Typography component="h2" variant="h2" sx={{ mr: 'auto' }}>
            What we know
          </Typography>
          <Chip label={INCIDENT_LABELS[caseData.incidentType]} color="primary" variant="outlined" />
          <Chip
            label={
              caseData.safetyStatus === 'confirmed_safe'
                ? 'Safety confirmed'
                : 'Safety not confirmed'
            }
            color={caseData.safetyStatus === 'confirmed_safe' ? 'success' : 'warning'}
            variant="outlined"
          />
        </Stack>

        <Typography component="p" variant="body1" sx={{ maxWidth: '70ch' }}>
          {caseData.summary}
        </Typography>

        {caseData.householdNeeds.length > 0 ? (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {caseData.householdNeeds.map((need) => (
              <Chip
                key={need}
                label={need.replace(/_/g, ' ')}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
