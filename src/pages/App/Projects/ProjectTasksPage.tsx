import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonList, IonItem, IonLabel, IonBadge, IonButton, IonSearchbar, IonSelect, IonSelectOption } from '@ionic/react';
import { projectService } from '../../../services/projectService';
import type { TaskSummaryView, TaskStatus, TaskPriority } from '../../../types/api';

const ProjectTasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await projectService.getTasks(
          projectId,
          {
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            q: searchText || undefined,
          },
          { limit: 100 }
        );
        setTasks(response.items);
      } catch (err) {
        setError('Fehler beim Laden der Aufgaben');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId, searchText, statusFilter, priorityFilter]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Projekt-Aufgaben</h1>
        </IonText>

        <IonSearchbar value={searchText} onIonInput={(e) => setSearchText(e.detail.value!)} placeholder="Aufgaben durchsuchen" />

        <IonSelect value={statusFilter} onIonChange={(e) => setStatusFilter(e.detail.value)} placeholder="Status filtern">
          <IonSelectOption value="">Alle</IonSelectOption>
          <IonSelectOption value="open">Offen</IonSelectOption>
          <IonSelectOption value="in_progress">In Bearbeitung</IonSelectOption>
          <IonSelectOption value="review">Review</IonSelectOption>
          <IonSelectOption value="done">Erledigt</IonSelectOption>
          <IonSelectOption value="cancelled">Abgebrochen</IonSelectOption>
        </IonSelect>

        <IonSelect value={priorityFilter} onIonChange={(e) => setPriorityFilter(e.detail.value)} placeholder="Priorität filtern">
          <IonSelectOption value="">Alle</IonSelectOption>
          <IonSelectOption value="low">Niedrig</IonSelectOption>
          <IonSelectOption value="medium">Mittel</IonSelectOption>
          <IonSelectOption value="high">Hoch</IonSelectOption>
          <IonSelectOption value="urgent">Dringend</IonSelectOption>
        </IonSelect>

        {tasks.length === 0 ? (
          <IonText className="ion-text-center">Keine Aufgaben gefunden</IonText>
        ) : (
          <IonList>
            {tasks.map((task) => (
              <IonItem key={task.id} routerLink={`/app/tasks/${task.id}`}>
                <IonLabel>
                  <h2>{task.title}</h2>
                  <p>Status: {task.status} | Priorität: {task.priority}</p>
                  {task.due_date && <p>Fällig: {new Date(task.due_date).toLocaleDateString()}</p>}
                </IonLabel>
                <IonBadge slot="end" color={task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'primary'}>
                  {task.priority}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonButton routerLink={`/app/project/${projectId}/tasks/create`} expand="block">
          Neue Aufgabe erstellen
        </IonButton>

        <IonButton routerLink={`/app/project/${projectId}`} expand="block" fill="outline">
          Zurück zum Projekt
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProjectTasksPage;

