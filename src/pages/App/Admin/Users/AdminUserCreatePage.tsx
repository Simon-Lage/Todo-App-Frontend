import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonText, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonToggle, IonList, IonSelect, IonSelectOption, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { userService } from '../../../../services/userService';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';
import { getRoleLabel } from '../../../../config/roleLabels';
import { toastService } from '../../../../services/toastService';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminUserCreatePage: React.FC = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const rolesResponse = await roleService.list({ limit: 100 });
        setAvailableRoles(rolesResponse.items);
      } catch (err) {
        console.error('Fehler beim Laden der Rollen', getErrorMessage(err));
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, []);

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      toastService.error('Name, E-Mail und Passwort sind Pflichtfelder');
      return;
    }

    if (password.length < 12) {
      toastService.error('Passwort muss mindestens 12 Zeichen lang sein');
      return;
    }

    if (!selectedRoleId) {
      toastService.error('Bitte genau eine Rolle auswählen');
      return;
    }

    try {
      setLoading(true);
      const user = await userService.create({
        name,
        email,
        password,
        active,
        roles: [selectedRoleId],
      });
      history.push(`/app/admin/users/${user.id}`);
    } catch (err) {
      toastService.error('Fehler beim Erstellen des Benutzers');
      console.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoles) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Rollen...</p>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Neuen Benutzer erstellen</h1>
        <p className="page-subtitle">Erstellen Sie einen neuen Benutzer</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Benutzerdetails</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Name * (max. 32 Zeichen)</IonLabel>
              <IonInput
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
                maxlength={32}
                placeholder="Benutzername"
                className="app-form-input"
                required
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">E-Mail * (max. 128 Zeichen)</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                maxlength={128}
                placeholder="benutzer@example.com"
                className="app-form-input"
                required
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel position="stacked" className="app-form-label">Passwort * (min. 12 Zeichen)</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                placeholder="Sicheres Passwort"
                className="app-form-input"
                required
              />
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>Aktiv</IonLabel>
              <IonToggle checked={active} onIonChange={(e) => setActive(e.detail.checked)} />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

          <IonCard className="app-card" style={{ marginTop: '16px' }}>
        <IonCardHeader>
          <IonCardTitle>Rollen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
              <IonList lines="none" style={{ background: 'transparent' }}>
                <IonItem className="app-form-item">
                  <IonLabel position="stacked" className="app-form-label">Rolle *</IonLabel>
                  <IonSelect
                    value={selectedRoleId}
                    placeholder="Rolle auswählen"
                    interface="action-sheet"
                    okText="Fertig"
                    cancelText="Abbrechen"
                    onIonChange={(e) => setSelectedRoleId(e.detail.value as string)}
                  >
                    {availableRoles.map((role) => (
                      <IonSelectOption key={role.id} value={role.id}>
                        {getRoleLabel(role.name) ?? role.id}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          onClick={handleSubmit}
          expand="block"
          disabled={loading}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {loading ? 'Erstellt...' : 'Benutzer erstellen'}
        </IonButton>

        <IonButton
          routerLink="/app/admin/users"
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

export default AdminUserCreatePage;

