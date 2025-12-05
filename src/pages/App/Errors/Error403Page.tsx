import React from 'react';
import { IonContent, IonButton, IonIcon } from '@ionic/react';
import { shieldOutline, homeOutline } from 'ionicons/icons';

const Error403Page: React.FC = () => {
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
          icon={shieldOutline} 
          style={{ fontSize: '100px', color: 'var(--ion-color-danger)', marginBottom: '24px' }} 
        />
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 16px', color: 'var(--ion-color-danger)' }}>
          403
        </h1>
        <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          Zugriff verweigert
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '32px', maxWidth: '400px' }}>
          Sie haben keine Berechtigung, um auf diese Ressource zuzugreifen.
        </p>
        <IonButton routerLink="/app/dashboard" size="large">
          <IonIcon slot="start" icon={homeOutline} />
          Zum Dashboard
        </IonButton>
      </div>
    </IonContent>
  );
};

export default Error403Page;
