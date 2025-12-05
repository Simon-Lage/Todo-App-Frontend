import React from 'react';
import { IonContent, IonPage, IonText, IonButton } from '@ionic/react';

const ResetPasswordFlowPage: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding ion-text-center">
      <IonText>
        <h1>Passwort zurücksetzen</h1>
        <p>Wählen Sie eine Option:</p>
      </IonText>

      <IonButton routerLink="/auth/reset-password/request" expand="block">
        Passwort zurücksetzen starten
      </IonButton>

      <IonButton routerLink="/auth/login" expand="block" fill="outline">
        Zurück zur Anmeldung
      </IonButton>
    </IonContent>
  </IonPage>
);

export default ResetPasswordFlowPage;

