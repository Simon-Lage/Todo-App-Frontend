import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonInput, IonButton, IonItem, IonLabel, IonSpinner, IonToggle, IonList, IonCheckbox, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editForbidden, setEditForbidden] = useState(false);
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
        setSelectedRoles(userRoles.map(r => r.id));
      } catch (err) {
        setError('Fehler beim Laden der Daten');
        console.error(getErrorMessage(err));
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
      toastService.error('Name und E-Mail sind Pflichtfelder');
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
      toastService.error('Fehler beim Speichern');
      console.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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
            {availableRoles.map((role) => (
              <IonItem key={role.id} className="app-form-item">
                <IonLabel>{getRoleLabel(role.name) ?? role.id}</IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={selectedRoles.includes(role.id)}
                  onIonChange={(e) => handleRoleToggle(role.id, e.detail.checked)}
                />
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          onClick={handleSubmit}
          expand="block"
          disabled={saving}
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

