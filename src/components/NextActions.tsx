import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { selectDeterministicTasksForPlan } from '../domain/selectors';
import type { RecoveryPlan, TaskStatus } from '../domain/types';

type NextActionsProps = {
  approvedPlan: RecoveryPlan | null;
  onUpdateTaskStatus: (input: {
    planId: string;
    taskId: string;
    status: TaskStatus;
  }) => void;
  busyTaskId?: string | null;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
};

const PRIORITY_COLORS: Record<'now' | 'next' | 'later', 'error' | 'warning' | 'default'> = {
  now: 'error',
  next: 'warning',
  later: 'default',
};

export function NextActions({
  approvedPlan,
  onUpdateTaskStatus,
  busyTaskId = null,
}: NextActionsProps) {
  if (!approvedPlan) {
    return (
      <Paper component="section" elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 860 }}>
        <Stack spacing={1}>
          <Typography component="h2" variant="h2">
            Next actions
          </Typography>
          <Typography component="p" variant="body2" color="text.secondary">
            No approved plan yet. Once a plan is approved, the top actions appear here.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const orderedTasks = selectDeterministicTasksForPlan(approvedPlan).slice(0, 3);

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, maxWidth: 860 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
          <Typography component="h2" variant="h2" sx={{ mr: 'auto' }}>
            Next actions
          </Typography>
          <Chip label={`Approved plan v${approvedPlan.version}`} color="success" variant="outlined" />
        </Stack>

        <Stack component="ol" spacing={2} sx={{ m: 0, pl: 2.5 }} data-testid="next-actions-list">
          {orderedTasks.map((task) => (
            <Stack component="li" key={task.id} spacing={1.2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                <Typography component="h3" variant="body1" sx={{ fontWeight: 650, mr: 'auto' }}>
                  {task.title}
                </Typography>
                <Chip
                  label={task.priority}
                  color={PRIORITY_COLORS[task.priority]}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography component="p" variant="body2" color="text.secondary">
                {task.rationale}
              </Typography>

              <FormControl size="small" sx={{ maxWidth: 220 }}>
                <InputLabel id={`task-status-label-${task.id}`}>Status</InputLabel>
                <Select
                  labelId={`task-status-label-${task.id}`}
                  id={`task-status-${task.id}`}
                  value={task.status}
                  label="Status"
                  disabled={busyTaskId === task.id}
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
      </Stack>
    </Paper>
  );
}
