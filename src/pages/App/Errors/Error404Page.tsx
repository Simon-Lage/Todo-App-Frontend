import React from 'react';
import { IonContent, IonButton, IonIcon } from '@ionic/react';
import { helpCircleOutline, homeOutline } from 'ionicons/icons';

const Error404Page: React.FC = () => {
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
          icon={helpCircleOutline} 
          style={{ fontSize: '100px', color: 'var(--ion-color-primary)', marginBottom: '24px' }} 
        />
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 16px', color: 'var(--ion-color-primary)' }}>
          404
        </h1>
        <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          Seite nicht gefunden
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '32px', maxWidth: '400px' }}>
          Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <IonButton routerLink="/app/dashboard" size="large">
          <IonIcon slot="start" icon={homeOutline} />
          Zum Dashboard
        </IonButton>
      </div>
    </IonContent>
  );
};

export default Error404Page;
