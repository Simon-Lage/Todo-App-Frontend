import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton, IonItem, IonLabel } from '@ionic/react';
import { taskService } from '../../../services/taskService';
import type { TaskStatus, TaskPriority } from '../../../types/api';

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
      console.error(err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Neue Aufgabe erstellen</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonItem>
          <IonLabel position="stacked">Titel *</IonLabel>
          <IonInput value={title} onIonInput={(e) => setTitle(e.detail.value!)} placeholder="Aufgabentitel" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Beschreibung</IonLabel>
          <IonTextarea value={description} onIonInput={(e) => setDescription(e.detail.value!)} placeholder="Aufgabenbeschreibung" />
        </IonItem>

        <IonItem>
          <IonLabel>Status</IonLabel>
          <IonSelect value={status} onIonChange={(e) => setStatus(e.detail.value)}>
            <IonSelectOption value="open">Offen</IonSelectOption>
            <IonSelectOption value="in_progress">In Bearbeitung</IonSelectOption>
            <IonSelectOption value="review">Review</IonSelectOption>
            <IonSelectOption value="done">Erledigt</IonSelectOption>
            <IonSelectOption value="cancelled">Abgebrochen</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel>Priorität</IonLabel>
          <IonSelect value={priority} onIonChange={(e) => setPriority(e.detail.value)}>
            <IonSelectOption value="low">Niedrig</IonSelectOption>
            <IonSelectOption value="medium">Mittel</IonSelectOption>
            <IonSelectOption value="high">Hoch</IonSelectOption>
            <IonSelectOption value="urgent">Dringend</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Fälligkeitsdatum</IonLabel>
          <IonInput type="date" value={dueDate} onIonInput={(e) => setDueDate(e.detail.value!)} />
        </IonItem>

        <IonButton onClick={handleSubmit} expand="block" disabled={loading}>
          {loading ? <IonSpinner /> : 'Aufgabe erstellen'}
        </IonButton>

        <IonButton routerLink={`/app/project/${projectId}/tasks`} expand="block" fill="outline">
          Abbrechen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProjectTaskCreatePage;

