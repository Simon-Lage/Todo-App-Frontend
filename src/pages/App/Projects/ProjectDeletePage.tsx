import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonText, IonSpinner, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, useIonAlert } from '@ionic/react';
import { trashOutline, closeOutline } from 'ionicons/icons';
import { projectService } from '../../../services/projectService';
import type { ProjectView } from '../../../types/api';
import { getErrorMessage } from '../../../utils/errorUtils';

const ProjectDeletePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getById(projectId);
        setProject(projectData);
      } catch (err) {
        setError('Fehler beim Laden des Projekts');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleDelete = async () => {
    if (!project) return;

    try {
      setDeleting(true);
      await projectService.delete(project.id);
      history.push('/app/project');
    } catch (err) {
      setError('Fehler beim Löschen des Projekts');
      console.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!project || deleting) return;

    presentAlert({
      header: 'Projekt löschen',
      message: `Möchten Sie das Projekt "${project.name}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            void handleDelete();
          },
        },
      ],
    });
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

  if (error && !project) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Projekt löschen</h1>
        <p className="page-subtitle">Bestätigung erforderlich</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Projekt löschen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText>
            <p>Möchten Sie das folgende Projekt wirklich löschen?</p>
            <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>{project?.name}</h2>
            <p style={{ marginBottom: '16px' }}>{project?.description || 'Keine Beschreibung'}</p>
            <p style={{ color: 'var(--ion-color-danger)', marginTop: '16px' }}>
              <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Aufgaben bleiben bestehen, werden aber keinem Projekt mehr zugeordnet.
            </p>
          </IonText>

          {error && (
            <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>
          )}
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          onClick={confirmDelete}
          expand="block"
          color="danger"
          disabled={deleting}
          className="app-button"
        >
          <IonIcon slot="start" icon={trashOutline} />
          {deleting ? 'Löscht...' : 'Ja, Projekt löschen'}
        </IonButton>

        <IonButton
          routerLink={`/app/project/${projectId}`}
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

export default ProjectDeletePage;

