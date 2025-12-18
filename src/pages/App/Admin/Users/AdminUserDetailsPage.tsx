import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonContent, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonItem, IonLabel, IonBadge, IonIcon, IonList, IonChip } from '@ionic/react';
import { createOutline, arrowBackOutline, personOutline } from 'ionicons/icons';
import { userService } from '../../../../services/userService';
import type { UserView } from '../../../../types/api';
import { useAuthSession } from '../../../../routing/useAuthSession';
import { getRoleLabel } from '../../../../config/roleLabels';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminUserDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const history = useHistory();
  const { authSession } = useAuthSession();
  const [user, setUser] = useState<UserView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = (authSession.user as { id?: string } | null)?.id ?? null;

  const isAdminAccount = (value: UserView): boolean =>
    value.roles.some((role) => (role.name ?? '').toLowerCase() === 'admin');

  const formatDate = (value: string | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('de-DE');
  };

  const formatDateTime = (value: string | null | undefined): string => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('de-DE');
  };

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
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

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

  if (error || !user) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error || 'Benutzer nicht gefunden'}</div>
      </IonContent>
    );
  }

	  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">{user.name}</h1>
        <p className="page-subtitle">Benutzerdetails</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Benutzerdetails</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList lines="none" style={{ background: 'transparent' }}>
            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Benutzer-ID</h3>
                <p>{user.id}</p>
              </IonLabel>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>E-Mail</h3>
                <p>{user.email}</p>
              </IonLabel>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Rollen</h3>
                <p>
	                  {user.roles.length > 0 ? (
	                    user.roles.map((role) => (
	                      <IonChip
	                        key={role.id}
	                        className="app-chip"
	                        color="secondary"
	                        onClick={() => history.push(`/app/admin/roles/${role.id}`)}
	                        style={{ cursor: 'pointer' }}
	                      >
	                        {getRoleLabel(role.name) ?? role.id}
	                      </IonChip>
	                    ))
	                  ) : (
                    '-'
                  )}
                </p>
              </IonLabel>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Status</h3>
                <p>
                  <IonBadge color={user.active ? 'success' : 'danger'}>
                    {user.active ? 'Aktiv' : 'Inaktiv'}
                  </IonBadge>
                </p>
              </IonLabel>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Registriert seit</h3>
                <p>{formatDate(user.created_at)}</p>
              </IonLabel>
            </IonItem>

            <IonItem className="app-form-item">
              <IonLabel>
                <h3>Temporäres Passwort</h3>
                <p>{user.is_password_temporary ? 'Ja' : 'Nein'}</p>
              </IonLabel>
            </IonItem>

            {user.is_password_temporary && (
              <IonItem className="app-form-item">
                <IonLabel>
                  <h3>Temporäres Passwort erstellt</h3>
                  <p>{formatDateTime(user.temporary_password_created_at)}</p>
                </IonLabel>
              </IonItem>
            )}

            {user.last_login_at && (
              <IonItem className="app-form-item">
                <IonLabel>
                  <h3>Letzter Login</h3>
                  <p>{formatDateTime(user.last_login_at)}</p>
                </IonLabel>
              </IonItem>
            )}
          </IonList>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isAdminAccount(user) && currentUserId !== user.id ? null : (
              <IonButton routerLink={`/app/admin/users/${user.id}/edit`} expand="block" className="app-button">
                <IonIcon slot="start" icon={createOutline} />
                Bearbeiten
              </IonButton>
            )}

            <IonButton routerLink="/app/admin/users" expand="block" fill="outline" className="app-button-secondary">
              <IonIcon slot="start" icon={arrowBackOutline} />
              Zurück zur Liste
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default AdminUserDetailsPage;

