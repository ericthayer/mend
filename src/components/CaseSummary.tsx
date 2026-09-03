import { Chip, Stack, Typography } from '@mui/material';
import { HouseIcon } from './icons';
import { SectionCard } from './SectionCard';
import { INCIDENT_LABELS } from '../domain/labels';
import type { RecoveryCase } from '../domain/types';

type CaseSummaryProps = {
  caseData: RecoveryCase;
};

export function CaseSummary({ caseData }: CaseSummaryProps) {
  return (
    <SectionCard
      id="case"
      tint="case"
      icon={<HouseIcon />}
      title="What we know"
      titleSx={{
        fontSize: { xs: '1.75rem', sm: '2.25rem' },
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: '-0.03em',
      }}
      meta={
        <>
          <Chip label={INCIDENT_LABELS[caseData.incidentType]} color="primary" variant="outlined" size="small" />
          <Chip
            label={
              caseData.safetyStatus === 'confirmed_safe'
                ? 'Safety confirmed'
                : 'Safety not confirmed'
            }
            color={caseData.safetyStatus === 'confirmed_safe' ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
        </>
      }
    >
      <Typography component="p" variant="body1" sx={{ maxWidth: '70ch' }}>
        {caseData.summary}
      </Typography>

      {caseData.householdNeeds.length > 0 ? (
        <Stack spacing={1}>
          <Typography component="p" variant="body2" color="text.secondary">
            Household needs
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {caseData.householdNeeds.map((need) => (
              <Chip key={need} label={need.replace(/_/g, ' ')} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </SectionCard>
  );
}
