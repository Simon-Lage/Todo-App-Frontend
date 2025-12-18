import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  briefcaseOutline,
  timeOutline,
  ribbonOutline,
  shieldOutline,
  peopleOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { userService } from '../../../services/userService';
import { taskService } from '../../../services/taskService';
import { projectService } from '../../../services/projectService';
import { getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '../../../utils/taskUtils';
import type { UserView, TaskSummaryView, ProjectSummaryView } from '../../../types/api';
import './DashboardPage.css';
import { useAuthSession } from '../../../routing/useAuthSession';
import { sortTasksByStatusAndPriority } from '../../../utils/taskSort';
import { getErrorMessage } from '../../../utils/errorUtils';

const DashboardPage: React.FC = () => {
  const { authSession } = useAuthSession();
  const isAdmin = (authSession.roles ?? []).includes('admin');
  const [user, setUser] = useState<UserView | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [myTasks, setMyTasks] = useState<TaskSummaryView[]>([]);
  const [myProjects, setMyProjects] = useState<ProjectSummaryView[]>([]);
  const [dashboardStats, setDashboardStats] = useState<{ my_tasks_total: number; my_tasks_in_progress: number; my_tasks_done_total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        if (isAdmin) {
          const { user: currentUser, permissions: userPermissions } = await userService.getCurrentUser();
          setUser(currentUser);
          setPermissions(userPermissions);
          setLoading(false);
          return;
        }

        const { user: currentUser, permissions: userPermissions } = await userService.getCurrentUser();
        setUser(currentUser);
        setPermissions(userPermissions);

        const [tasksResponse, projectsResponse, statsResponse] = await Promise.all([
          taskService.list({ assigned_to_user_id: currentUser.id }, { limit: 5 }),
          projectService.listMy({}, { limit: 5 }),
          taskService.getDashboardStats(),
        ]);
        setMyTasks(sortTasksByStatusAndPriority(tasksResponse.items));
        setMyProjects(projectsResponse.items);
        setDashboardStats(statsResponse);
      } catch (err) {
        setError(`Fehler beim Laden des Dashboards: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
        console.error('[Dashboard] Error loading dashboard:', getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getTaskStatusColor = (status: string) => {
    return getStatusColor(status as any);
  };

  if (loading) {
    return (
      <IonContent className="app-page-content ion-padding ion-text-center">
        <div style={{ marginTop: '50%' }}>
          <IonSpinner name="circular" />
          <p>Lädt Dashboard...</p>
        </div>
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent className="app-page-content ion-padding">
        <IonCard color="danger">
          <IonCardContent>
            <IonText color="light">{error}</IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    );
  }

  if (isAdmin) {
    return (
      <IonContent className="app-page-content">
        <div className="page-header">
          <h1 className="page-title">Admin-Übersicht</h1>
          <p className="page-subtitle">Schnellzugriff auf Benutzer, Rollen und Logs</p>
        </div>

        <IonGrid style={{ padding: '0 16px' }}>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard className="app-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={peopleOutline} style={{ marginRight: 8 }} />
                    Benutzer
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Verwalten Sie Nutzer und deren Status.</p>
                  <IonButton routerLink="/app/admin/users" expand="block">Zu den Benutzern</IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonCard className="app-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={shieldOutline} style={{ marginRight: 8 }} />
                    Rollen
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Rollen und Berechtigungen pflegen.</p>
                  <IonButton routerLink="/app/admin/roles" expand="block">Zu den Rollen</IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonCard className="app-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={documentTextOutline} style={{ marginRight: 8 }} />
                    Logs
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>System-Logs einsehen.</p>
                  <IonButton routerLink="/app/admin/logs" expand="block">Logs ansehen</IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content dashboard-content">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-welcome">Willkommen zurück, {user?.name}!</h1>
        <p className="dashboard-subtitle">Hier ist deine Übersicht</p>
      </div>

      {/* Stats Cards */}
      <IonGrid className="dashboard-stats">
        <IonRow>
          <IonCol size="6" sizeMd="3">
            <IonCard className="stat-card">
              <IonCardContent className="stat-card-content">
                <IonIcon icon={checkmarkCircleOutline} className="stat-icon stat-icon-primary" />
                <div className="stat-value">{dashboardStats?.my_tasks_total ?? myTasks.length}</div>
                <div className="stat-label">Meine Aufgaben</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="6" sizeMd="3">
            <IonCard className="stat-card">
              <IonCardContent className="stat-card-content">
                <IonIcon icon={briefcaseOutline} className="stat-icon stat-icon-success" />
                <div className="stat-value">{myProjects.length}</div>
                <div className="stat-label">Meine Projekte</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="6" sizeMd="3">
            <IonCard className="stat-card">
              <IonCardContent className="stat-card-content">
                <IonIcon icon={timeOutline} className="stat-icon stat-icon-warning" />
                <div className="stat-value">{dashboardStats?.my_tasks_in_progress ?? myTasks.filter(t => t.status === 'in_progress').length}</div>
                <div className="stat-label">In Bearbeitung</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="6" sizeMd="3">
            <IonCard className="stat-card">
              <IonCardContent className="stat-card-content">
                <IonIcon icon={ribbonOutline} className="stat-icon stat-icon-tertiary" />
                <div className="stat-value">{dashboardStats?.my_tasks_done_total ?? myTasks.filter(t => t.status === 'done').length}</div>
                <div className="stat-label">Erledigt</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* My Tasks */}
      <IonCard className="dashboard-card">
        <IonCardHeader>
          <IonCardTitle className="dashboard-card-title">
            <IonIcon icon={checkmarkCircleOutline} />
            Meine Aufgaben
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent className="dashboard-card-content">
          {myTasks.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={checkmarkCircleOutline} className="empty-state-icon" />
              <p>Keine Aufgaben zugewiesen</p>
            </div>
          ) : (
            <IonList lines="none" className="dashboard-list">
              {myTasks.map((task) => (
                <IonItem 
                  key={task.id} 
                  routerLink={`/app/tasks/${task.id}`}
                  button
                  detail={false}
                  className="dashboard-list-item"
                >
                  <IonLabel>
                    <h3 className="task-title">{task.title}</h3>
                    <p className="task-meta">
                      <IonChip color={getTaskStatusColor(task.status)} className="task-chip">
                        {getStatusLabel(task.status)}
                      </IonChip>
                      <IonChip color={getPriorityColor(task.priority)} className="task-chip">
                        {getPriorityLabel(task.priority)}
                      </IonChip>
                    </p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          )}
          <IonButton 
            routerLink="/app/tasks/my" 
            expand="block" 
            fill="clear"
            className="dashboard-button"
          >
            Alle meine Aufgaben ansehen
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* My Projects */}
      {permissions['perm_can_read_projects'] && (
        <IonCard className="dashboard-card">
          <IonCardHeader>
            <IonCardTitle className="dashboard-card-title">
              <IonIcon icon={briefcaseOutline} />
              Meine Projekte
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent className="dashboard-card-content">
            {myProjects.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={briefcaseOutline} className="empty-state-icon" />
                <p>Keine Projekte erstellt</p>
              </div>
            ) : (
              <IonList lines="none" className="dashboard-list">
                {myProjects.map((project) => (
                  <IonItem 
                    key={project.id} 
                    routerLink={`/app/project/${project.id}`}
                    button
                    detail={false}
                    className="dashboard-list-item"
                  >
                    <IonLabel>
                      <h3 className="project-title">{project.name}</h3>
                      <p className="project-description">{project.description}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
            <IonButton 
              routerLink="/app/project/list/all" 
              expand="block" 
              fill="clear"
              className="dashboard-button"
            >
              Alle Projekte ansehen
            </IonButton>
          </IonCardContent>
        </IonCard>
      )}
    </IonContent>
  );
};

export default DashboardPage;
