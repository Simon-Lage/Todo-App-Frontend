import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonList, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { roleService } from '../../../../services/roleService';
import { permissionService } from '../../../../services/permissionService';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminRoleCreatePage: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const catalog = await permissionService.getCatalog();
        setAvailablePermissions(catalog.items);
        const initialPermissions: Record<string, boolean> = {};
        catalog.items.forEach(perm => {
          initialPermissions[perm] = false;
        });
        setPermissions(initialPermissions);
      } catch (err) {
        console.error('Fehler beim Laden der Berechtigungen', getErrorMessage(err));
      } finally {
        setLoadingPermissions(false);
      }
    };

    loadPermissions();
  }, []);

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    setPermissions({
      ...permissions,
      [permission]: checked,
    });
  };

  const handleSubmit = async () => {
    if (!name) {
      setError('Name ist ein Pflichtfeld');
      return;
    }

    try {
      setLoading(true);
      const role = await roleService.create({
        name,
        permissions,
      });
      history.push(`/app/admin/roles/${role.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen der Rolle');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingPermissions) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Berechtigungen...</p>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Neue Rolle erstellen</h1>
        <p className="page-subtitle">Erstellen Sie eine neue Rolle</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Rollenname</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Name * (max. 100 Zeichen)</IonLabel>
              <IonInput
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
                maxlength={100}
                placeholder="Rollenname"
                className="app-form-input"
                required
              />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      <IonCard className="app-card" style={{ marginTop: '16px' }}>
        <IonCardHeader>
          <IonCardTitle>Berechtigungen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            {availablePermissions.map((permission) => (
              <IonItem key={permission} className="app-form-item">
                <IonLabel>{permission}</IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={permissions[permission] || false}
                  onIonChange={(e) => handlePermissionToggle(permission, e.detail.checked)}
                />
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          onClick={handleSubmit}
          expand="block"
          disabled={loading}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {loading ? 'Erstellt...' : 'Rolle erstellen'}
        </IonButton>

        <IonButton
          routerLink="/app/admin/roles"
          expand="block"
          fill="outline"
          className="app-button-secondary"
          style={{ marginTop: '8px' }}
        >
          <IonIcon slot="start" icon={closeOutline} />
          Abbrechen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default AdminRoleCreatePage;

