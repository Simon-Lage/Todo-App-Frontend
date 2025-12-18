import React, { useEffect, useState } from "react";
import {
	  IonButton,
	  IonInput,
	  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
	  IonText,
	  IonRouterLink,
	  IonIcon,
	} from '@ionic/react';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthSession } from '../../routing/useAuthSession';
import { toastService } from '../../services/toastService';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const { authSession, login, loading, error, clearError } = useAuthSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (authSession.isAuthenticated) {
      history.replace('/app/dashboard');
    }
  }, [authSession.isAuthenticated, history]);

  useEffect(() => {
    clearError();
    setFormError(null);
  }, [clearError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      toastService.success('Erfolgreich angemeldet');
      history.replace('/app/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.';
      setFormError(errorMessage);
      toastService.error(errorMessage);
    } finally {
      setSubmitting(false);
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
        Anmelden
      </h2>
      <p style={{
        textAlign: 'center',
        marginBottom: '32px',
        fontSize: '14px',
        color: 'var(--ion-color-step-600)'
      }}>
        Willkommen zurück!
      </p>
      
      <form onSubmit={handleSubmit}>
        <IonList lines="none" style={{ background: 'transparent', padding: 0 }}>
          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '20px' }}>
            <IonLabel position="stacked">E-Mail</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonInput={(e) => setEmail(e.detail.value ?? '')}
              required
              autocomplete="email"
              placeholder="ihre.email@example.com"
            />
          </IonItem>
          
		          <IonItem lines="none" style={{ '--background': 'transparent', marginBottom: '20px' }}>
		            <IonLabel position="stacked">Passwort</IonLabel>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
		              <IonInput
		                type={showPassword ? 'text' : 'password'}
		                value={password}
		                onIonInput={(e) => setPassword(e.detail.value ?? '')}
		                required
		                autocomplete="current-password"
		                placeholder="••••••••"
                    style={{ flex: 1 }}
		              />
		              <IonButton
		                type="button"
		                fill="clear"
		                color="medium"
		                onClick={() => setShowPassword(!showPassword)}
		                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
		              >
		                <IonIcon slot="icon-only" icon={showPassword ? eyeOffOutline : eyeOutline} />
		              </IonButton>
                </div>
		          </IonItem>
		        </IonList>

        {(formError || error) && (
          <IonText color="danger" style={{ 
            display: 'block', 
            textAlign: 'center', 
            padding: '12px 0', 
            fontSize: '14px', 
            fontWeight: 600 
          }}>
            {(formError || error) ?? ''}
          </IonText>
        )}

        <IonButton 
          type="submit" 
          expand="block" 
          disabled={submitting || loading}
          style={{ marginTop: '24px', height: '48px', fontSize: '16px', fontWeight: 600 }}
        >
          {(submitting || loading) && <IonSpinner name="dots" className="ion-margin-end" />}
          Anmelden
        </IonButton>

        <div className="ion-text-center" style={{ marginTop: '20px' }}>
          <IonRouterLink routerLink="/auth/reset-password/request" color="primary" style={{ fontSize: '14px', fontWeight: 500 }}>
            Passwort vergessen?
          </IonRouterLink>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
