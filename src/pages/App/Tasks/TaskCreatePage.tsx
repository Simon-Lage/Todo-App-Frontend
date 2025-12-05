import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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

const TaskCreatePage: React.FC = () => {
  const history = useHistory();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const defaultStatus: TaskStatus = 'open';
  const [projects, setProjects] = useState<ProjectSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.list({}, { limit: 100 });
        setProjects(response.items);
      } catch (err) {
        setError('Fehler beim Laden der Projekte');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleSubmit = async () => {
    if (!title || !projectId) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setSaving(true);
      const newTask = await taskService.create({
        title,
        description: description || undefined,
        project_id: projectId,
        status: defaultStatus,
        priority,
        due_date: dueDate || undefined,
      });
      history.push(`/app/tasks/${newTask.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen der Aufgabe');
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
          <p>Lade Daten...</p>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Neue Aufgabe</h1>
        <p className="page-subtitle">Erstellen Sie eine neue Aufgabe</p>
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
                placeholder="Aufgabentitel eingeben"
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
              <IonLabel position="stacked" className="app-form-label">Projekt *</IonLabel>
              <IonSelect
                value={projectId}
                onIonChange={(e) => setProjectId(e.detail.value!)}
                interface="action-sheet"
                placeholder="Projekt auswählen"
                className="app-form-input"
              >
                {projects.map((project) => (
                  <IonSelectOption key={project.id} value={project.id}>
                    {project.name}
                  </IonSelectOption>
                ))}
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
          {saving ? 'Speichert...' : 'Aufgabe erstellen'}
        </IonButton>

        <IonButton
          routerLink="/app/tasks/my"
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

export default TaskCreatePage;
