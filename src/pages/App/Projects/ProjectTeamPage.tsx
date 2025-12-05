import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonList, IonItem, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { projectService } from '../../../services/projectService';
import { userService } from '../../../services/userService';
import type { TaskSummaryView, UserListView } from '../../../types/api';

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

        const usersMap = new Map<string, UserListView>();
        for (const userId of uniqueUserIds) {
          try {
            const user = await userService.getById(userId);
            usersMap.set(userId, {
              id: user.id,
              name: user.name,
              email: user.email,
              active: user.active,
              created_at: user.created_at,
              last_login_at: user.last_login_at,
            });
          } catch (err) {
            console.error(`Fehler beim Laden von Benutzer ${userId}`, err);
          }
        }
        setTeamMembers(usersMap);
      } catch (err) {
        setError('Fehler beim Laden des Teams');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
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
          <h1>Projekt-Team</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Team-Mitglieder ({teamMembers.size})</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {teamMembers.size === 0 ? (
              <IonText>Keine Team-Mitglieder gefunden</IonText>
            ) : (
              <IonList>
                {Array.from(teamMembers.values()).map((user) => {
                  const userTaskCount = tasks.filter(task => 
                    task.assigned_user_ids.includes(user.id)
                  ).length;

                  return (
                    <IonItem key={user.id}>
                      <IonLabel>
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        <p>{userTaskCount} Aufgabe(n) zugewiesen</p>
                      </IonLabel>
                    </IonItem>
                  );
                })}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ProjectTeamPage;

