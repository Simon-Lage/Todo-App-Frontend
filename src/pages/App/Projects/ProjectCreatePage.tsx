import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonText, IonInput, IonTextarea, IonButton, IonItem, IonLabel, IonSpinner, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList } from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { projectService } from '../../../services/projectService';
import { getErrorMessage } from '../../../utils/errorUtils';

const ProjectCreatePage: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name) {
      setError('Name ist ein Pflichtfeld');
      return;
    }

    try {
      setLoading(true);
      const project = await projectService.create({
        name,
        description: description || undefined,
      });
      history.push(`/app/project/${project.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen des Projekts');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Neues Projekt</h1>
        <p className="page-subtitle">Erstellen Sie ein neues Projekt</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

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
                className="app-form-input"
                rows={4}
              />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={loading}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {loading ? 'Erstellt...' : 'Projekt erstellen'}
        </IonButton>

        <IonButton
          routerLink="/app/project"
          expand="block"
          fill="outline"
          className="app-button-secondary"
          style={{ marginTop: '8px' }}
        >
          <IonIcon slot="start" icon={closeOutline} />
          Abbrechen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default ProjectCreatePage;

