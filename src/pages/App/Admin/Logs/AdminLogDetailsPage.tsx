import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel } from '@ionic/react';
import { logService } from '../../../../services/logService';
import type { LogView } from '../../../../types/api';

const AdminLogDetailsPage: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<LogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLog = async () => {
      if (!logId) {
        setError('Keine Log-ID angegeben');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const logData = await logService.getById(logId);
        setLog(logData);
      } catch (err) {
        setError('Fehler beim Laden des Logs');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [logId]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !log) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error || 'Log nicht gefunden'}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Log-Details</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{log.event}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>Zeitpunkt</IonLabel>
              <IonText>{new Date(log.created_at).toLocaleString()}</IonText>
            </IonItem>

            {log.actor_user_id && (
              <IonItem>
                <IonLabel>Benutzer-ID</IonLabel>
                <IonText>{log.actor_user_id}</IonText>
              </IonItem>
            )}

            <IonItem>
              <IonLabel>Kontext</IonLabel>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {JSON.stringify(log.context, null, 2)}
              </pre>
            </IonItem>

            <IonButton routerLink="/app/admin/logs" expand="block" fill="outline">
              Zurück zur Liste
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminLogDetailsPage;

