import React from 'react';
import { IonText, IonIcon } from '@ionic/react';
import { alertCircleOutline } from 'ionicons/icons';

type ErrorDisplayProps = {
  message: string;
  onRetry?: () => void;
};

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <IonIcon icon={alertCircleOutline} style={{ marginRight: '8px', fontSize: '20px' }} />
      <IonText>{message}</IonText>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: 'var(--ion-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Erneut versuchen
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
