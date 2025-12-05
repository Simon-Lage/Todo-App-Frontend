import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonText, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonToggle, IonList, IonCheckbox } from '@ionic/react';
import { userService } from '../../../../services/userService';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';

const AdminUserCreatePage: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const rolesResponse = await roleService.list({ limit: 100 });
        setAvailableRoles(rolesResponse.items);
      } catch (err) {
        console.error('Fehler beim Laden der Rollen', err?.message || err);
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, []);

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('Name, E-Mail und Passwort sind Pflichtfelder');
      return;
    }

    if (password.length < 12) {
      setError('Passwort muss mindestens 12 Zeichen lang sein');
      return;
    }

    try {
      setLoading(true);
      const user = await userService.create({
        name,
        email,
        password,
        active,
        roles: selectedRoles,
      });
      history.push(`/app/admin/users/${user.id}`);
    } catch (err) {
      setError('Fehler beim Erstellen des Benutzers');
      console.error(err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoles) {
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
          <h1>Neuen Benutzer erstellen</h1>
        </IonText>

        {error && <IonText color="danger">{error}</IonText>}

        <IonList>
          <IonItem>
            <IonLabel position="stacked">Name * (max. 32 Zeichen)</IonLabel>
            <IonInput value={name} onIonInput={(e) => setName(e.detail.value!)} maxlength={32} placeholder="Benutzername" />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">E-Mail * (max. 128 Zeichen)</IonLabel>
            <IonInput type="email" value={email} onIonInput={(e) => setEmail(e.detail.value!)} maxlength={128} placeholder="benutzer@example.com" />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Passwort * (min. 12 Zeichen)</IonLabel>
            <IonInput type="password" value={password} onIonInput={(e) => setPassword(e.detail.value!)} placeholder="Sicheres Passwort" />
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

        <IonButton onClick={handleSubmit} expand="block" disabled={loading}>
          {loading ? <IonSpinner /> : 'Benutzer erstellen'}
        </IonButton>

        <IonButton routerLink="/app/admin/users" expand="block" fill="outline">
          Abbrechen
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminUserCreatePage;

