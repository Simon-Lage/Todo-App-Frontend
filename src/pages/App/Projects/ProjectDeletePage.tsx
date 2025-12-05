import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { projectService } from '../../../services/projectService';
import type { ProjectView } from '../../../types/api';

const ProjectDeletePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const history = useHistory();
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
        console.error(err?.message || err);
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
      console.error(err?.message || err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error && !project) {
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
          <h1>Projekt löschen</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Bestätigung erforderlich</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>Möchten Sie das folgende Projekt wirklich löschen?</p>
              <h2>{project?.name}</h2>
              <p>{project?.description}</p>
              <p style={{ color: 'var(--ion-color-danger)' }}>
                <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Aufgaben bleiben bestehen, werden aber keinem Projekt mehr zugeordnet.
              </p>
            </IonText>

            {error && <IonText color="danger">{error}</IonText>}

            <IonButton onClick={handleDelete} expand="block" color="danger" disabled={deleting}>
              {deleting ? <IonSpinner /> : 'Ja, Projekt löschen'}
            </IonButton>

            <IonButton routerLink={`/app/project/${projectId}`} expand="block" fill="outline">
              Abbrechen
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ProjectDeletePage;

