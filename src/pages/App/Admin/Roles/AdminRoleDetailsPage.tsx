import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonBadge, IonList, IonIcon } from '@ionic/react';
import { createOutline, trashOutline, arrowBackOutline } from 'ionicons/icons';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';
import { getRoleLabel } from '../../../../config/roleLabels';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminRoleDetailsPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const [role, setRole] = useState<RoleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setLoading(true);
        const roleData = await roleService.getById(roleId);
        setRole(roleData);
      } catch (err) {
        setError('Fehler beim Laden der Rolle');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [roleId]);

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Rolle...</p>
        </div>
      </IonContent>
    );
  }

  if (error || !role) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Rolle nicht gefunden'}</div>
      </IonContent>
    );
  }

  const permissions = Object.entries(role).filter(([key]) => key !== 'id' && key !== 'name');

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">{getRoleLabel(role.name) ?? role.id}</h1>
        <p className="page-subtitle">Rollen-Details</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Berechtigungen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            {permissions.map(([permission, value]) => (
              <IonItem key={permission} className="app-form-item">
                <IonLabel>{permission}</IonLabel>
                <IonBadge slot="end" color={value ? 'success' : 'medium'}>
                  {value ? 'Aktiv' : 'Inaktiv'}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton routerLink={`/app/admin/roles/${roleId}/edit`} expand="block" className="app-button">
          <IonIcon slot="start" icon={createOutline} />
          Bearbeiten
        </IonButton>

        <IonButton routerLink={`/app/admin/roles/${roleId}/delete`} expand="block" color="danger" className="app-button" style={{ marginTop: '8px' }}>
          <IonIcon slot="start" icon={trashOutline} />
          Löschen
        </IonButton>

        <IonButton routerLink="/app/admin/roles" expand="block" fill="outline" className="app-button-secondary" style={{ marginTop: '8px' }}>
          <IonIcon slot="start" icon={arrowBackOutline} />
          Zurück zur Liste
        </IonButton>
      </div>
    </IonContent>
  );
};

export default AdminRoleDetailsPage;

