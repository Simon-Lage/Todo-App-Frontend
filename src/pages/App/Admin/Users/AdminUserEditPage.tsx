import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonToggle, IonList, IonSelect, IonSelectOption, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { userService } from '../../../../services/userService';
import { roleService } from '../../../../services/roleService';
import type { UserView, RoleView } from '../../../../types/api';
import { useAuthSession } from '../../../../routing/useAuthSession';
import { getRoleLabel } from '../../../../config/roleLabels';
import { toastService } from '../../../../services/toastService';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminUserEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  const { authSession } = useAuthSession();
  const [user, setUser] = useState<UserView | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [availableRoles, setAvailableRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForbidden, setEditForbidden] = useState(false);
  const [initialState, setInitialState] = useState<{
    name: string;
    email: string;
    active: boolean;
    roleId: string;
  } | null>(null);
  const currentUserId = (authSession.user as { id?: string } | null)?.id ?? null;
  const isAdminAccount = (value: UserView): boolean =>
    value.roles.some((role) => (role.name ?? '').toLowerCase() === 'admin');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [userData, rolesResponse, userRoles] = await Promise.all([
          userService.getById(userId),
          roleService.list({ limit: 100 }),
          roleService.getByUser(userId)
        ]);

        if (isAdminAccount(userData) && currentUserId !== userData.id) {
          setUser(userData);
          setEditForbidden(true);
          setError('Administratoren können nur ihr eigenes Konto bearbeiten');
          return;
        }

        setUser(userData);
        setName(userData.name);
        setEmail(userData.email);
        setActive(userData.active);
        setAvailableRoles(rolesResponse.items);
        const initialRole = userRoles[0]?.id ?? '';
        setSelectedRoleId(initialRole);
        setInitialState({
          name: userData.name,
          email: userData.email,
          active: userData.active,
          roleId: initialRole,
        });
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleSubmit = async () => {
    if (!name || !email) {
      toastService.error('Name und E-Mail sind Pflichtfelder');
      return;
    }

    if (!selectedRoleId) {
      toastService.error('Bitte genau eine Rolle auswählen');
      return;
    }

    try {
      setSaving(true);
      await userService.updateAdmin(userId, {
        name,
        email,
        active,
        roles: [selectedRoleId],
      });
      history.push(`/app/admin/users/${userId}`);
    } catch (err) {
      toastService.error('Fehler beim Speichern');
      console.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = initialState
    ? (
      name !== initialState.name ||
      email !== initialState.email ||
      active !== initialState.active ||
      selectedRoleId !== initialState.roleId
    )
    : true;

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Benutzer...</p>
        </div>
      </IonContent>
    );
  }

  if (error && !user) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  if (editForbidden) {
    return (
      <IonContent className="app-page-content">
        <div className="page-header">
          <h1 className="page-title">Benutzer bearbeiten</h1>
          <p className="page-subtitle">Zugriff verweigert</p>
        </div>
        <div className="error-message">{error}</div>
        <div style={{ padding: '0 16px 16px' }}>
          <IonButton routerLink={`/app/admin/users/${userId}`} expand="block" fill="outline" className="app-button-secondary">
            <IonIcon slot="start" icon={closeOutline} />
            Zurück
          </IonButton>
        </div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Benutzer bearbeiten</h1>
        <p className="page-subtitle">Ändern Sie die Benutzerdetails</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

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
          disabled={saving || !hasChanges}
          className="app-button"
        >
          <IonIcon slot="start" icon={saveOutline} />
          {saving ? 'Speichert...' : 'Speichern'}
        </IonButton>

        <IonButton
          routerLink={`/app/admin/users/${userId}`}
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

export default AdminUserEditPage;

