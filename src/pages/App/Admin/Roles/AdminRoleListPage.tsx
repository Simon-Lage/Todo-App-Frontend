import React, { useEffect, useState } from 'react';
import { IonContent, IonText, IonSpinner, IonButton, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';
import { getRoleLabel } from '../../../../config/roleLabels';
import { getErrorMessage } from '../../../../utils/errorUtils';
import CopyButton from '../../../../components/CopyButton';

const AdminRoleListPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true);
        const response = await roleService.list({ limit: 100 });
        setRoles(response.items);
      } catch (err) {
        setError('Fehler beim Laden der Rollen');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Rollen...</p>
        </div>
      </IonContent>
    );
  }

  if (error) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Rollenverwaltung</h1>
        <p className="page-subtitle">{roles.length} Rolle{roles.length !== 1 ? 'n' : ''} verfügbar</p>
      </div>

      {roles.length === 0 ? (
        <div className="empty-state">
          <p>Keine Rollen gefunden</p>
        </div>
      ) : (
        <IonList className="app-list" style={{ padding: '0 16px' }}>
          {roles.map((role) => (
            <IonItem
              key={role.id}
              routerLink={`/app/admin/roles/${role.id}`}
              button
              detail={false}
              className="app-list-item"
              >
              <IonLabel>
                <h3>{getRoleLabel(role.name) ?? role.id}</h3>
                <p style={{ fontSize: '12px', color: 'var(--ion-color-medium)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{role.id}</span>
                  <CopyButton value={role.id} label="Rollen-ID" size="small" />
                </p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      )}

      <div style={{ padding: '16px' }}>
        <IonButton routerLink="/app/admin/roles/create" expand="block" className="app-button">
          <IonIcon slot="start" icon={addOutline} />
          Neue Rolle erstellen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default AdminRoleListPage;
