import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonInput, IonTextarea, IonButton, IonItem, IonLabel, IonSpinner } from '@ionic/react';
import { projectService } from '../../../services/projectService';

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
      console.error(err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Neues Projekt erstellen</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonItem>
          <IonLabel position="stacked">Name *</IonLabel>
          <IonInput value={name} onIonInput={(e) => setName(e.detail.value!)} placeholder="Projektname" />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Beschreibung</IonLabel>
          <IonTextarea value={description} onIonInput={(e) => setDescription(e.detail.value!)} placeholder="Projektbeschreibung" />
        </IonItem>

        <IonButton onClick={handleSubmit} expand="block" disabled={loading}>
          {loading ? <IonSpinner /> : 'Projekt erstellen'}
        </IonButton>

        <IonButton routerLink="/app/project" expand="block" fill="outline">
          Abbrechen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProjectCreatePage;

