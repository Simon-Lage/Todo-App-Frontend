import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';

const AdminRoleDeletePage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const history = useHistory();
  const [role, setRole] = useState<RoleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (!role) return;

    try {
      setDeleting(true);
      await roleService.delete(role.id);
      history.push('/app/admin/roles');
    } catch (err) {
      setError('Fehler beim Löschen der Rolle');
      console.error(err?.message || err);
    } finally {
      setDeleting(false);
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
          <h1>Rolle löschen</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Bestätigung erforderlich</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>Möchten Sie die folgende Rolle wirklich löschen?</p>
              <h2>{role?.name}</h2>
              <p style={{ color: 'var(--ion-color-danger)' }}>
                <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Benutzer, die diese Rolle haben, verlieren die zugehörigen Berechtigungen.
              </p>
            </IonText>

            {error && <IonText color="danger">{error}</IonText>}

            <IonButton onClick={handleDelete} expand="block" color="danger" disabled={deleting}>
              {deleting ? <IonSpinner /> : 'Ja, Rolle löschen'}
            </IonButton>

            <IonButton routerLink={`/app/admin/roles/${roleId}`} expand="block" fill="outline">
              Abbrechen
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminRoleDeletePage;

