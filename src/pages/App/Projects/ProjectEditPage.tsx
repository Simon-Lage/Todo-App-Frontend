import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { projectService } from '../../../services/projectService';

const ProjectEditPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const history = useHistory();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getById(projectId);
        setName(projectData.name);
        setDescription(projectData.description || '');
      } catch (err) {
        setError('Fehler beim Laden des Projekts');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!name) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setSaving(true);
      await projectService.update(projectId, {
        name,
        description: description || undefined,
      });
      history.push(`/app/project/${projectId}`);
    } catch (err) {
      setError('Fehler beim Speichern des Projekts');
      console.error(err?.message || err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Projekt...</p>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Projekt bearbeiten</h1>
        <p className="page-subtitle">Ändern Sie die Projektdetails</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Projektdetails</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Name *</IonLabel>
              <IonInput
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
                placeholder="Projektname"
                className="app-form-input"
                required
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Beschreibung</IonLabel>
              <IonTextarea
                value={description}
                onIonInput={(e) => setDescription(e.detail.value!)}
                placeholder="Projektbeschreibung"
                rows={4}
                className="app-form-textarea"
              />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={saving}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {saving ? 'Speichert...' : 'Änderungen speichern'}
        </IonButton>

        <IonButton
          routerLink={`/app/project/${projectId}`}
          expand="block"
          fill="outline"
          className="app-button-secondary"
        >
          <IonIcon slot="start" icon={closeOutline} />
          Abbrechen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default ProjectEditPage;
