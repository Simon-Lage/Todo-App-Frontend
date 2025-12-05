import React from 'react';
import { IonContent, IonButton, IonIcon } from '@ionic/react';
import { lockClosedOutline, homeOutline } from 'ionicons/icons';

const Error401Page: React.FC = () => {
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
          icon={lockClosedOutline} 
          style={{ fontSize: '100px', color: 'var(--ion-color-warning)', marginBottom: '24px' }} 
        />
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 16px', color: 'var(--ion-color-warning)' }}>
          401
        </h1>
        <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          Nicht autorisiert
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '32px', maxWidth: '400px' }}>
          Sie müssen sich anmelden, um auf diese Seite zugreifen zu können.
        </p>
        <IonButton routerLink="/auth/login" size="large">
          <IonIcon slot="start" icon={lockClosedOutline} />
          Zur Anmeldung
        </IonButton>
      </div>
    </IonContent>
  );
};

export default Error401Page;
