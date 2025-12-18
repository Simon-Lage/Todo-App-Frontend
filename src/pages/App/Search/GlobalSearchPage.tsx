import React, { useState } from 'react';
import {
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonIcon,
  IonSpinner,
  IonChip,
} from '@ionic/react';
import { checkmarkCircleOutline, briefcaseOutline, personOutline, searchOutline } from 'ionicons/icons';
import { searchService } from '../../../services/searchService';
import type { TaskSummaryView, ProjectSummaryView, UserListView } from '../../../types/api';
import { getErrorMessage } from '../../../utils/errorUtils';

type SearchResults = {
  tasks: TaskSummaryView[];
  projects: ProjectSummaryView[];
  users: UserListView[];
};

const GlobalSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState<'all' | 'task' | 'project' | 'user'>('all');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults(null);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchService.searchAll(searchQuery);
      setResults(searchResults);
      setSearched(true);
    } catch (err) {
      console.error('Suchfehler:', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    if (!results) return { tasks: [], projects: [], users: [] };

    switch (entityType) {
      case 'task':
        return { tasks: results.tasks, projects: [], users: [] };
      case 'project':
        return { tasks: [], projects: results.projects, users: [] };
      case 'user':
        return { tasks: [], projects: [], users: results.users };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const totalResults = (filteredResults.tasks?.length || 0) + 
                       (filteredResults.projects?.length || 0) + 
                       (filteredResults.users?.length || 0);

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Suche</h1>
        <p className="page-subtitle">Durchsuchen Sie Aufgaben, Projekte und Benutzer</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={query}
          onIonInput={(e) => {
            const value = e.detail.value!;
            setQuery(value);
            handleSearch(value);
          }}
          placeholder="Suche nach Aufgaben, Projekten, Benutzern..."
          className="app-searchbar"
          debounce={500}
        />

        <IonSegment 
          value={entityType} 
          onIonChange={(e) => setEntityType(e.detail.value as any)}
          style={{ marginTop: '12px' }}
        >
          <IonSegmentButton value="all">
            <IonLabel>Alle</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="task">
            <IonLabel>Aufgaben</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="project">
            <IonLabel>Projekte</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="user">
            <IonLabel>Benutzer</IonLabel>
          </IonSegmentButton>
        </IonSegment>
      </div>

      {loading && (
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Suche läuft...</p>
        </div>
      )}

      {!loading && searched && totalResults === 0 && (
        <div className="empty-state">
          <IonIcon icon={searchOutline} className="empty-state-icon" />
          <p>Keine Ergebnisse für "{query}"</p>
        </div>
      )}

      {!loading && !searched && !query && (
        <div className="empty-state">
          <IonIcon icon={searchOutline} className="empty-state-icon" />
          <p>Geben Sie einen Suchbegriff ein</p>
        </div>
      )}

      {!loading && searched && totalResults > 0 && (
        <>
          {filteredResults.tasks && filteredResults.tasks.length > 0 && (
            <IonCard className="app-card">
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={checkmarkCircleOutline} />
                  Aufgaben ({filteredResults.tasks.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList className="app-list">
                  {filteredResults.tasks.map((task) => (
                    <IonItem 
                      key={task.id} 
                      routerLink={`/app/tasks/${task.id}`}
                      button
                      detail={false}
                      className="app-list-item"
                    >
                      <IonIcon icon={checkmarkCircleOutline} slot="start" color="primary" />
                      <IonLabel>
                        <h3>{task.title}</h3>
                        <p>
                          <IonChip className="app-chip" color="primary">{task.status}</IonChip>
                          <IonChip className="app-chip" color="secondary">{task.priority}</IonChip>
                        </p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}

          {filteredResults.projects && filteredResults.projects.length > 0 && (
            <IonCard className="app-card">
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={briefcaseOutline} />
                  Projekte ({filteredResults.projects.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList className="app-list">
                  {filteredResults.projects.map((project) => (
                    <IonItem 
                      key={project.id} 
                      routerLink={`/app/project/${project.id}`}
                      button
                      detail={false}
                      className="app-list-item"
                    >
                      <IonIcon icon={briefcaseOutline} slot="start" color="secondary" />
                      <IonLabel>
                        <h3>{project.name}</h3>
                        <p>{project.description || 'Keine Beschreibung'}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}

          {filteredResults.users && filteredResults.users.length > 0 && (
            <IonCard className="app-card">
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={personOutline} />
                  Benutzer ({filteredResults.users.length})
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList className="app-list">
                  {filteredResults.users.map((user) => (
                    <IonItem 
                      key={user.id} 
                      routerLink={`/app/admin/users/${user.id}`}
                      button
                      detail={false}
                      className="app-list-item"
                    >
                      <IonIcon icon={personOutline} slot="start" color="tertiary" />
                      <IonLabel>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </>
      )}
    </IonContent>
  );
};

export default GlobalSearchPage;
