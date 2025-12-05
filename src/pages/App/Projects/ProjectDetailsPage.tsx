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
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
} from '@ionic/react';
import {
  createOutline,
  trashOutline,
  peopleOutline,
  checkmarkCircleOutline,
  addCircleOutline,
} from 'ionicons/icons';
import { projectService } from '../../../services/projectService';
import type { ProjectView } from '../../../types/api';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const history = useHistory();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('Keine Projekt-ID angegeben');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectData = await projectService.getById(projectId);
        setProject(projectData);
      } catch (err) {
        setError('Fehler beim Laden des Projekts');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleDelete = async () => {
    if (!project || !confirm('Möchten Sie dieses Projekt wirklich löschen?')) return;

    try {
      await projectService.delete(project.id);
      history.push('/app/project/list/all');
    } catch (err) {
      console.error('Fehler beim Löschen des Projekts', err?.message || err);
    }
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Projekt...</p>
        </div>
      </IonContent>
    );
  }

  if (error || !project) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Projekt nicht gefunden'}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <p className="page-subtitle">{project.description || 'Keine Beschreibung'}</p>
      </div>

      {/* Quick Stats */}
      <IonGrid style={{ padding: '0 16px' }}>
        <IonRow>
          <IonCol size="6">
            <IonCard style={{ margin: 0, textAlign: 'center', padding: '20px' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '40px', color: 'var(--ion-color-primary)', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
                {project.task_count || 0}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-step-600)' }}>Aufgaben</p>
            </IonCard>
          </IonCol>
          <IonCol size="6">
            <IonCard style={{ margin: 0, textAlign: 'center', padding: '20px' }}>
              <IonIcon icon={peopleOutline} style={{ fontSize: '40px', color: 'var(--ion-color-secondary)', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
                {project.member_count || 0}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-step-600)' }}>Mitglieder</p>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* Quick Actions */}
      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Schnellaktionen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <IonButton 
            routerLink={`/app/project/${projectId}/tasks`} 
            expand="block" 
            fill="outline"
          >
            <IonIcon slot="start" icon={checkmarkCircleOutline} />
            Aufgaben anzeigen
          </IonButton>

          <IonButton 
            routerLink={`/app/project/${projectId}/tasks/create`} 
            expand="block" 
            fill="outline"
          >
            <IonIcon slot="start" icon={addCircleOutline} />
            Neue Aufgabe erstellen
          </IonButton>

          <IonButton 
            routerLink={`/app/project/${projectId}/team`} 
            expand="block" 
            fill="outline"
          >
            <IonIcon slot="start" icon={peopleOutline} />
            Team anzeigen
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Details Card */}
      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Projektdetails</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
              Erstellt am:
            </strong>
            <p style={{ margin: 0, fontSize: '15px' }}>
              {new Date(project.created_at).toLocaleDateString('de-DE')}
            </p>
          </div>

          {project.updated_at && (
            <div>
              <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
                Zuletzt aktualisiert:
              </strong>
              <p style={{ margin: 0, fontSize: '15px' }}>
                {new Date(project.updated_at).toLocaleDateString('de-DE')}
              </p>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* Actions */}
      <div style={{ padding: '0 16px 16px' }}>
        <IonButton 
          routerLink={`/app/project/${projectId}/edit`} 
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

export default ProjectDetailsPage;
