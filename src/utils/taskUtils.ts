import type { TaskStatus, TaskPriority } from '../types/api';

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'open': return 'primary';
    case 'in_progress': return 'warning';
    case 'review': return 'tertiary';
    case 'done': return 'success';
    case 'cancelled': return 'medium';
    default: return 'medium';
  }
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'urgent': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'primary';
    case 'low': return 'medium';
    default: return 'medium';
  }
};

export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case 'open': return 'Offen';
    case 'in_progress': return 'In Arbeit';
    case 'review': return 'In Prüfung';
    case 'done': return 'Erledigt';
    case 'cancelled': return 'Abgebrochen';
    default: return status;
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case 'urgent': return 'Dringend';
    case 'high': return 'Hoch';
    case 'medium': return 'Mittel';
    case 'low': return 'Niedrig';
    default: return priority;
  }
};
