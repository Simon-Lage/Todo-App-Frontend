import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonSpinner, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonItem, IonLabel, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList } from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import type { TaskStatus, TaskPriority } from '../../../types/api';
import { getErrorMessage } from '../../../utils/errorUtils';

const ProjectTaskCreatePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('open');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title) {
      setError('Titel ist ein Pflichtfeld');
      return;
    }

    try {
      setLoading(true);
      const task = await taskService.create({
        title,
        description: description || undefined,
        status,
        priority,
        project_id: projectId,
        due_date: dueDate || undefined,
      });
      history.push(`/app/tasks/${task.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen der Aufgabe');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Neue Aufgabe</h1>
        <p className="page-subtitle">Erstellen Sie eine neue Aufgabe für dieses Projekt</p>
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
                placeholder="Aufgabenbeschreibung"
                className="app-form-input"
                rows={4}
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel className="app-form-label">Status</IonLabel>
              <IonSelect
                value={status}
                onIonChange={(e) => setStatus(e.detail.value)}
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
              <IonLabel className="app-form-label">Priorität</IonLabel>
              <IonSelect
                value={priority}
                onIonChange={(e) => setPriority(e.detail.value)}
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
          onClick={handleSubmit}
          expand="block"
          disabled={loading}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {loading ? 'Erstellt...' : 'Aufgabe erstellen'}
        </IonButton>

        <IonButton
          routerLink={`/app/project/${projectId}/tasks`}
          expand="block"
          fill="outline"
          className="app-button-secondary"
          style={{ marginTop: '8px' }}
        >
          <IonIcon slot="start" icon={closeOutline} />
          Abbrechen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default ProjectTaskCreatePage;

