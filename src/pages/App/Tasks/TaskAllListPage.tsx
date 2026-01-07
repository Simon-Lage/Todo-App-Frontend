import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/react';
import { personOutline } from 'ionicons/icons';
import { addOutline } from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import { getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '../../../utils/taskUtils';
import PaginationControls from '../../../components/PaginationControls';
import type { TaskSummaryView, TaskStatus } from '../../../types/api';
import { useAuthSession } from '../../../routing/useAuthSession';
import AssigneeAvatarGroup from '../../../components/AssigneeAvatarGroup';
import { getErrorMessage } from '../../../utils/errorUtils';

const TaskAllListPage: React.FC = () => {
  const { authSession } = useAuthSession();
  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('in_progress');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const canCreate = Boolean(authSession.permissions?.['perm_can_create_tasks']);

  useEffect(() => {
    loadTasks();
  }, [offset, statusFilter, searchText]);

  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [statusFilter, searchText]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter as TaskStatus;
      }
      
      if (searchText) {
        filters.q = searchText;
      }

      const response = await taskService.list(filters, { offset, limit, sort_by: 'status', direction: 'desc' });
      const validUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
      const validTasks = response.items.filter((t) => t.id && validUuid.test(t.id));
      setTasks(validTasks);
      setTotal(response.total);
    } catch (err) {
      setError('Fehler beim Laden der Aufgaben');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadTasks();
    event.detail.complete();
  };


  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade alle Aufgaben...</p>
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
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <div className="page-header">
        <h1 className="page-title">Alle Aufgaben</h1>
        <p className="page-subtitle">{total} Aufgabe{total !== 1 ? 'n' : ''} gesamt</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Aufgaben durchsuchen..."
          className="app-searchbar"
          debounce={300}
        />

        <IonSegment 
          value={statusFilter} 
          onIonChange={(e) => setStatusFilter(e.detail.value as string)}
          style={{ marginTop: '12px' }}
          mode="ios"
        >
          <IonSegmentButton value="open">
            <IonLabel>Offen</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="in_progress">
            <IonLabel>In Arbeit</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="done">
            <IonLabel>Erledigt</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="all">
            <IonLabel>Alle</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>Keine Aufgaben gefunden</p>
        </div>
      ) : (
        <>
          <IonList className="app-list" style={{ padding: '0 16px' }}>
            {tasks.map((task) => (
              <IonItem 
                key={task.id} 
                routerLink={`/app/tasks/${task.id}`}
                button
                detail={false}
                className={`app-list-item task-card status-${task.status}`}
              >
                <IonLabel>
                  <h3>{task.title}</h3>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <IonChip color={getStatusColor(task.status)} className="app-chip">
                      {getStatusLabel(task.status)}
                    </IonChip>
                    <IonChip color={getPriorityColor(task.priority)} className="app-chip">
                      {getPriorityLabel(task.priority)}
                    </IonChip>
                    {task.assigned_user_ids.length > 0 && (
                      <IonText color="medium" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IonIcon icon={personOutline} style={{ fontSize: '14px' }} />
                        {task.assigned_user_ids.length === 1 
                          ? (task.assigned_users?.[0]?.name || 'Unbekannt')
                          : `${task.assigned_user_ids.length} Personen`
                        }
                        <AssigneeAvatarGroup users={task.assigned_users} />
                      </IonText>
                    )}
                  </div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
          <PaginationControls
            offset={offset}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {canCreate && (
        <div style={{ padding: '16px' }}>
          <IonButton 
            routerLink="/app/tasks/create" 
            expand="block"
            className="app-button"
          >
            <IonIcon slot="start" icon={addOutline} />
            Neue Aufgabe erstellen
          </IonButton>
        </div>
      )}
    </IonContent>
  );
};

export default TaskAllListPage;
