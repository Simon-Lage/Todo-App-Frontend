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
import { lockClosedOutline, keyOutline, shieldCheckmarkOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { userService } from '../../../services/userService';
import { authService } from '../../../services/authService';
import { toastService } from '../../../services/toastService';
import { getErrorMessage } from '../../../utils/errorUtils';

const AccountSecurityPage: React.FC = () => {
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  const handleRequestReset = async () => {
    try {
      setRequesting(true);
      await userService.resetPasswordSelf();
      setSuccess(true);
    } catch (err) {
      toastService.error('Fehler beim Anfordern des Passwort-Resets');
      console.error(getErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastService.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    if (newPassword !== confirmPassword) {
      toastService.error('Die neuen Passwörter stimmen nicht überein');
      return;
    }

    if (newPassword.length < 12) {
      toastService.error('Das neue Passwort muss mindestens 12 Zeichen lang sein');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      setPasswordChangeSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toastService.error(getErrorMessage(err));
      console.error(getErrorMessage(err));
    } finally {
      setChangingPassword(false);
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

      {passwordChangeSuccess && (
        <IonCard className="app-card" color="success">
          <IonCardContent>
            <IonText color="light">
              <strong>Passwort erfolgreich geändert!</strong>
            </IonText>
          </IonCardContent>
        </IonCard>
      )}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={keyOutline} style={{ marginRight: '8px' }} />
            Passwort ändern
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText color="medium" style={{ display: 'block', marginBottom: '20px', fontSize: '14px' }}>
            Ändern Sie Ihr Passwort direkt hier. Sie müssen Ihr aktuelles Passwort eingeben.
          </IonText>

          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">
                Aktuelles Passwort
              </IonLabel>
              <div style={{ position: 'relative', width: '100%' }}>
                <IonInput
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onIonInput={(e) => setCurrentPassword(e.detail.value!)}
                  placeholder="Aktuelles Passwort"
                  className="app-form-input"
                  required
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ion-color-step-600)',
                  }}
                  aria-label={showCurrentPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  <IonIcon icon={showCurrentPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                </button>
              </div>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">
                Neues Passwort
              </IonLabel>
              <div style={{ position: 'relative', width: '100%' }}>
                <IonInput
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onIonInput={(e) => setNewPassword(e.detail.value!)}
                  placeholder="Neues Passwort (min. 12 Zeichen)"
                  className="app-form-input"
                  required
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ion-color-step-600)',
                  }}
                  aria-label={showNewPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  <IonIcon icon={showNewPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                </button>
              </div>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">
                Neues Passwort bestätigen
              </IonLabel>
              <div style={{ position: 'relative', width: '100%' }}>
                <IonInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                  placeholder="Neues Passwort wiederholen"
                  className="app-form-input"
                  required
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ion-color-step-600)',
                  }}
                  aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                >
                  <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
                </button>
              </div>
            </IonItem>
          </IonList>

          <IonButton
            expand="block"
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="app-button"
            style={{ marginTop: '20px' }}
          >
            <IonIcon slot="start" icon={keyOutline} />
            {changingPassword ? 'Wird geändert...' : 'Passwort ändern'}
          </IonButton>
        </IonCardContent>
      </IonCard>

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

          <IonButton
            expand="block"
            onClick={handleRequestReset}
            disabled={requesting}
            className="app-button"
            fill="outline"
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
