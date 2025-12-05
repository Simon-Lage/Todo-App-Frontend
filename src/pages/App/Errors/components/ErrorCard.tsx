import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonText } from '@ionic/react';

type ErrorCardProps = {
  title: string;
  message: string;
  icon: string;
  children?: React.ReactNode;
};

const ErrorCard: React.FC<ErrorCardProps> = ({ title, message, icon, children }) => (
  <IonCard className="ion-text-center">
    <IonCardHeader>
      <IonIcon name={icon} style={{ fontSize: '64px', color: 'var(--ion-color-danger)' }} />
      <IonCardTitle>{title}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent>
      <IonText>
        <p>{message}</p>
      </IonText>
      {children}
    </IonCardContent>
  </IonCard>
);

export default ErrorCard;

