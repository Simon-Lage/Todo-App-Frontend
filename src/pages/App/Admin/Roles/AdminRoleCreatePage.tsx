import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonList, IonCheckbox, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { roleService } from '../../../../services/roleService';
import { permissionService } from '../../../../services/permissionService';

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
        console.error('Fehler beim Laden der Berechtigungen', err?.message || err);
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
      console.error(err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPermissions) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>Neue Rolle erstellen</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name * (max. 100 Zeichen)</IonLabel>
            <IonInput value={name} onIonInput={(e) => setName(e.detail.value!)} maxlength={100} placeholder="Rollenname" />
          </IonItem>
        </IonList>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Berechtigungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {availablePermissions.map((permission) => (
                <IonItem key={permission}>
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

        <IonButton onClick={handleSubmit} expand="block" disabled={loading}>
          {loading ? <IonSpinner /> : 'Rolle erstellen'}
        </IonButton>

        <IonButton routerLink="/app/admin/roles" expand="block" fill="outline">
          Abbrechen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminRoleCreatePage;

