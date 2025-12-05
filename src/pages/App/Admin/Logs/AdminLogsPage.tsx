import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonText, IonSpinner, IonList, IonItem, IonLabel, IonSearchbar } from '@ionic/react';
import { logService } from '../../../../services/logService';
import type { LogView } from '../../../../types/api';

const AdminLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const response = await logService.list(
          { q: searchText || undefined },
          { limit: 100 }
        );
        setLogs(response.items);
      } catch (err) {
        setError('Fehler beim Laden der Logs');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [searchText]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>System-Logs</h1>
        </IonText>

        <IonSearchbar value={searchText} onIonInput={(e) => setSearchText(e.detail.value!)} placeholder="Logs durchsuchen" />

        {logs.length === 0 ? (
          <IonText>Keine Logs gefunden</IonText>
        ) : (
          <IonList>
            {logs.map((log) => (
              <IonItem key={log.id} routerLink={`/app/admin/logs/${log.id}`}>
                <IonLabel>
                  <h2>{log.event}</h2>
                  <p>{new Date(log.created_at).toLocaleString()}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminLogsPage;

