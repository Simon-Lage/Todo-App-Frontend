import { IonContent, IonPage } from '@ionic/react';
import React, { ReactNode } from 'react';

type AuthLayoutProps = {
  children?: ReactNode;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
  <IonPage>
    <IonContent className="ion-padding">{children}</IonContent>
  </IonPage>
);

export default AuthLayout;
