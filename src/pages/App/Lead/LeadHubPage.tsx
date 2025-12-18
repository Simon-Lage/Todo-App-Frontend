import React from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonRow,
} from '@ionic/react';
import { briefcaseOutline, checkmarkCircleOutline, peopleOutline } from 'ionicons/icons';

const LeadHubPage: React.FC = () => {
  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Teamleitung</h1>
        <p className="page-subtitle">Überblick über Aufgaben und Projekte im Team</p>
      </div>

      <IonGrid style={{ padding: '0 16px' }}>
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard className="app-card" style={{ height: '100%' }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '32px', color: 'var(--ion-color-primary)' }} />
                  Meine Aufgaben
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '16px', color: 'var(--ion-color-step-600)' }}>
                  Aufgaben, die Ihnen zugewiesen sind.
                </p>
                <IonButton routerLink="/app/tasks/my" expand="block" fill="outline">
                  Öffnen
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard className="app-card" style={{ height: '100%' }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonIcon icon={peopleOutline} style={{ fontSize: '32px', color: 'var(--ion-color-secondary)' }} />
                  Team-Aufgaben
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '16px', color: 'var(--ion-color-step-600)' }}>
                  Aufgaben nach Mitarbeiter filtern und verfolgen.
                </p>
                <IonButton routerLink="/app/lead/tasks" expand="block" fill="outline">
                  Öffnen
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard className="app-card" style={{ height: '100%' }}>
              <IonCardHeader>
                <IonCardTitle style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IonIcon icon={briefcaseOutline} style={{ fontSize: '32px', color: 'var(--ion-color-tertiary)' }} />
                  Projekte
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '16px', color: 'var(--ion-color-step-600)' }}>
                  Projektübersicht und Status.
                </p>
                <IonButton routerLink="/app/project/list/all" expand="block" fill="outline">
                  Öffnen
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default LeadHubPage;

