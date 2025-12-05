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
import type { ProjectSummaryView } from '../../../types/api';

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummaryView[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSummaryView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchText]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.list({}, { limit: 100 });
      setProjects(response.items);
    } catch (err) {
      setError('Fehler beim Laden der Projekte');
      console.error(err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    setFilteredProjects(filtered);
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
        <p className="page-subtitle">{projects.length} Projekt{projects.length !== 1 ? 'e' : ''} verfügbar</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Projekte durchsuchen..."
          className="app-searchbar"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <IonIcon icon={briefcaseOutline} className="empty-state-icon" />
          <p>Keine Projekte gefunden</p>
        </div>
      ) : (
        <IonList className="app-list" style={{ padding: '0 16px' }}>
          {filteredProjects.map((project) => (
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
      )}

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
    </IonContent>
  );
};

export default ProjectListPage;
