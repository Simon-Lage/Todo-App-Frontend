import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  useIonAlert,
} from '@ionic/react';
import {
  createOutline,
  trashOutline,
  peopleOutline,
  checkmarkCircleOutline,
  addCircleOutline,
  imageOutline,
} from 'ionicons/icons';
import { projectService } from '../../../services/projectService';
import { imageService } from '../../../services/imageService';
import type { ImageView, ProjectStatsView, ProjectView, TaskStatus } from '../../../types/api';
import { useAuthSession } from '../../../routing/useAuthSession';
import { getStatusLabel } from '../../../utils/taskUtils';
import { getErrorMessage } from '../../../utils/errorUtils';
import { toastService } from '../../../services/toastService';
import AuthenticatedImage from '../../../components/AuthenticatedImage';
	
const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { authSession } = useAuthSession();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [project, setProject] = useState<ProjectView | null>(null);
  const [stats, setStats] = useState<ProjectStatsView | null>(null);
  const [imagePreview, setImagePreview] = useState<ImageView[]>([]);
  const [imageTotal, setImageTotal] = useState(0);
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
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadExtras = async () => {
      if (!projectId) return;

      try {
        const statsResponse = await projectService.getStats(projectId);
        setStats(statsResponse);
      } catch {
        setStats(null);
      }

      try {
        const imageList = await imageService.list({ projectId });
        setImageTotal(imageList.length);
        setImagePreview(imageList.slice(0, 3));
      } catch {
        setImageTotal(0);
        setImagePreview([]);
      }
    };

    void loadExtras();
  }, [projectId]);

  const canEditProject = Boolean(authSession.permissions?.['perm_can_edit_projects']);
  const canDeleteProject = Boolean(authSession.permissions?.['perm_can_delete_projects']);
  const canCreateTasks = Boolean(authSession.permissions?.['perm_can_create_tasks']);
  const canViewTeam = Boolean(authSession.permissions?.['perm_can_read_user']);
  const canReadAllTasks = Boolean(authSession.permissions?.['perm_can_read_all_tasks']);
  const currentUserId = (authSession.user as any)?.id as string | undefined;
  const isProjectTeamLead = Boolean(currentUserId && project?.teamlead_user_ids?.includes(currentUserId));

  const handleDelete = async () => {
    if (!project) return;

    try {
      await projectService.delete(project.id);
      history.push('/app/project/list/all');
    } catch (err) {
      console.error('Fehler beim Löschen des Projekts', getErrorMessage(err));
    }
  };

  const confirmDelete = () => {
    if (!project) return;

    presentAlert({
      header: 'Projekt löschen',
      message: `Möchten Sie das Projekt "${project.name}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Löschen', role: 'destructive', handler: () => void handleDelete() },
      ],
    });
  };

  const confirmJoinAsTeamLead = () => {
    if (!project) return;
    presentAlert({
      header: 'Projektleitung übernehmen',
      message: `Möchten Sie sich selbst als Projektleitung für "${project.name}" eintragen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Übernehmen',
          handler: () => {
            void (async () => {
              try {
                const updated = await projectService.joinAsTeamLead(project.id);
                setProject(updated);
                toastService.success('Sie sind jetzt Projektleitung.');
              } catch (err) {
                toastService.error('Aktion nicht möglich.');
                console.error(getErrorMessage(err));
              }
            })();
          },
        },
      ],
    });
  };

  const confirmCompleteProject = () => {
    if (!project) return;
    presentAlert({
      header: 'Projekt abschließen',
      message: `Möchten Sie das Projekt "${project.name}" als abgeschlossen markieren?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Abschließen',
          handler: () => {
            void (async () => {
              try {
                const updated = await projectService.complete(project.id);
                setProject(updated);
                toastService.success('Projekt abgeschlossen.');
              } catch (err) {
                toastService.error('Projekt konnte nicht abgeschlossen werden.');
                console.error(getErrorMessage(err));
              }
            })();
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

  if (error || !project) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Projekt nicht gefunden'}</div>
      </IonContent>
    );
  }

  const statusOrder: TaskStatus[] = ['open', 'in_progress', 'review', 'done', 'cancelled'];

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">{project.name}</h1>
        <p className="page-subtitle">
          {project.is_completed ? 'Abgeschlossen' : 'Aktiv'} • {project.description || 'Keine Beschreibung'}
        </p>
      </div>

      <IonGrid style={{ padding: '0 16px' }}>
        <IonRow>
          <IonCol size="6">
            <IonCard style={{ margin: 0, textAlign: 'center', padding: '20px' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '40px', color: 'var(--ion-color-primary)', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
                {stats?.tasks?.total ?? '—'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-step-600)' }}>Aufgaben</p>
            </IonCard>
          </IonCol>
          <IonCol size="6">
            <IonCard style={{ margin: 0, textAlign: 'center', padding: '20px' }}>
              <IonIcon icon={imageOutline} style={{ fontSize: '40px', color: 'var(--ion-color-secondary)', marginBottom: '8px' }} />
              <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: 'bold' }}>
                {imageTotal}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-step-600)' }}>Bilder</p>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Aufgabenstatus</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {!stats ? (
            <p style={{ margin: 0, color: 'var(--ion-color-step-600)' }}>Keine Berechtigung oder keine Daten verfügbar</p>
          ) : (
          <IonGrid style={{ padding: 0 }}>
            <IonRow>
              {statusOrder.map((status) => (
                <IonCol key={status} size="6">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'var(--ion-color-light)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-step-650)' }}>{getStatusLabel(status)}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ion-color-dark)' }}>{stats?.tasks?.by_status?.[status] ?? 0}</span>
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
          )}
        </IonCardContent>
      </IonCard>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Projektbilder</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
	          {imagePreview.length === 0 ? (
	            <p style={{ margin: 0, color: 'var(--ion-color-step-600)' }}>Keine Bilder vorhanden</p>
	          ) : (
	            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
	              {imagePreview.map((image) => (
	                <div key={image.id} style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '12px', overflow: 'hidden', background: 'var(--ion-color-light)' }}>
	                  <AuthenticatedImage
	                    imageId={image.id}
	                    alt={image.original_filename}
	                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
	                  />
	                </div>
	              ))}
	            </div>
	          )}

          <IonButton routerLink={`/app/project/${projectId}/images`} expand="block" fill="outline" style={{ marginTop: '12px' }}>
            Bilder verwalten
          </IonButton>
        </IonCardContent>
      </IonCard>

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

          {canCreateTasks && (
            <IonButton 
              routerLink={`/app/project/${projectId}/tasks/create`} 
              expand="block" 
              fill="outline"
            >
              <IonIcon slot="start" icon={addCircleOutline} />
              Neue Aufgabe erstellen
            </IonButton>
          )}

          {canViewTeam && (
            <IonButton 
              routerLink={`/app/project/${projectId}/team`} 
              expand="block" 
              fill="outline"
            >
              <IonIcon slot="start" icon={peopleOutline} />
              Team anzeigen
            </IonButton>
          )}

          {canReadAllTasks && !isProjectTeamLead && (
            <IonButton expand="block" fill="outline" onClick={confirmJoinAsTeamLead}>
              <IonIcon slot="start" icon={addCircleOutline} />
              Als Projektleitung eintragen
            </IonButton>
          )}

          {isProjectTeamLead && !project.is_completed && (
            <IonButton expand="block" fill="outline" onClick={confirmCompleteProject}>
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              Projekt abschließen
            </IonButton>
          )}
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

	        </IonCardContent>
	      </IonCard>

      {/* Actions */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {canEditProject && (
          <IonButton 
            routerLink={`/app/project/${projectId}/edit`} 
            expand="block"
            className="app-button"
          >
            <IonIcon slot="start" icon={createOutline} />
            Bearbeiten
          </IonButton>
        )}

        {canDeleteProject && (
          <IonButton 
            expand="block"
            color="danger"
            fill="outline"
            onClick={confirmDelete}
            className="app-button-secondary"
          >
            <IonIcon slot="start" icon={trashOutline} />
            Löschen
          </IonButton>
        )}
      </div>
    </IonContent>
  );
};

export default ProjectDetailsPage;
