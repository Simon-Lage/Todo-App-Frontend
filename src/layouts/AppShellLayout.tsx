import { IonContent, IonPage } from '@ionic/react';
import React, { ReactNode } from 'react';

type AppShellLayoutProps = {
  children?: ReactNode;
};

const AppShellLayout: React.FC<AppShellLayoutProps> = ({ children }) => (
  <IonPage>
    <IonContent fullscreen>{children}</IonContent>
  </IonPage>
);

export default AppShellLayout;
