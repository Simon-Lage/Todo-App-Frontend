import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonList, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';

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
        console.error(err?.message || err);
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
      console.error(err?.message || err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error && !role) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Rolle bearbeiten</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name * (max. 100 Zeichen)</IonLabel>
            <IonInput value={name} onIonInput={(e) => setName(e.detail.value!)} maxlength={100} />
          </IonItem>
        </IonList>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Berechtigungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {Object.keys(permissions).map((permission) => (
                <IonItem key={permission}>
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

        <IonButton onClick={handleSubmit} expand="block" disabled={saving}>
          {saving ? <IonSpinner /> : 'Speichern'}
        </IonButton>

        <IonButton routerLink={`/app/admin/roles/${roleId}`} expand="block" fill="outline">
          Abbrechen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminRoleEditPage;

