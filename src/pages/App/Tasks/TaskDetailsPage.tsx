import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
} from '@ionic/react';
import {
  createOutline,
  trashOutline,
  briefcaseOutline,
  personOutline,
  calendarOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import type { TaskView, TaskStatus } from '../../../types/api';

const TaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const history = useHistory();
  const [task, setTask] = useState<TaskView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) {
        setError('Keine Task-ID angegeben');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const taskData = await taskService.getById(taskId);
        setTask(taskData);
      } catch (err) {
        setError('Fehler beim Laden der Aufgabe');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;

    try {
      const updated = await taskService.updateStatus(task.id, newStatus);
      setTask(updated);
    } catch (err) {
      console.error('Fehler beim Ändern des Status', err?.message || err);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Möchten Sie diese Aufgabe wirklich löschen?')) return;

    try {
      await taskService.delete(task.id);
      history.push('/app/tasks/my');
    } catch (err) {
      console.error('Fehler beim Löschen der Aufgabe', err?.message || err);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'review': return 'tertiary';
      case 'done': return 'success';
      case 'cancelled': return 'medium';
      default: return 'medium';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'medium';
      default: return 'medium';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'open': return 'Offen';
      case 'in_progress': return 'In Arbeit';
      case 'review': return 'Review';
      case 'done': return 'Erledigt';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Aufgabe...</p>
        </div>
      </IonContent>
    );
  }

  if (error || !task) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Aufgabe nicht gefunden'}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">{task.title}</h1>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <IonChip color={getStatusColor(task.status)}>
            <IonLabel>{getStatusLabel(task.status)}</IonLabel>
          </IonChip>
          <IonChip color={getPriorityColor(task.priority)}>
            <IonLabel>{getPriorityLabel(task.priority)}</IonLabel>
          </IonChip>
        </div>
      </div>

      {/* Details Card */}
      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Details</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {task.description && (
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--ion-color-step-600)' }}>
                Beschreibung:
              </strong>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{task.description}</p>
            </div>
          )}

          <IonGrid style={{ padding: 0 }}>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
                    Projekt:
                  </strong>
                  <IonButton 
                    routerLink={`/app/project/${task.project_id}`} 
                    fill="outline" 
                    size="small"
                  >
                    <IonIcon slot="start" icon={briefcaseOutline} />
                    Zum Projekt
                  </IonButton>
                </div>
              </IonCol>

              {task.due_date && (
                <IonCol size="12" sizeMd="6">
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
                      Fällig am:
                    </strong>
                    <p style={{ margin: 0, fontSize: '15px' }}>
                      <IonIcon icon={calendarOutline} style={{ marginRight: '6px' }} />
                      {new Date(task.due_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </IonCol>
              )}
            </IonRow>
          </IonGrid>

          {task.assigned_user_ids.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
                Zugewiesen an:
              </strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {task.assigned_user_ids.map((userId) => (
                  <IonBadge key={userId} color="primary">
                    <IonIcon icon={personOutline} style={{ marginRight: '4px' }} />
                    {userId.substring(0, 8)}...
                  </IonBadge>
                ))}
              </div>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Status Change */}
      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Status ändern</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonSelect
            value={task.status}
            onIonChange={(e) => handleStatusChange(e.detail.value as TaskStatus)}
            interface="action-sheet"
            style={{ width: '100%', '--padding-start': '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--ion-color-step-200)' }}
          >
            <IonSelectOption value="open">Offen</IonSelectOption>
            <IonSelectOption value="in_progress">In Bearbeitung</IonSelectOption>
            <IonSelectOption value="review">Review</IonSelectOption>
            <IonSelectOption value="done">Erledigt</IonSelectOption>
            <IonSelectOption value="cancelled">Abgebrochen</IonSelectOption>
          </IonSelect>
        </IonCardContent>
      </IonCard>

      {/* Actions */}
      <div style={{ padding: '0 16px 16px' }}>
        <IonButton 
          routerLink={`/app/tasks/${taskId}/edit`} 
          expand="block"
          className="app-button"
        >
          <IonIcon slot="start" icon={createOutline} />
          Bearbeiten
        </IonButton>

        <IonButton 
          expand="block"
          color="danger"
          fill="outline"
          onClick={handleDelete}
          className="app-button-secondary"
        >
          <IonIcon slot="start" icon={trashOutline} />
          Löschen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default TaskDetailsPage;
