import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

type PaginationControlsProps = {
  offset: number;
  limit: number;
  total: number;
  onPageChange: (newOffset: number) => void;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  offset,
  limit,
  total,
  onPageChange,
}) => {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const startItem = offset + 1;
  const endItem = Math.min(offset + limit, total);

  const handlePrevious = () => {
    const newOffset = Math.max(0, offset - limit);
    onPageChange(newOffset);
  };

  const handleNext = () => {
    const newOffset = offset + limit;
    if (newOffset < total) {
      onPageChange(newOffset);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '16px',
      borderTop: '1px solid var(--ion-color-step-200)'
    }}>
      <IonText color="medium" style={{ fontSize: '14px' }}>
        {startItem}-{endItem} von {total}
      </IonText>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <IonButton
          fill="outline"
          size="small"
          disabled={offset === 0}
          onClick={handlePrevious}
        >
          <IonIcon icon={chevronBackOutline} />
        </IonButton>
        
        <IonText style={{ fontSize: '14px', minWidth: '60px', textAlign: 'center' }}>
          Seite {currentPage} von {totalPages}
        </IonText>
        
        <IonButton
          fill="outline"
          size="small"
          disabled={offset + limit >= total}
          onClick={handleNext}
        >
          <IonIcon icon={chevronForwardOutline} />
        </IonButton>
      </div>
    </div>
  );
};

export default PaginationControls;
