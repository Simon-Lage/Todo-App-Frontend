import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonText, IonSpinner, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { projectService } from '../../../services/projectService';
import { userCacheService } from '../../../services/userCacheService';
import type { TaskSummaryView, UserListView } from '../../../types/api';
import { getErrorMessage } from '../../../utils/errorUtils';

const ProjectTeamPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [teamMembers, setTeamMembers] = useState<Map<string, UserListView>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        setLoading(true);
        const tasksResponse = await projectService.getTasks(projectId, {}, { limit: 200 });
        setTasks(tasksResponse.items);

        const uniqueUserIds = new Set<string>();
        tasksResponse.items.forEach(task => {
          task.assigned_user_ids.forEach(userId => uniqueUserIds.add(userId));
        });

        const usersMap = await userCacheService.getUsersByIds(Array.from(uniqueUserIds));
        setTeamMembers(usersMap);
      } catch (err) {
        setError('Fehler beim Laden des Teams');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [projectId]);

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Team...</p>
        </div>
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Projekt-Team</h1>
        <p className="page-subtitle">{teamMembers.size} Team-Mitglied{teamMembers.size !== 1 ? 'er' : ''}</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Team-Mitglieder</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {teamMembers.size === 0 ? (
            <div className="empty-state">
              <p>Keine Team-Mitglieder gefunden</p>
            </div>
          ) : (
            <IonList className="app-list" style={{ padding: '0 16px' }}>
              {Array.from(teamMembers.values()).map((user) => {
                const userTaskCount = tasks.filter(task => 
                  task.assigned_user_ids.includes(user.id)
                ).length;

                return (
                  <IonItem key={user.id} className="app-list-item">
                    <IonLabel>
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <p style={{ marginTop: '4px', fontSize: '14px', color: 'var(--ion-color-step-600)' }}>
                        {userTaskCount} Aufgabe{userTaskCount !== 1 ? 'n' : ''} zugewiesen
                      </p>
                    </IonLabel>
                  </IonItem>
                );
              })}
            </IonList>
          )}
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default ProjectTeamPage;

