import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonBadge } from '@ionic/react';
import { userService } from '../../../../services/userService';
import type { UserView } from '../../../../types/api';

const AdminUserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!userId) {
        setError('Keine Benutzer-ID angegeben');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await userService.getById(userId);
        setUser(userData);
      } catch (err) {
        setError('Fehler beim Laden des Benutzers');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !user) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonText color="danger">{error || 'Benutzer nicht gefunden'}</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonText>
          <h1>{user.name}</h1>
        </IonText>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Benutzerdetails</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel>E-Mail</IonLabel>
              <IonText>{user.email}</IonText>
            </IonItem>

            <IonItem>
              <IonLabel>Status</IonLabel>
              <IonBadge color={user.active ? 'success' : 'danger'}>
                {user.active ? 'Aktiv' : 'Inaktiv'}
              </IonBadge>
            </IonItem>

            <IonItem>
              <IonLabel>Registriert seit</IonLabel>
              <IonText>{new Date(user.created_at).toLocaleDateString()}</IonText>
            </IonItem>

            {user.last_login_at && (
              <IonItem>
                <IonLabel>Letzter Login</IonLabel>
                <IonText>{new Date(user.last_login_at).toLocaleString()}</IonText>
              </IonItem>
            )}

            <IonButton routerLink={`/app/admin/users/${user.id}/edit`} expand="block" color="secondary">
              Bearbeiten
            </IonButton>

            <IonButton routerLink="/app/admin/users" expand="block" fill="outline">
              Zurück zur Liste
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminUserDetailsPage;

