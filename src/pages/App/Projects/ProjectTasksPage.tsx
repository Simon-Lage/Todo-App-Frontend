import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonText, IonSpinner, IonList, IonItem, IonLabel, IonChip, IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption } from '@ionic/react';
import { addOutline, arrowBackOutline } from 'ionicons/icons';
import { projectService } from '../../../services/projectService';
import { getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '../../../utils/taskUtils';
import PaginationControls from '../../../components/PaginationControls';
import type { TaskSummaryView, TaskStatus, TaskPriority } from '../../../types/api';
import { getErrorMessage } from '../../../utils/errorUtils';
import AssigneeAvatarGroup from '../../../components/AssigneeAvatarGroup';
import { personOutline } from 'ionicons/icons';

const ProjectTasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadTasks();
  }, [projectId, offset, searchText, statusFilter, priorityFilter]);

  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [searchText, statusFilter, priorityFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (priorityFilter) {
        filters.priority = priorityFilter;
      }
      
      if (searchText) {
        filters.q = searchText;
      }

      const response = await projectService.getTasks(
        projectId,
        filters,
        { offset, limit, sort_by: 'status', direction: 'desc' }
      );
      setTasks(response.items);
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
      <div className="page-header">
        <h1 className="page-title">Projekt-Aufgaben</h1>
        <p className="page-subtitle">{total} Aufgabe{total !== 1 ? 'n' : ''} in diesem Projekt</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar 
          value={searchText} 
          onIonInput={(e) => setSearchText(e.detail.value!)} 
          placeholder="Aufgaben durchsuchen..."
          className="app-searchbar"
          debounce={300}
        />

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <IonSelect 
            value={statusFilter} 
            onIonChange={(e) => setStatusFilter(e.detail.value)} 
            placeholder="Status filtern"
            interface="action-sheet"
            style={{ flex: 1 }}
          >
            <IonSelectOption value="">Alle</IonSelectOption>
            <IonSelectOption value="open">Offen</IonSelectOption>
            <IonSelectOption value="in_progress">In Bearbeitung</IonSelectOption>
            <IonSelectOption value="review">Review</IonSelectOption>
            <IonSelectOption value="done">Erledigt</IonSelectOption>
            <IonSelectOption value="cancelled">Abgebrochen</IonSelectOption>
          </IonSelect>

          <IonSelect 
            value={priorityFilter} 
            onIonChange={(e) => setPriorityFilter(e.detail.value)} 
            placeholder="Priorität filtern"
            interface="action-sheet"
            style={{ flex: 1 }}
          >
            <IonSelectOption value="">Alle</IonSelectOption>
            <IonSelectOption value="low">Niedrig</IonSelectOption>
            <IonSelectOption value="medium">Mittel</IonSelectOption>
            <IonSelectOption value="high">Hoch</IonSelectOption>
            <IonSelectOption value="urgent">Dringend</IonSelectOption>
          </IonSelect>
        </div>
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
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <IonChip color={getStatusColor(task.status)} className="app-chip">
                      {getStatusLabel(task.status)}
                    </IonChip>
                    <IonChip color={getPriorityColor(task.priority)} className="app-chip">
                      {getPriorityLabel(task.priority)}
                    </IonChip>
                    {task.assigned_user_ids.length > 0 ? (
                      <IonText color="medium" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IonIcon icon={personOutline} style={{ fontSize: '14px' }} />
                        {task.assigned_user_ids.length === 1
                          ? (task.assigned_users?.[0]?.name || 'Unbekannt')
                          : `${task.assigned_user_ids.length} Personen`}
                        <AssigneeAvatarGroup users={task.assigned_users} />
                      </IonText>
                    ) : null}
                    {task.due_date && (
                      <IonText color="medium" style={{ fontSize: '14px' }}>
                        Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
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

      <div style={{ padding: '16px' }}>
        <IonButton 
          routerLink={`/app/project/${projectId}/tasks/create`} 
          expand="block"
          className="app-button"
        >
          <IonIcon slot="start" icon={addOutline} />
          Neue Aufgabe erstellen
        </IonButton>

        <IonButton 
          routerLink={`/app/project/${projectId}`} 
          expand="block" 
          fill="outline"
          className="app-button-secondary"
          style={{ marginTop: '8px' }}
        >
          <IonIcon slot="start" icon={arrowBackOutline} />
          Zurück zum Projekt
        </IonButton>
      </div>
    </IonContent>
  );
};

export default ProjectTasksPage;

