import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonToggle, IonList, IonCheckbox } from '@ionic/react';
import { userService } from '../../../../services/userService';
import { roleService } from '../../../../services/roleService';
import type { UserView, RoleView } from '../../../../types/api';

const AdminUserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  const [user, setUser] = useState<UserView | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [userData, rolesResponse, userRoles] = await Promise.all([
          userService.getById(userId),
          roleService.list({ limit: 100 }),
          roleService.getByUser(userId)
        ]);
        
        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setActive(userData.active);
        setAvailableRoles(rolesResponse.items);
        setSelectedRoles(userRoles.map(r => r.id));
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      setError('Name und E-Mail sind Pflichtfelder');
      return;
    }

    try {
      setSaving(true);
      await userService.updateAdmin(userId, {
        name,
        email,
        active,
        roles: selectedRoles,
      });
      history.push(`/app/admin/users/${userId}`);
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

  if (error && !user) {
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
          <h1>Benutzer bearbeiten</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name * (max. 32 Zeichen)</IonLabel>
            <IonInput value={name} onIonInput={(e) => setName(e.detail.value!)} maxlength={32} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">E-Mail * (max. 128 Zeichen)</IonLabel>
            <IonInput type="email" value={email} onIonInput={(e) => setEmail(e.detail.value!)} maxlength={128} />
          </IonItem>

          <IonItem>
            <IonLabel>Aktiv</IonLabel>
            <IonToggle checked={active} onIonChange={(e) => setActive(e.detail.checked)} />
          </IonItem>

          <IonItem>
            <IonLabel>
              <h2>Rollen</h2>
              <p>Wählen Sie die Rollen für diesen Benutzer</p>
            </IonLabel>
          </IonItem>

          {availableRoles.map((role) => (
            <IonItem key={role.id}>
              <IonLabel>{role.name}</IonLabel>
              <IonCheckbox
                slot="end"
                checked={selectedRoles.includes(role.id)}
                onIonChange={(e) => handleRoleToggle(role.id, e.detail.checked)}
              />
            </IonItem>
          ))}
        </IonList>

        <IonButton onClick={handleSubmit} expand="block" disabled={saving}>
          {saving ? <IonSpinner /> : 'Speichern'}
        </IonButton>

        <IonButton routerLink={`/app/admin/users/${userId}`} expand="block" fill="outline">
          Abbrechen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminUserEditPage;

