import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonIcon, IonList } from '@ionic/react';
import { arrowBackOutline, documentTextOutline } from 'ionicons/icons';
import { logService } from '../../../../services/logService';
import type { LogView } from '../../../../types/api';
import { getErrorMessage } from '../../../../utils/errorUtils';
import { formatLogAction } from '../../../../utils/logUtils';
import CopyButton from '../../../../components/CopyButton';

const AdminLogDetailsPage: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<LogView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('de-DE');
  };

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
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [logId]);

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Log...</p>
        </div>
      </IonContent>
    );
  }

  if (error || !log) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Log nicht gefunden'}</div>
      </IonContent>
    );
  }

	  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Log-Details</h1>
        <p className="page-subtitle">{formatLogAction(log.action)}</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={documentTextOutline} style={{ marginRight: '8px' }} />
            {formatLogAction(log.action)}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Log-ID</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{log.id}</span>
                  <CopyButton value={log.id} label="Log-ID" />
                </p>
              </IonLabel>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Zeitpunkt</h3>
                <p>{formatDateTime(log.performed_at)}</p>
              </IonLabel>
            </IonItem>

            {log.performed_by_user_id && (
              <IonItem className="app-form-item">
                <IonLabel>
                  <h3>Benutzer-ID</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{log.performed_by_user_id}</span>
                    <CopyButton value={log.performed_by_user_id} label="Benutzer-ID" />
                  </p>
                </IonLabel>
              </IonItem>
            )}

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Details</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', marginTop: '8px', padding: '8px', backgroundColor: 'var(--ion-color-light)', borderRadius: '4px', color: 'var(--ion-color-dark)' }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </IonLabel>
            </IonItem>
          </IonList>

          <div style={{ marginTop: '16px' }}>
            <IonButton routerLink="/app/admin/logs" expand="block" fill="outline" className="app-button-secondary">
              <IonIcon slot="start" icon={arrowBackOutline} />
              Zurück zur Liste
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default AdminLogDetailsPage;

