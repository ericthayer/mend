import type { Ref } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { getResourceById } from '../data/resources';
import { selectDeterministicTasksForPlan } from '../domain/selectors';
import { SECTION_TINTS } from '../styles/surfaces';
import { ListChecksIcon } from './icons';
import { SectionCard } from './SectionCard';
import type { RecoveryPlan, TaskStatus } from '../domain/types';

type NextActionsProps = {
  approvedPlan: RecoveryPlan | null;
  onUpdateTaskStatus: (input: {
    planId: string;
    taskId: string;
    status: TaskStatus;
  }) => void;
  busyTaskId?: string | null;
  headingRef?: Ref<HTMLHeadingElement>;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
};

const PRIORITY_COLORS: Record<'now' | 'next' | 'later', 'warning' | 'primary' | 'default'> = {
  now: 'warning',
  next: 'primary',
  later: 'default',
};

export function NextActions({
  approvedPlan,
  onUpdateTaskStatus,
  busyTaskId = null,
  headingRef,
}: NextActionsProps) {
  if (!approvedPlan) {
    return (
      <SectionCard id="next-actions" tint="actions" icon={<ListChecksIcon />} title="Next actions" headingRef={headingRef}>
        <Typography component="p" variant="body1" color="text.secondary" sx={{ maxWidth: '60ch' }}>
          No approved plan yet. Once a plan is approved, the top actions appear here.
        </Typography>
      </SectionCard>
    );
  }

  const orderedTasks = selectDeterministicTasksForPlan(approvedPlan).slice(0, 3);

  return (
    <SectionCard
      id="next-actions"
      tint="actions"
      icon={<ListChecksIcon />}
      title="Next actions"
      headingRef={headingRef}
      meta={<Chip label={`Approved plan v${approvedPlan.version}`} color="success" variant="outlined" size="small" />}
    >
      <Stack component="ol" role="list" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }} data-testid="next-actions-list">
        {orderedTasks.map((task, index) => (
          <Stack
            component="li"
            key={task.id}
            spacing={1.5}
            sx={{
              py: 2.5,
              borderTop: index === 0 ? 'none' : '1px solid',
              borderColor: 'divider',
              '&:first-of-type': { pt: 0.5 },
              '&:last-of-type': { pb: 0.5 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 1.5, rowGap: 1 }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: SECTION_TINTS.actions.bg,
                  color: SECTION_TINTS.actions.fg,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {index + 1}
              </Box>
              <Typography component="h3" variant="h3" sx={{ mr: 'auto' }}>
                {task.title}
              </Typography>
              <Chip
                label={task.priority}
                color={PRIORITY_COLORS[task.priority]}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography component="p" variant="body2" color="text.secondary" sx={{ maxWidth: '65ch' }}>
              {task.rationale}
            </Typography>

            {task.sourceIds.length > 0 ? (
              <Stack spacing={0.5}>
                <Typography component="p" variant="body2" color="text.secondary">
                  Official resources
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {task.sourceIds
                    .map((sourceId) => getResourceById(sourceId))
                    .filter((resource): resource is NonNullable<typeof resource> => resource !== null)
                    .map((resource) => (
                      <Link
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        underline="hover"
                      >
                        {resource.badge}: {resource.publisher} ({resource.verifiedAt})
                      </Link>
                    ))}
                </Stack>
              </Stack>
            ) : null}

            <FormControl size="small" sx={{ maxWidth: 220 }}>
              <InputLabel id={`task-status-label-${task.id}`}>Status</InputLabel>
              <Select
                labelId={`task-status-label-${task.id}`}
                id={`task-status-${task.id}`}
                value={task.status}
                label="Status"
                disabled={busyTaskId === task.id}
                sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}
                onChange={(event) => {
                  onUpdateTaskStatus({
                    planId: approvedPlan.id,
                    taskId: task.id,
                    status: event.target.value as TaskStatus,
                  });
                }}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}
