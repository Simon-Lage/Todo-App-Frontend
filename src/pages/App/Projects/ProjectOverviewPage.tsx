import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonGrid, IonRow, IonCol } from '@ionic/react';
import { projectService } from '../../../services/projectService';
import type { ProjectView, TaskSummaryView } from '../../../types/api';

const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [projectData, tasksResponse] = await Promise.all([
          projectService.getById(projectId),
          projectService.getTasks(projectId, {}, { limit: 200 })
        ]);
        setProject(projectData);
        setTasks(tasksResponse.items);
      } catch (err) {
        setError('Fehler beim Laden der Übersicht');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [projectId]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !project) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error || 'Projekt nicht gefunden'}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const stats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length,
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>{project.name}</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Projekt-Statistiken</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonText>
                    <h3>{stats.total}</h3>
                    <p>Gesamt-Aufgaben</p>
                  </IonText>
                </IonCol>
                <IonCol size="6">
                  <IonText>
                    <h3>{stats.open}</h3>
                    <p>Offen</p>
                  </IonText>
                </IonCol>
                <IonCol size="6">
                  <IonText>
                    <h3>{stats.inProgress}</h3>
                    <p>In Bearbeitung</p>
                  </IonText>
                </IonCol>
                <IonCol size="6">
                  <IonText>
                    <h3>{stats.review}</h3>
                    <p>Review</p>
                  </IonText>
                </IonCol>
                <IonCol size="6">
                  <IonText>
                    <h3>{stats.done}</h3>
                    <p>Erledigt</p>
                  </IonText>
                </IonCol>
                <IonCol size="6">
                  <IonText color={stats.urgent > 0 ? 'danger' : 'medium'}>
                    <h3>{stats.urgent}</h3>
                    <p>Dringend</p>
                  </IonText>
                </IonCol>
                <IonCol size="6">
                  <IonText color={stats.overdue > 0 ? 'danger' : 'medium'}>
                    <h3>{stats.overdue}</h3>
                    <p>Überfällig</p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonButton routerLink={`/app/project/${projectId}`} expand="block">
              Zum Projekt
            </IonButton>
            <IonButton routerLink={`/app/project/${projectId}/tasks`} expand="block" fill="outline">
              Alle Aufgaben anzeigen
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ProjectOverviewPage;

