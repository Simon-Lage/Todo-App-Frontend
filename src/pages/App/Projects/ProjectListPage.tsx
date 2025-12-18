import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
} from '@ionic/react';
import { addOutline, briefcaseOutline } from 'ionicons/icons';
import { projectService } from '../../../services/projectService';
import PaginationControls from '../../../components/PaginationControls';
import type { ProjectSummaryView } from '../../../types/api';
import { useAuthSession } from '../../../routing/useAuthSession';
import { getErrorMessage } from '../../../utils/errorUtils';
import { useLocation } from 'react-router-dom';

const ProjectListPage: React.FC = () => {
  const { authSession } = useAuthSession();
  const location = useLocation();
  const [projects, setProjects] = useState<ProjectSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const canCreate = Boolean(authSession.permissions?.['perm_can_create_projects']);
  const isMyList = location.pathname.includes('/project/list/my');

  useEffect(() => {
    loadProjects();
  }, [offset, searchText]);

  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [searchText]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchText) {
        filters.q = searchText;
      }

      const response = isMyList
        ? await projectService.listMy(filters, { offset, limit, sort_by: 'created_at', direction: 'desc' })
        : await projectService.list(filters, { offset, limit, sort_by: 'created_at', direction: 'desc' });
      setProjects(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Fehler beim Laden der Projekte');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadProjects();
    event.detail.complete();
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Projekte...</p>
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
        <h1 className="page-title">Projekte</h1>
        <p className="page-subtitle">{total} Projekt{total !== 1 ? 'e' : ''} verfügbar</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Projekte durchsuchen..."
          className="app-searchbar"
          debounce={300}
        />
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <IonIcon icon={briefcaseOutline} className="empty-state-icon" />
          <p>Keine Projekte gefunden</p>
        </div>
      ) : (
        <>
          <IonList className="app-list" style={{ padding: '0 16px' }}>
            {projects.map((project) => (
              <IonItem 
                key={project.id} 
                routerLink={`/app/project/${project.id}`}
                button
                detail={false}
                className="app-list-item"
              >
                <IonIcon icon={briefcaseOutline} slot="start" color="primary" style={{ fontSize: '28px' }} />
                <IonLabel>
                  <h3>{project.name}</h3>
                  <p>{project.description || 'Keine Beschreibung'}</p>
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
            routerLink="/app/project/create" 
            expand="block"
            className="app-button"
          >
            <IonIcon slot="start" icon={addOutline} />
            Neues Projekt erstellen
          </IonButton>
        </div>
      )}
    </IonContent>
  );
};

export default ProjectListPage;
