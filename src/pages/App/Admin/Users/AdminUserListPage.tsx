import React, { useEffect, useState } from 'react';
import { IonContent, IonPage, IonText, IonSpinner, IonList, IonItem, IonLabel, IonButton, IonSearchbar, IonBadge } from '@ionic/react';
import { userService } from '../../../../services/userService';
import type { UserListView } from '../../../../types/api';

const AdminUserListPage: React.FC = () => {
  const [users, setUsers] = useState<UserListView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.list(
          { q: searchText || undefined },
          { limit: 100 }
        );
        setUsers(response.items);
      } catch (err) {
        setError('Fehler beim Laden der Benutzer');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [searchText]);

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
          <h1>Benutzerverwaltung</h1>
        </IonText>

        <IonSearchbar value={searchText} onIonInput={(e) => setSearchText(e.detail.value!)} placeholder="Benutzer durchsuchen" />

        {users.length === 0 ? (
          <IonText>Keine Benutzer gefunden</IonText>
        ) : (
          <IonList>
            {users.map((user) => (
              <IonItem key={user.id} routerLink={`/app/admin/users/${user.id}`}>
                <IonLabel>
                  <h2>{user.name}</h2>
                  <p>{user.email}</p>
                  {user.last_login_at && (
                    <p>Letzter Login: {new Date(user.last_login_at).toLocaleDateString()}</p>
                  )}
                </IonLabel>
                <IonBadge slot="end" color={user.active ? 'success' : 'danger'}>
                  {user.active ? 'Aktiv' : 'Inaktiv'}
                </IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonButton routerLink="/app/admin/users/create" expand="block">
          Neuen Benutzer erstellen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminUserListPage;

