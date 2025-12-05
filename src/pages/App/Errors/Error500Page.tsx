import React from 'react';
import { IonContent, IonButton, IonIcon } from '@ionic/react';
import { alertCircleOutline, homeOutline, refreshOutline } from 'ionicons/icons';

const Error500Page: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

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
          icon={alertCircleOutline} 
          style={{ fontSize: '100px', color: 'var(--ion-color-danger)', marginBottom: '24px' }} 
        />
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', margin: '0 0 16px', color: 'var(--ion-color-danger)' }}>
          500
        </h1>
        <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '12px' }}>
          Serverfehler
        </h2>
        <p style={{ color: 'var(--ion-color-step-600)', marginBottom: '32px', maxWidth: '400px' }}>
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <IonButton onClick={handleRefresh} size="large">
            <IonIcon slot="start" icon={refreshOutline} />
            Seite neu laden
          </IonButton>
          <IonButton routerLink="/app/dashboard" fill="outline" size="large">
            <IonIcon slot="start" icon={homeOutline} />
            Zum Dashboard
          </IonButton>
        </div>
      </div>
    </IonContent>
  );
};

export default Error500Page;
