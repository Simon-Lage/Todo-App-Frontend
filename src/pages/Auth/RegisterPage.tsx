import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonText, IonInput, IonButton, IonItem, IonLabel, IonList, IonSpinner, IonIcon, IonRouterLink } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { apiClient } from '../../services/apiClient';

const RegisterPage: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Passwort muss mindestens 12 Zeichen lang sein');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    try {
      setLoading(true);
      await apiClient.request({
        path: '/api/auth/register',
        method: 'POST',
        body: { name, email, password },
        skipAuth: true,
      });
      setSuccess(true);
      setTimeout(() => history.push('/auth/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrierung fehlgeschlagen');
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
          Registrierung erfolgreich!
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '8px' }}>
          Ihr Account muss noch von einem Administrator aktiviert werden.
        </p>
        <p style={{ color: 'var(--ion-color-step-600)' }}>
          Sie werden zur Anmeldeseite weitergeleitet...
        </p>
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
        Registrierung
      </h2>
      <p style={{
        textAlign: 'center',
        marginBottom: '32px',
        fontSize: '14px',
        color: 'var(--ion-color-step-600)'
      }}>
        Erstellen Sie Ihren Account
      </p>

      <form onSubmit={handleSubmit}>
        <IonList lines="none" style={{ background: 'transparent' }}>
          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '16px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Name *
            </IonLabel>
            <IonInput
              type="text"
              value={name}
              onIonInput={(e) => setName(e.detail.value!)}
              maxlength={32}
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

          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '16px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              E-Mail *
            </IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value!)}
              maxlength={128}
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

          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '16px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Passwort * (min. 12 Zeichen)
            </IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonInput={(e) => setPassword(e.detail.value!)}
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

          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '8px' }}>
            <IonLabel position="stacked" style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Passwort bestätigen *
            </IonLabel>
            <IonInput
              type="password"
              value={passwordConfirm}
              onIonInput={(e) => setPasswordConfirm(e.detail.value!)}
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
          Registrieren
        </IonButton>

        <div className="ion-text-center" style={{ marginTop: '20px', fontSize: '14px' }}>
          <IonText style={{ color: 'var(--ion-color-step-600)' }}>Schon ein Konto? </IonText>
          <IonRouterLink routerLink="/auth/login" color="primary" style={{ fontWeight: 600 }}>
            Zur Anmeldung
          </IonRouterLink>
        </div>
      </form>
    </>
  );
};

export default RegisterPage;
