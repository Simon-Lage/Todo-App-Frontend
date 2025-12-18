import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonText, IonInput, IonButton, IonItem, IonLabel, IonList, IonSpinner } from '@ionic/react';

const ResetPasswordRequestPage: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein');
      return;
    }

    try {
      setLoading(true);
      history.push(`/auth/reset-password/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

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
          Weiter
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

