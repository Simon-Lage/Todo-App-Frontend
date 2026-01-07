import React, { useState } from 'react';
import { IonText, IonInput, IonButton, IonItem, IonLabel, IonList, IonSpinner } from '@ionic/react';
import { apiClient } from '../../../services/apiClient';
import { getErrorMessage } from '../../../utils/errorUtils';
import { toastService } from '../../../services/toastService';

const ResetPasswordRequestPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      const response = await apiClient.request<{ data: { user_id: string } }>({
        path: '/api/user/find-id-by-email',
        method: 'POST',
        body: { email: normalizedEmail },
        skipAuth: true,
      });

      const userId = response.data?.user_id;
      if (!userId) {
        throw new Error('Benutzer nicht gefunden');
      }

      await apiClient.request({
        path: `/api/user/verify-email-for-password-reset/${userId}`,
        method: 'POST',
        body: { email: normalizedEmail },
        skipAuth: true,
      });

      setSubmitted(true);
      toastService.success('E-Mail zum Zurücksetzen wurde gesendet.');
    } catch (err) {
      const message = getErrorMessage(err);
      setError('E-Mail konnte nicht versendet werden. Bitte prüfen Sie die Adresse.');
      toastService.error(message || 'E-Mail konnte nicht versendet werden.');
      console.error(message || err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          E-Mail bestätigen
        </h2>
        <p style={{
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '14px',
          color: 'var(--ion-color-step-600)'
        }}>
          Wir haben Ihnen eine E-Mail mit weiteren Schritten geschickt.
        </p>
        <IonButton
          routerLink="/auth/login"
          expand="block"
          fill="outline"
          style={{ marginTop: '12px', height: '48px', fontSize: '16px' }}
        >
          Zurück zur Anmeldung
        </IonButton>
      </>
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
        Passwort zurücksetzen
      </h2>
      <p style={{
        textAlign: 'center',
        marginBottom: '32px',
        fontSize: '14px',
        color: 'var(--ion-color-step-600)'
      }}>
        Geben Sie Ihre E-Mail-Adresse ein
      </p>

      <form onSubmit={handleSubmit}>
        <IonList lines="none" style={{ background: 'transparent' }}>
          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '16px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              E-Mail-Adresse
            </IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value!)}
              placeholder="ihre.email@example.com"
              required
              style={{ 
                '--background': '#f5f5f5',
                '--padding-start': '12px',
                '--padding-end': '12px',
                borderRadius: '8px',
                marginTop: '4px'
              }}
            />
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
          Passwort-Reset anfordern
        </IonButton>

        <IonButton 
          routerLink="/auth/login" 
          expand="block" 
          fill="outline"
          style={{ marginTop: '12px', height: '48px', fontSize: '16px' }}
        >
          Zurück zur Anmeldung
        </IonButton>
      </form>
    </>
  );
};

export default ResetPasswordRequestPage;

