import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonBadge,
} from '@ionic/react';
import { addOutline, filterOutline } from 'ionicons/icons';
import { taskService } from '../../../services/taskService';
import { userService } from '../../../services/userService';
import type { TaskSummaryView, TaskStatus } from '../../../types/api';

const TaskMyListPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchText, statusFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { user } = await userService.getCurrentUser();
      const response = await taskService.list({ assigned_to_user_id: user.id }, { limit: 100 });
      setTasks(response.items);
    } catch (err) {
      setError('Fehler beim Laden der Aufgaben');
      console.error(err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }

    setFilteredTasks(filtered);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadTasks();
    event.detail.complete();
  };

  const getStatusColor = (status: TaskStatus) => {
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

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'open': return 'Offen';
      case 'in_progress': return 'In Arbeit';
      case 'review': return 'Review';
      case 'done': return 'Erledigt';
      case 'cancelled': return 'Abgebrochen';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend';
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      case 'low': return 'Niedrig';
      default: return priority;
    }
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Aufgaben...</p>
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
        <h1 className="page-title">Meine Aufgaben</h1>
        <p className="page-subtitle">{tasks.length} Aufgabe{tasks.length !== 1 ? 'n' : ''} zugewiesen</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Aufgaben durchsuchen..."
          className="app-searchbar"
        />

        <IonSegment 
          value={statusFilter} 
          onIonChange={(e) => setStatusFilter(e.detail.value as string)}
          style={{ marginTop: '12px' }}
        >
          <IonSegmentButton value="all">
            <IonLabel>Alle</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="open">
            <IonLabel>Offen</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="in_progress">
            <IonLabel>In Arbeit</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="done">
            <IonLabel>Erledigt</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>Keine Aufgaben gefunden</p>
        </div>
      ) : (
        <IonList className="app-list" style={{ padding: '0 16px' }}>
          {filteredTasks.map((task) => (
            <IonItem 
              key={task.id} 
              routerLink={`/app/tasks/${task.id}`}
              button
              detail={false}
              className="app-list-item"
            >
              <IonLabel>
                <h3>{task.title}</h3>
                <p style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <IonChip color={getStatusColor(task.status)} className="app-chip">
                    {getStatusLabel(task.status)}
                  </IonChip>
                  <IonChip color={getPriorityColor(task.priority)} className="app-chip">
                    {getPriorityLabel(task.priority)}
                  </IonChip>
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}

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
    </IonContent>
  );
};

export default TaskMyListPage;
