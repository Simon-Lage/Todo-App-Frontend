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
} from 'ionicons/icons';
import { userService } from '../../../services/userService';
import { taskService } from '../../../services/taskService';
import { projectService } from '../../../services/projectService';
import type { UserView, TaskSummaryView, ProjectSummaryView } from '../../../types/api';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserView | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [myTasks, setMyTasks] = useState<TaskSummaryView[]>([]);
  const [myProjects, setMyProjects] = useState<ProjectSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const { user: currentUser, permissions: userPermissions } = await userService.getCurrentUser();
        setUser(currentUser);
        
        // userPermissions ist bereits ein Record<string, boolean>
        setPermissions(userPermissions);

        const tasksResponse = await taskService.list({ assigned_to_user_id: currentUser.id }, { limit: 5 });
        setMyTasks(tasksResponse.items);

        const projectsResponse = await projectService.list({ created_by_user_id: currentUser.id }, { limit: 5 });
        setMyProjects(projectsResponse.items);
      } catch (err) {
        setError(`Fehler beim Laden des Dashboards: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
        console.error('[Dashboard] Error loading dashboard:', err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'primary';
      case 'in_progress': return 'warning';
      case 'review': return 'tertiary';
      case 'done': return 'success';
      case 'cancelled': return 'medium';
      default: return 'medium';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'medium';
      default: return 'medium';
    }
  };

  if (loading) {
    return (
      <IonContent className="ion-padding ion-text-center">
        <div style={{ marginTop: '50%' }}>
          <IonSpinner name="circular" />
          <p>Lädt Dashboard...</p>
        </div>
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent className="ion-padding">
        <IonCard color="danger">
          <IonCardContent>
            <IonText color="light">{error}</IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    );
  }

  return (
    <IonContent className="dashboard-content">
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
                <div className="stat-value">{myTasks.length}</div>
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
                <div className="stat-value">{myTasks.filter(t => t.status === 'in_progress').length}</div>
                <div className="stat-label">In Bearbeitung</div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="6" sizeMd="3">
            <IonCard className="stat-card">
              <IonCardContent className="stat-card-content">
                <IonIcon icon={ribbonOutline} className="stat-icon stat-icon-tertiary" />
                <div className="stat-value">{myTasks.filter(t => t.status === 'done').length}</div>
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
                        {task.status}
                      </IonChip>
                      <IonChip color={getPriorityColor(task.priority)} className="task-chip">
                        {task.priority}
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
