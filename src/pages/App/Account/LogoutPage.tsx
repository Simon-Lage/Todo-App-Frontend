import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonSpinner, IonIcon } from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useAuthSession } from '../../../routing/useAuthSession';
import { getErrorMessage } from '../../../utils/errorUtils';

const LogoutPage: React.FC = () => {
  const history = useHistory();
  const { logout } = useAuthSession();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        setTimeout(() => {
          history.replace('/auth/login');
        }, 1000);
      } catch (err) {
        console.error('Logout-Fehler:', getErrorMessage(err));
        history.replace('/auth/login');
      }
    };

    performLogout();
  }, [logout, history]);

  return (
    <IonContent className="app-page-content">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100%',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <IonIcon 
          icon={logOutOutline} 
          style={{ fontSize: '80px', color: 'var(--ion-color-primary)', marginBottom: '24px' }} 
        />
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
          Sie werden abgemeldet...
        </h2>
        <IonSpinner name="dots" style={{ marginTop: '20px' }} />
      </div>
    </IonContent>
  );
};

export default LogoutPage;
