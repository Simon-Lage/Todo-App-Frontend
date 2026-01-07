import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { IonText, IonInput, IonButton, IonItem, IonLabel, IonList, IonSpinner, IonIcon } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { apiClient } from '../../../services/apiClient';

const ResetPasswordVerifyEmailPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [emailFromUrl, setEmailFromUrl] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      setEmailFromUrl(decodedEmail);
      setEmail(decodedEmail);
    } else {
      history.replace('/auth/reset-password/request');
    }
  }, [location, history]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein');
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();

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

      setSuccess(true);
    } catch (err) {
      setError('E-Mail-Adresse stimmt nicht überein oder Benutzer nicht gefunden');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="ion-text-center" style={{ padding: '40px 20px' }}>
        <IonIcon 
          icon={checkmarkCircleOutline} 
          style={{ fontSize: '80px', color: 'var(--ion-color-success)', marginBottom: '20px' }} 
        />
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
          E-Mail gesendet!
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '24px' }}>
          Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts per E-Mail zugeschickt.
          Bitte überprüfen Sie Ihr Postfach.
        </p>
        <IonButton 
          routerLink="/auth/login" 
          expand="block"
          style={{ height: '48px', fontSize: '16px', fontWeight: 600 }}
        >
          Zur Anmeldung
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
        E-Mail bestätigen
      </h2>
      <p style={{
        textAlign: 'center',
        marginBottom: '32px',
        fontSize: '14px',
        color: 'var(--ion-color-step-600)'
      }}>
        {emailFromUrl ? `Bitte bestätigen Sie Ihre E-Mail-Adresse: ${emailFromUrl}` : 'Bitte geben Sie Ihre E-Mail-Adresse ein'}
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
                'borderRadius': '8px',
                'marginTop': '4px'
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

export default ResetPasswordVerifyEmailPage;
