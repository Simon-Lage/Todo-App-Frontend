import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonText, IonSpinner, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';

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
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error) {
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
          <h1>Rollenverwaltung</h1>
        </IonText>

        {roles.length === 0 ? (
          <IonText>Keine Rollen gefunden</IonText>
        ) : (
          <IonList>
            {roles.map((role) => (
              <IonItem key={role.id} routerLink={`/app/admin/roles/${role.id}`}>
                <IonLabel>
                  <h2>{role.name}</h2>
                  <p>Rolle mit verschiedenen Berechtigungen</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonButton routerLink="/app/admin/roles/create" expand="block">
          Neue Rolle erstellen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminRoleListPage;

