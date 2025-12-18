import React from 'react';
import { IonContent, IonSpinner } from '@ionic/react';

type LoadingSpinnerProps = {
  message?: string;
  fullPage?: boolean;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Lädt...', fullPage = true }) => {
  const content = (
    <div className="loading-container">
      <IonSpinner name="circular" />
      <p>{message}</p>
    </div>
  );

  if (fullPage) {
    return <IonContent className="app-page-content">{content}</IonContent>;
  }

  return content;
};

export default LoadingSpinner;
