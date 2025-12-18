import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonList, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon } from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminRoleEditPage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const history = useHistory();
  const [role, setRole] = useState<RoleView | null>(null);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setLoading(true);
        const roleData = await roleService.getById(roleId);
        setRole(roleData);
        setName(roleData.name);
        
        const perms: Record<string, boolean> = {};
        Object.entries(roleData).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'name') {
            perms[key] = value as boolean;
          }
        });
        setPermissions(perms);
      } catch (err) {
        setError('Fehler beim Laden der Rolle');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [roleId]);

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
      setSaving(true);
      await roleService.update(roleId, {
        name,
        permissions,
      });
      history.push(`/app/admin/roles/${roleId}`);
    } catch (err) {
      setError('Fehler beim Speichern');
      console.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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

  if (error && !role) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Rolle bearbeiten</h1>
        <p className="page-subtitle">Ändern Sie die Rollendetails</p>
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
            {Object.keys(permissions).map((permission) => (
              <IonItem key={permission} className="app-form-item">
                <IonLabel>{permission}</IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={permissions[permission]}
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
          disabled={saving}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {saving ? 'Speichert...' : 'Speichern'}
        </IonButton>

        <IonButton
          routerLink={`/app/admin/roles/${roleId}`}
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

export default AdminRoleEditPage;

