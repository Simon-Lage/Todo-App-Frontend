import React, { useEffect, useMemo, useState } from 'react';
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
} from '@ionic/react';
import { addOutline, personOutline } from 'ionicons/icons';
import PaginationControls from '../../../components/PaginationControls';
import { taskService } from '../../../services/taskService';
import { userService } from '../../../services/userService';
import { useAuthSession } from '../../../routing/useAuthSession';
import type { TaskFilters, TaskStatus, TaskSummaryView, UserListView } from '../../../types/api';
import { getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from '../../../utils/taskUtils';
import AssigneeAvatarGroup from '../../../components/AssigneeAvatarGroup';
import { getErrorMessage } from '../../../utils/errorUtils';

const USER_LIMIT = 200;

const LeadTeamTasksPage: React.FC = () => {
  const { authSession } = useAuthSession();
  const canCreate = Boolean(authSession.permissions?.['perm_can_create_tasks']);

  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [users, setUsers] = useState<UserListView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('in_progress');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const selectedUser = useMemo(() => users.find((u) => u.id === selectedUserId) ?? null, [users, selectedUserId]);

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [offset, statusFilter, searchText, selectedUserId]);

  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [statusFilter, searchText, selectedUserId]);

  const loadUsers = async () => {
    try {
      const response = await userService.list(
        { active: true },
        { limit: USER_LIMIT, offset: 0, sort_by: 'name', direction: 'asc' }
      );
      setUsers(response.items);
    } catch (err) {
      console.error(getErrorMessage(err));
      setUsers([]);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: TaskFilters = {};

      if (statusFilter !== 'all') {
        filters.status = statusFilter as TaskStatus;
      }

      if (searchText) {
        filters.q = searchText;
      }

      if (selectedUserId) {
        filters.assigned_to_user_id = selectedUserId;
      }

      const response = await taskService.list(filters, { offset, limit, sort_by: 'status', direction: 'desc' });
      setTasks(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Fehler beim Laden der Team-Aufgaben');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Team-Aufgaben...</p>
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
        <h1 className="page-title">Team-Aufgaben</h1>
        <p className="page-subtitle">
          {selectedUser ? `${selectedUser.name} • ` : ''}
          {total} Aufgabe{total !== 1 ? 'n' : ''} gesamt
        </p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value ?? '')}
          placeholder="Aufgaben durchsuchen..."
          className="app-searchbar"
          debounce={300}
        />

        <IonItem lines="none" style={{ marginTop: '12px', borderRadius: '12px' }}>
          <IonLabel>Mitarbeiter</IonLabel>
          <IonSelect
            value={selectedUserId}
            placeholder="Alle"
            onIonChange={(e) => setSelectedUserId((e.detail.value as string) ?? '')}
            interface="popover"
          >
            <IonSelectOption value="">Alle</IonSelectOption>
            {users.map((user) => (
              <IonSelectOption key={user.id} value={user.id}>
                {user.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonSegment
          value={statusFilter}
          onIonChange={(e) => setStatusFilter(e.detail.value as string)}
          style={{ marginTop: '12px' }}
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
                    {task.assigned_user_ids.length > 0 ? (
                      <IonText
                        color="medium"
                        style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <IonIcon icon={personOutline} style={{ fontSize: '14px' }} />
                        {task.assigned_user_ids.length === 1
                          ? task.assigned_users?.[0]?.name || 'Unbekannt'
                          : `${task.assigned_user_ids.length} Personen`}
                        <AssigneeAvatarGroup users={task.assigned_users} />
                      </IonText>
                    ) : null}
                  </div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>

          <PaginationControls offset={offset} limit={limit} total={total} onPageChange={handlePageChange} />
        </>
      )}

      {canCreate ? (
        <div style={{ padding: '16px' }}>
          <IonButton routerLink="/app/tasks/create" expand="block" className="app-button">
            <IonIcon slot="start" icon={addOutline} />
            Neue Aufgabe erstellen
          </IonButton>
        </div>
      ) : null}
    </IonContent>
  );
};

export default LeadTeamTasksPage;
