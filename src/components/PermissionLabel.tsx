import React from 'react';
import { IonButton, IonIcon, IonPopover } from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';

type PermissionLabelProps = {
  permissionKey: string;
  label: string;
};

const PermissionLabel: React.FC<PermissionLabelProps> = ({ permissionKey, label }) => {
  const triggerId = `perm-${permissionKey}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span>{label}</span>
      <IonButton
        id={triggerId}
        fill="clear"
        color="medium"
        size="small"
        aria-label={`Technischer Name anzeigen: ${permissionKey}`}
        style={{ padding: 0, minWidth: 32 }}
      >
        <IonIcon icon={informationCircleOutline} slot="icon-only" />
      </IonButton>
      <IonPopover trigger={triggerId} triggerAction="click" side="bottom" alignment="center">
        <div style={{ padding: '10px 12px', fontSize: '14px' }}>
          Technischer Name: <strong>{permissionKey}</strong>
        </div>
      </IonPopover>
    </div>
  );
};

export default PermissionLabel;

