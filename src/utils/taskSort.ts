import type { TaskPriority, TaskStatus } from '../types/api';

const priorityWeight: Record<TaskPriority, number> = {
  urgent: 3,
  high: 2,
  medium: 1,
  low: 0,
};

const statusWeight: Record<TaskStatus, number> = {
  open: 4,
  in_progress: 3,
  review: 2,
  done: 1,
  cancelled: 0,
};

export const sortTasksByStatusAndPriority = <
  T extends { status: TaskStatus; priority: TaskPriority }
>(
  tasks: T[],
): T[] => {
  return [...tasks].sort((a, b) => {
    const statusDiff = statusWeight[b.status] - statusWeight[a.status];
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
};
