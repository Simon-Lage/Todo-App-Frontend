import React, { useEffect, useMemo, useState } from 'react';
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
  IonItem,
  IonLabel,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonSearchbar,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonList,
  useIonAlert,
} from '@ionic/react';
import {
  createOutline,
  trashOutline,
  briefcaseOutline,
  personOutline,
  calendarOutline,
  checkmarkCircleOutline,
  addOutline,
  closeOutline,
  peopleOutline,
  imageOutline,
} from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import { projectService } from '../../../services/projectService';
import { searchService } from '../../../services/searchService';
import { userDirectoryService } from '../../../services/userDirectoryService';
import { imageService } from '../../../services/imageService';
import { getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '../../../utils/taskUtils';
import type { ImageView, ProjectSummaryView, TaskView, TaskStatus, UserView, UserListView } from '../../../types/api';
import { useAuthSession } from '../../../routing/useAuthSession';
import UserAvatar from '../../../components/UserAvatar';
import AuthenticatedImage from '../../../components/AuthenticatedImage';
import { getErrorMessage } from '../../../utils/errorUtils';
import { toastService } from '../../../services/toastService';

const TaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const history = useHistory();
  const { authSession } = useAuthSession();
  const [presentAlert] = useIonAlert();
  const [task, setTask] = useState<TaskView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTeamLeadIds, setProjectTeamLeadIds] = useState<string[]>([]);
  const [taskImages, setTaskImages] = useState<ImageView[]>([]);
  const [taskImageTotal, setTaskImageTotal] = useState(0);
		  const [showUserSearchModal, setShowUserSearchModal] = useState(false);
	  const [userSearchTerm, setUserSearchTerm] = useState('');
	  const [searchResults, setSearchResults] = useState<UserListView[]>([]);
	  const [searchingUsers, setSearchingUsers] = useState(false);
	  const [cachedUsers, setCachedUsers] = useState<UserListView[]>([]);
	  const [showMoveProjectModal, setShowMoveProjectModal] = useState(false);
	  const [projectSearchTerm, setProjectSearchTerm] = useState('');
	  const [projectSearchResults, setProjectSearchResults] = useState<ProjectSummaryView[]>([]);
	  const [searchingProjects, setSearchingProjects] = useState(false);

	  useEffect(() => {
	    const loadTask = async () => {
      const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      if (!taskId || !uuidPattern.test(taskId)) {
        setError('Ungültige Task-ID');
        setLoading(false);
        return;
      }

		      try {
		        setLoading(true);
		        const taskData = await taskService.getById(taskId);
		        setTask(taskData);
            try {
              const images = await imageService.list({ taskId: taskData.id });
              setTaskImageTotal(images.length);
              setTaskImages(images.slice(0, 3));
            } catch {
              setTaskImageTotal(0);
              setTaskImages([]);
            }
	          if (taskData.project_id) {
	            try {
	              const project = await projectService.getById(taskData.project_id);
	              setProjectTeamLeadIds(project.teamlead_user_ids ?? []);
            } catch {
              setProjectTeamLeadIds([]);
            }
          } else {
            setProjectTeamLeadIds([]);
          }
	      } catch (err) {
	        setError('Fehler beim Laden der Aufgabe');
	        console.error(getErrorMessage(err));
	      } finally {
	        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

	  const handleStatusChange = async (newStatus: TaskStatus) => {
	    if (!canChangeStatus) return;
	    if (!task) return;
      if ((newStatus === 'done' || newStatus === 'cancelled') && !canFinalizeStatus) {
        toastService.error('Nur Projektleitungen können eine Aufgabe als erledigt/abgebrochen markieren.');
        return;
      }
	
	    try {
	      const updated = await taskService.updateStatus(task.id, newStatus);
	      setTask(updated);
	    } catch (err) {
        toastService.error('Status konnte nicht geändert werden.');
	      console.error('Fehler beim Ändern des Status', getErrorMessage(err));
	    }
	  };

  const handleDelete = async () => {
    if (!canDelete) return;
    if (!task) return;

    try {
      await taskService.delete(task.id);
      history.push('/app/tasks/my');
    } catch (err) {
      console.error('Fehler beim Löschen der Aufgabe', getErrorMessage(err));
    }
  };

  const confirmDelete = () => {
    if (!task) return;

    presentAlert({
      header: 'Aufgabe löschen',
      message: `Möchten Sie die Aufgabe "${task.title}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Löschen', role: 'destructive', handler: () => void handleDelete() },
      ],
    });
  };


    const currentUserId = useMemo(() => (authSession.user as UserView | null)?.id ?? null, [authSession.user]);

    const isTaskProjectTeamLead = useMemo(() => {
      if (!task?.project_id) {
        return false;
      }
      if (!currentUserId) {
        return false;
      }
      return projectTeamLeadIds.includes(currentUserId);
    }, [currentUserId, projectTeamLeadIds, task?.project_id]);

    const canManageAssignments = useMemo(() => {
      if (!task || !currentUserId) {
        return false;
      }
      if (task.project_id) {
        return isTaskProjectTeamLead;
      }
      return task.created_by_user_id === currentUserId;
    }, [currentUserId, isTaskProjectTeamLead, task]);

	  const canEdit = useMemo(() => {
	    if (!task) return false;
	    if (!currentUserId) return false;

	    if (task.created_by_user_id === currentUserId) return true;
	    if (task.assigned_user_ids.includes(currentUserId)) return true;
      if (task.project_id && isTaskProjectTeamLead) return true;
	
	    return false;
	  }, [currentUserId, isTaskProjectTeamLead, task]);

  const canDelete = useMemo(() => {
    const permissions = authSession.permissions ?? {};
    return Boolean(permissions['perm_can_delete_tasks']);
  }, [authSession.permissions]);

	  const canAssignUsers = useMemo(() => {
	    const permissions = authSession.permissions ?? {};
	    return Boolean(canManageAssignments && permissions['perm_can_read_user']);
	  }, [authSession.permissions, canManageAssignments]);

    const canFinalizeStatus = canManageAssignments;
	  const canChangeStatus = canEdit;

  const updateUserSearch = (term: string, users: UserListView[]) => {
    const normalizedTerm = term.trim().toLowerCase();
    const assignedIds = new Set(task?.assigned_user_ids ?? []);

    const available = users.filter((user) => !assignedIds.has(user.id));

    if (normalizedTerm === '') {
      setSearchResults(available);
      return;
    }

    const filtered = available.filter((user) => {
      const name = (user.name ?? '').toLowerCase();
      const email = (user.email ?? '').toLowerCase();
      return name.includes(normalizedTerm) || email.includes(normalizedTerm);
    });
    setSearchResults(filtered);
  };

  useEffect(() => {
    if (!showUserSearchModal || !canAssignUsers) {
      return;
    }

    let cancelled = false;

    const loadUsers = async () => {
      try {
        setSearchingUsers(true);
        const users = await userDirectoryService.getAllUsers();
        if (cancelled) return;
        setCachedUsers(users);
        updateUserSearch(userSearchTerm, users);
      } catch (err) {
        if (!cancelled) {
          setCachedUsers([]);
          setSearchResults([]);
        }
        console.error(getErrorMessage(err));
      } finally {
        if (!cancelled) {
          setSearchingUsers(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [showUserSearchModal, canAssignUsers, task?.assigned_user_ids.join(','), userSearchTerm]);

  const handleAssignUser = async (userId: string) => {
    if (!task || !canAssignUsers) return;

    try {
      const updated = await taskService.assignUser(task.id, userId);
      setTask(updated);
      setShowUserSearchModal(false);
      setUserSearchTerm('');
      setSearchResults([]);
    } catch (err) {
      console.error('Fehler beim Zuweisen des Users', err);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    if (!task || !canAssignUsers) return;

    try {
      const updated = await taskService.unassignUser(task.id, userId);
      setTask(updated);
    } catch (err) {
      console.error('Fehler beim Entfernen des Users', err);
    }
  };

  const handleClearAssignees = async () => {
    if (!task || !canAssignUsers) return;

    try {
      const updated = await taskService.clearAssignees(task.id);
      setTask(updated);
    } catch (err) {
      console.error('Fehler beim Entfernen aller Zuweisungen', err);
    }
  };

  const confirmClearAssignees = () => {
    if (!task || !canAssignUsers) return;

    presentAlert({
      header: 'Zuweisungen entfernen',
      message: `Möchten Sie wirklich alle Zuweisungen der Aufgabe "${task.title}" entfernen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        { text: 'Entfernen', role: 'destructive', handler: () => void handleClearAssignees() },
      ],
    });
  };

	  const canMoveTask = useMemo(() => {
	    const permissions = authSession.permissions ?? {};
	    return Boolean(canManageAssignments && permissions['perm_can_read_projects']);
	  }, [authSession.permissions, canManageAssignments]);

  const handleProjectSearch = async (term: string) => {
    setProjectSearchTerm(term);
    if (term.length < 2) {
      setProjectSearchResults([]);
      return;
    }

    try {
      setSearchingProjects(true);
      const projects = await searchService.searchProjects(term, 10);
      const filteredProjects = projects.filter(p => p.id !== task?.project_id);
      setProjectSearchResults(filteredProjects);
    } catch (err) {
      console.error('Fehler bei der Projekt-Suche', err);
      setProjectSearchResults([]);
    } finally {
      setSearchingProjects(false);
    }
  };

  const handleMoveToProject = async (projectId: string) => {
    if (!task || !canMoveTask) return;

    try {
      const updated = await taskService.moveToProject(task.id, projectId);
      setTask(updated);
      setShowMoveProjectModal(false);
      setProjectSearchTerm('');
      setProjectSearchResults([]);
    } catch (err) {
      console.error('Fehler beim Verschieben der Aufgabe', err);
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

  if (error || !task) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Aufgabe nicht gefunden'}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">{task.title}</h1>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <IonChip color={getStatusColor(task.status)} className="task-meta-chip">
            <IonLabel>{getStatusLabel(task.status)}</IonLabel>
          </IonChip>
          <IonChip color={getPriorityColor(task.priority)} className="task-meta-chip">
            <IonLabel>{getPriorityLabel(task.priority)}</IonLabel>
          </IonChip>
        </div>
      </div>

      {/* Details Card */}
      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Details</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {task.description && (
            <div style={{ marginBottom: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--ion-color-step-600)' }}>
                Beschreibung:
              </strong>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6' }}>{task.description}</p>
            </div>
          )}

          <IonGrid style={{ padding: 0 }}>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
                    Projekt:
                  </strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <IonButton 
                      routerLink={`/app/project/${task.project_id}`} 
                      fill="outline" 
                      size="small"
                    >
                      <IonIcon slot="start" icon={briefcaseOutline} />
                      Zum Projekt
                    </IonButton>
                    {canMoveTask && (
                      <IonButton 
                        fill="outline" 
                        size="small"
                        onClick={() => setShowMoveProjectModal(true)}
                      >
                        <IonIcon slot="start" icon={briefcaseOutline} />
                        Verschieben
                      </IonButton>
                    )}
                  </div>
                </div>
              </IonCol>

              {task.due_date && (
                <IonCol size="12" sizeMd="6">
                  <div style={{ marginBottom: '16px' }}>
                    <strong style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
                      Fällig am:
                    </strong>
                    <p style={{ margin: 0, fontSize: '15px' }}>
                      <IonIcon icon={calendarOutline} style={{ marginRight: '6px' }} />
                      {new Date(task.due_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </IonCol>
              )}
            </IonRow>
          </IonGrid>

          <div style={{ marginTop: '16px' }}>
            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--ion-color-step-600)' }}>
              Zugewiesen an:
            </strong>
            {task.assigned_user_ids.length > 0 ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {task.assigned_user_ids.map((userId) => {
                  const user = task.assigned_users?.find((candidate) => candidate.id === userId) ?? null;
                  const label = user?.name ?? userId.substring(0, 8) + '...';
                  const profileImageId = user?.profile_image_id ?? null;
                  return (
                    <IonChip
                      key={userId}
                      className="app-chip"
                      color="secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                      <UserAvatar name={label} imageId={profileImageId} size={20} />
                      <IonLabel style={{ fontWeight: 800 }}>{label}</IonLabel>
                      {canAssignUsers ? (
                        <IonIcon
                          icon={closeOutline}
                          style={{ fontSize: '16px', cursor: 'pointer' }}
                          onClick={() => handleUnassignUser(userId)}
                        />
                      ) : null}
                    </IonChip>
                  );
                })}
              </div>
            ) : (
              <IonText color="medium" style={{ fontSize: '14px' }}>Keine Zuweisungen</IonText>
            )}
            {canAssignUsers && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <IonButton
                  size="small"
                  fill="outline"
                  onClick={() => setShowUserSearchModal(true)}
                >
                  <IonIcon slot="start" icon={addOutline} />
                  User hinzufügen
                </IonButton>
                {task.assigned_user_ids.length > 0 && (
                  <IonButton
                    size="small"
                    fill="outline"
                    color="danger"
                    onClick={confirmClearAssignees}
                  >
                    <IonIcon slot="start" icon={peopleOutline} />
                    Alle entfernen
                  </IonButton>
                )}
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>

      {/* Status Change */}
      {canChangeStatus && (
        <IonCard className="app-card">
          <IonCardHeader>
            <IonCardTitle>Status ändern</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
	            <IonSelect
	              value={task.status}
	              onIonChange={(e) => handleStatusChange(e.detail.value as TaskStatus)}
	              interface="action-sheet"
	              style={{ width: '100%', '--padding-start': '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--ion-color-step-200)' }}
	            >
	              <IonSelectOption value="open">Offen</IonSelectOption>
	              <IonSelectOption value="in_progress">In Bearbeitung</IonSelectOption>
	              <IonSelectOption value="review">Review</IonSelectOption>
	              <IonSelectOption value="done" disabled={!canFinalizeStatus}>Erledigt</IonSelectOption>
	              <IonSelectOption value="cancelled" disabled={!canFinalizeStatus}>Abgebrochen</IonSelectOption>
	            </IonSelect>
          </IonCardContent>
        </IonCard>
      )}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Bilder</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {taskImageTotal === 0 ? (
            <p style={{ margin: 0, color: 'var(--ion-color-step-600)' }}>Keine Bilder vorhanden</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {taskImages.map((image) => (
                <div
                  key={image.id}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--ion-color-light)',
                  }}
                >
                  <AuthenticatedImage
                    imageId={image.id}
                    alt={image.original_filename}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ))}
            </div>
          )}

          <IonButton routerLink={`/app/tasks/${taskId}/images`} expand="block" fill="outline" style={{ marginTop: '12px' }}>
            <IonIcon slot="start" icon={imageOutline} />
            Bilder verwalten
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Actions */}
      {(canEdit || canDelete) && (
        <div style={{ padding: '0 16px 16px' }}>
          {canEdit && (
            <IonButton 
              routerLink={`/app/tasks/${taskId}/edit`} 
              expand="block"
              className="app-button"
            >
              <IonIcon slot="start" icon={createOutline} />
              Bearbeiten
            </IonButton>
          )}

          {canDelete && (
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
      )}

      <IonModal isOpen={showUserSearchModal} onDidDismiss={() => {
        setShowUserSearchModal(false);
        setUserSearchTerm('');
        setSearchResults([]);
      }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>User suchen</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => {
                setShowUserSearchModal(false);
                setUserSearchTerm('');
                setSearchResults([]);
              }}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
	            <IonSearchbar
	              value={userSearchTerm}
	              onIonInput={(e) => {
	                const value = e.detail.value ?? '';
	                setUserSearchTerm(value);
	                updateUserSearch(value, cachedUsers);
	              }}
	              placeholder="User suchen..."
	              debounce={150}
	            />
	          </div>
	          {searchingUsers && (
	            <div style={{ padding: '20px', textAlign: 'center' }}>
	              <IonSpinner name="circular" />
	            </div>
	          )}
	          {!searchingUsers && cachedUsers.length === 0 && (
	            <div style={{ padding: '20px', textAlign: 'center' }}>
	              <IonText color="medium">Keine User verfügbar</IonText>
	            </div>
	          )}
	          {!searchingUsers && cachedUsers.length > 0 && searchResults.length === 0 && (
	            <div style={{ padding: '20px', textAlign: 'center' }}>
	              <IonText color="medium">Keine Treffer</IonText>
	            </div>
	          )}
	          {!searchingUsers && searchResults.length > 0 && (
	            <IonList>
	              {searchResults.map((user) => (
	                <IonItem key={user.id} button onClick={() => handleAssignUser(user.id)}>
                  <IonLabel>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </IonLabel>
                  <IonIcon icon={addOutline} slot="end" />
                </IonItem>
              ))}
            </IonList>
          )}
        </IonContent>
      </IonModal>

      <IonModal isOpen={showMoveProjectModal} onDidDismiss={() => {
        setShowMoveProjectModal(false);
        setProjectSearchTerm('');
        setProjectSearchResults([]);
      }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Aufgabe verschieben</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => {
                setShowMoveProjectModal(false);
                setProjectSearchTerm('');
                setProjectSearchResults([]);
              }}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '16px' }}>
            <IonText color="medium" style={{ display: 'block', marginBottom: '16px', fontSize: '14px' }}>
              Suchen Sie nach einem Projekt, zu dem die Aufgabe verschoben werden soll.
            </IonText>
            <IonSearchbar
              value={projectSearchTerm}
              onIonInput={(e) => handleProjectSearch(e.detail.value!)}
              placeholder="Projekt suchen..."
              debounce={300}
            />
          </div>
          {searchingProjects && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <IonSpinner name="circular" />
            </div>
          )}
          {!searchingProjects && projectSearchResults.length === 0 && projectSearchTerm.length >= 2 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <IonText color="medium">Keine Projekte gefunden</IonText>
            </div>
          )}
          {!searchingProjects && projectSearchTerm.length < 2 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <IonText color="medium">Mindestens 2 Zeichen eingeben</IonText>
            </div>
          )}
          {!searchingProjects && projectSearchResults.length > 0 && (
            <IonList>
              {projectSearchResults.map((project) => (
                <IonItem key={project.id} button onClick={() => handleMoveToProject(project.id)}>
                  <IonIcon icon={briefcaseOutline} slot="start" />
                  <IonLabel>
                    <h3>{project.name}</h3>
                    {project.description && <p>{project.description}</p>}
                  </IonLabel>
                  <IonIcon icon={checkmarkCircleOutline} slot="end" />
                </IonItem>
              ))}
            </IonList>
          )}
        </IonContent>
      </IonModal>
    </IonContent>
  );
};

export default TaskDetailsPage;
