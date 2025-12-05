import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonBadge, IonList } from '@ionic/react';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';

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
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [roleId]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !role) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error || 'Rolle nicht gefunden'}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  const permissions = Object.entries(role).filter(([key]) => key !== 'id' && key !== 'name');

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>{role.name}</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Berechtigungen</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {permissions.map(([permission, value]) => (
                <IonItem key={permission}>
                  <IonLabel>{permission}</IonLabel>
                  <IonBadge slot="end" color={value ? 'success' : 'medium'}>
                    {value ? 'Aktiv' : 'Inaktiv'}
                  </IonBadge>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonButton routerLink={`/app/admin/roles/${roleId}/edit`} expand="block" color="secondary">
          Bearbeiten
        </IonButton>

        <IonButton routerLink={`/app/admin/roles/${roleId}/delete`} expand="block" color="danger">
          Löschen
        </IonButton>

        <IonButton routerLink="/app/admin/roles" expand="block" fill="outline">
          Zurück zur Liste
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminRoleDetailsPage;

