import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonText, IonInput, IonButton, IonItem, IonLabel, IonList, IonSpinner, IonIcon } from '@ionic/react';
import { closeCircleOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { apiClient } from '../../../services/apiClient';
import { authService } from '../../../services/authService';
import type { TokenPair } from '../../../services/sessionStore';
import { getErrorMessage } from '../../../utils/errorUtils';

const ResetPasswordConfirmPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError('Kein Reset-Token angegeben');
    }
  }, [location]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Kein Reset-Token angegeben');
      return;
    }

    if (newPassword.length < 12) {
      setError('Passwort muss mindestens 12 Zeichen lang sein');
      return;
    }

    if (newPassword !== passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.request<{ data: { tokens: TokenPair; user: unknown; permissions: Record<string, boolean> } }>({
        path: '/api/auth/reset-password/confirm',
        method: 'POST',
        body: { token, new_password: newPassword },
        skipAuth: true,
      });

      authService.setSession({
        tokens: response.data.tokens,
        user: response.data.user,
        permissions: response.data.permissions,
        roles: [],
      });

      history.push('/app/dashboard');
    } catch (err) {
      setError('Passwort-Reset fehlgeschlagen. Token möglicherweise abgelaufen.');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token && !loading) {
    return (
      <div className="ion-text-center" style={{ padding: '40px 20px' }}>
        <IonIcon 
          icon={closeCircleOutline} 
          style={{ fontSize: '80px', color: 'var(--ion-color-danger)', marginBottom: '20px' }} 
        />
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
          Ungültiger Link
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '24px' }}>
          Der Reset-Link ist ungültig oder abgelaufen.
        </p>
        <IonButton 
          routerLink="/auth/reset-password/request" 
          expand="block"
          style={{ height: '48px', fontSize: '16px', fontWeight: 600 }}
        >
          Neuen Link anfordern
        </IonButton>
      </div>
    );
  }

  return (
    <>
      <h2 style={{ 
        textAlign: 'center', 
        marginTop: 0, 
        marginBottom: '8px', 
        fontSize: '26px', 
        fontWeight: 700,
        color: 'var(--ion-color-primary)'
      }}>
        Neues Passwort
      </h2>
      <p style={{
        textAlign: 'center',
        marginBottom: '32px',
        fontSize: '14px',
        color: 'var(--ion-color-step-600)'
      }}>
        Legen Sie Ihr neues Passwort fest
      </p>

      <form onSubmit={handleSubmit}>
        <IonList lines="none" style={{ background: 'transparent' }}>
          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '16px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Neues Passwort * (min. 12 Zeichen)
            </IonLabel>
            <div style={{ position: 'relative', width: '100%' }}>
              <IonInput
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onIonInput={(e) => setNewPassword(e.detail.value!)}
                required
                style={{ 
                  '--background': '#f5f5f5',
                  '--padding-start': '12px',
                  '--padding-end': '48px',
                  'borderRadius': '8px',
                  'marginTop': '4px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
              </button>
            </div>
          </IonItem>

          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '8px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Passwort bestätigen *
            </IonLabel>
            <div style={{ position: 'relative', width: '100%' }}>
              <IonInput
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onIonInput={(e) => setPasswordConfirm(e.detail.value!)}
                required
                style={{ 
                  '--background': '#f5f5f5',
                  '--padding-start': '12px',
                  '--padding-end': '48px',
                  'borderRadius': '8px',
                  'marginTop': '4px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
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
                aria-label={showPasswordConfirm ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                <IonIcon icon={showPasswordConfirm ? eyeOffOutline : eyeOutline} style={{ fontSize: '20px' }} />
              </button>
            </div>
          </IonItem>
        </IonList>

        {error && (
          <IonText color="danger" style={{ display: 'block', padding: '12px 0', fontSize: '14px' }}>
            {error}
          </IonText>
        )}

        <IonButton 
          type="submit" 
          expand="block" 
          disabled={loading}
          style={{ marginTop: '24px', height: '48px', fontSize: '16px', fontWeight: 600 }}
        >
          {loading && <IonSpinner name="dots" className="ion-margin-end" />}
          Passwort zurücksetzen
        </IonButton>

        <IonButton 
          routerLink="/auth/login" 
          expand="block" 
          fill="outline"
          style={{ marginTop: '12px', height: '48px', fontSize: '16px' }}
        >
          Abbrechen
        </IonButton>
      </form>
    </>
  );
};

export default ResetPasswordConfirmPage;
