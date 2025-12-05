import React, { useState } from 'react';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
} from '@ionic/react';
import { lockClosedOutline, keyOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { userService } from '../../../services/userService';

const AccountSecurityPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async () => {
    if (!userId) {
      setError('Bitte geben Sie Ihre Benutzer-ID ein');
      return;
    }

    try {
      setRequesting(true);
      setError(null);
      await userService.requestPasswordReset(userId);
      setSuccess(true);
    } catch (err) {
      setError('Fehler beim Anfordern des Passwort-Resets');
      console.error(err?.message || err);
    } finally {
      setRequesting(false);
    }
  };

  if (success) {
    return (
      <IonContent className="app-page-content">
        <div className="page-header">
          <h1 className="page-title">Sicherheit</h1>
          <p className="page-subtitle">Verwalten Sie Ihre Sicherheitseinstellungen</p>
        </div>

        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <IonIcon 
            icon={shieldCheckmarkOutline} 
            style={{ fontSize: '80px', color: 'var(--ion-color-success)', marginBottom: '20px' }} 
          />
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
            Anfrage gesendet!
          </h2>
          <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '24px' }}>
            Überprüfen Sie Ihre E-Mail für weitere Anweisungen zum Zurücksetzen Ihres Passworts.
          </p>
          <IonButton routerLink="/app/dashboard" expand="block" style={{ maxWidth: '300px', margin: '0 auto' }}>
            Zum Dashboard
          </IonButton>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Sicherheit</h1>
        <p className="page-subtitle">Verwalten Sie Ihre Sicherheitseinstellungen</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={lockClosedOutline} style={{ marginRight: '8px' }} />
            Passwort zurücksetzen
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="medium" style={{ display: 'block', marginBottom: '20px', fontSize: '14px' }}>
            Fordern Sie einen Passwort-Reset an. Sie erhalten eine E-Mail mit weiteren Anweisungen.
          </IonText>

          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">
                <IonIcon icon={keyOutline} style={{ marginRight: '8px' }} />
                Benutzer-ID
              </IonLabel>
              <IonInput
                value={userId}
                onIonInput={(e) => setUserId(e.detail.value!)}
                placeholder="Ihre Benutzer-ID"
                className="app-form-input"
                required
              />
            </IonItem>
          </IonList>

          <IonButton
            expand="block"
            onClick={handleRequestReset}
            disabled={requesting}
            className="app-button"
            style={{ marginTop: '20px' }}
          >
            <IonIcon slot="start" icon={lockClosedOutline} />
            {requesting ? 'Wird angefordert...' : 'Passwort-Reset anfordern'}
          </IonButton>
        </IonCardContent>
      </IonCard>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Sicherheitstipps</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <ul style={{ paddingLeft: '20px', margin: 0, lineHeight: '1.8' }}>
            <li>Verwenden Sie ein starkes, einzigartiges Passwort</li>
            <li>Ändern Sie Ihr Passwort regelmäßig</li>
            <li>Teilen Sie Ihr Passwort niemals mit anderen</li>
            <li>Melden Sie sich von Geräten ab, die Sie nicht mehr nutzen</li>
          </ul>
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default AccountSecurityPage;
