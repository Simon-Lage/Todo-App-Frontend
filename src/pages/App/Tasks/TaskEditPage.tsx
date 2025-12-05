import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import { projectService } from '../../../services/projectService';
import type { ProjectSummaryView, TaskStatus } from '../../../types/api';

const TaskEditPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [originalStatus, setOriginalStatus] = useState<TaskStatus>('open');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [projects, setProjects] = useState<ProjectSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTaskAndProjects = async () => {
      try {
        setLoading(true);
        const [taskData, projectsResponse] = await Promise.all([
          taskService.getById(taskId),
          projectService.list({}, { limit: 100 })
        ]);
        
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setStatus(taskData.status);
        setOriginalStatus(taskData.status);
        setPriority(taskData.priority);
        setDueDate(taskData.due_date || '');
        setProjects(projectsResponse.items);
      } catch (err) {
        setError('Fehler beim Laden der Aufgabe');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadTaskAndProjects();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!title) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setSaving(true);
      await taskService.update(taskId, {
        title,
        description: description || undefined,
        priority,
        due_date: dueDate || undefined,
      });
      if (status !== originalStatus) {
        await taskService.updateStatus(taskId, status);
      }
      history.push(`/app/tasks/${taskId}`);
    } catch (err) {
      setError('Fehler beim Speichern der Aufgabe');
      console.error(err?.message || err);
    } finally {
      setSaving(false);
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

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Aufgabe bearbeiten</h1>
        <p className="page-subtitle">Ändern Sie die Aufgabendetails</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Aufgabendetails</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Titel *</IonLabel>
              <IonInput
                value={title}
                onIonInput={(e) => setTitle(e.detail.value!)}
                placeholder="Aufgabentitel"
                className="app-form-input"
                required
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Beschreibung</IonLabel>
              <IonTextarea
                value={description}
                onIonInput={(e) => setDescription(e.detail.value!)}
                placeholder="Beschreibung der Aufgabe"
                rows={4}
                className="app-form-textarea"
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Status</IonLabel>
              <IonSelect
                value={status}
                onIonChange={(e) => setStatus(e.detail.value!)}
                interface="action-sheet"
                className="app-form-input"
              >
                <IonSelectOption value="open">Offen</IonSelectOption>
                <IonSelectOption value="in_progress">In Bearbeitung</IonSelectOption>
                <IonSelectOption value="review">Review</IonSelectOption>
                <IonSelectOption value="done">Erledigt</IonSelectOption>
                <IonSelectOption value="cancelled">Abgebrochen</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Priorität</IonLabel>
              <IonSelect
                value={priority}
                onIonChange={(e) => setPriority(e.detail.value!)}
                interface="action-sheet"
                className="app-form-input"
              >
                <IonSelectOption value="low">Niedrig</IonSelectOption>
                <IonSelectOption value="medium">Mittel</IonSelectOption>
                <IonSelectOption value="high">Hoch</IonSelectOption>
                <IonSelectOption value="urgent">Dringend</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Fälligkeitsdatum</IonLabel>
              <IonInput
                type="date"
                value={dueDate}
                onIonInput={(e) => setDueDate(e.detail.value!)}
                className="app-form-input"
              />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={saving}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {saving ? 'Speichert...' : 'Änderungen speichern'}
        </IonButton>

        <IonButton
          routerLink={`/app/tasks/${taskId}`}
          expand="block"
          fill="outline"
          className="app-button-secondary"
        >
          <IonIcon slot="start" icon={closeOutline} />
          Abbrechen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default TaskEditPage;
