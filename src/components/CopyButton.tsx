import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { copyOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { toastService } from '../services/toastService';

type CopyButtonProps = {
  value: string;
  label?: string;
  size?: 'small' | 'default';
};

const CopyButton: React.FC<CopyButtonProps> = ({ value, label, size = 'small' }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toastService.present({
        message: label ? `${label} kopiert` : 'Kopiert',
        color: 'success',
        duration: 1600,
        position: 'top',
        icon: checkmarkCircleOutline,
      });
    } catch {
      toastService.error('Kopieren nicht möglich. Bitte manuell kopieren.');
    }
  };

  return (
    <IonButton
      size={size}
      fill="clear"
      color="medium"
      onClick={handleCopy}
      aria-label={label ? `${label} kopieren` : 'Wert kopieren'}
      style={{ marginLeft: '4px', minWidth: '36px' }}
    >
      <IonIcon icon={copyOutline} slot="icon-only" />
    </IonButton>
  );
};

export default CopyButton;

