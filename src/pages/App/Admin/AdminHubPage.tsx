import React from 'react';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import {
  peopleOutline,
  shieldOutline,
  documentTextOutline,
} from 'ionicons/icons';

const AdminHubPage: React.FC = () => {
  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Admin-Bereich</h1>
        <p className="page-subtitle">Verwaltung von Benutzern, Rollen und System</p>
      </div>

      <IonGrid style={{ padding: '0 16px' }}>
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard className="app-card" style={{ height: '100%' }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonIcon icon={peopleOutline} style={{ fontSize: '32px', color: 'var(--ion-color-primary)' }} />
                  Benutzerverwaltung
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '16px', color: 'var(--ion-color-step-600)' }}>
                  Verwalten Sie Benutzerkonten, Aktivierungsstatus und Berechtigungen.
                </p>
                <IonButton routerLink="/app/admin/users" expand="block" fill="outline">
                  Benutzer verwalten
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard className="app-card" style={{ height: '100%' }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonIcon icon={shieldOutline} style={{ fontSize: '32px', color: 'var(--ion-color-secondary)' }} />
                  Rollenverwaltung
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '16px', color: 'var(--ion-color-step-600)' }}>
                  Erstellen und bearbeiten Sie Rollen mit spezifischen Berechtigungen.
                </p>
                <IonButton routerLink="/app/admin/roles" expand="block" fill="outline">
                  Rollen verwalten
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard className="app-card" style={{ height: '100%' }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonIcon icon={documentTextOutline} style={{ fontSize: '32px', color: 'var(--ion-color-tertiary)' }} />
                  System-Logs
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '16px', color: 'var(--ion-color-step-600)' }}>
                  Überprüfen Sie System-Ereignisse und Benutzeraktivitäten.
                </p>
                <IonButton routerLink="/app/admin/logs" expand="block" fill="outline">
                  Logs anzeigen
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default AdminHubPage;
