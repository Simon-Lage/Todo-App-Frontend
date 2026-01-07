import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonChip,
  IonLabel,
  IonIcon,
  IonButton,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { personCircleOutline, mailOutline, shieldCheckmarkOutline, logOutOutline } from 'ionicons/icons';
import { userService } from '../../../services/userService';
import { imageService } from '../../../services/imageService';
import type { UserView } from '../../../types/api';
import { useAuthSession } from '../../../routing/useAuthSession';
import { sessionStore } from '../../../services/sessionStore';
import { authService } from '../../../services/authService';
import { getRoleLabel } from '../../../config/roleLabels';
import { getErrorMessage } from '../../../utils/errorUtils';
import { toastService } from '../../../services/toastService';
import { API_BASE_URL } from '../../../config/apiConfig';

const AccountProfilePage: React.FC = () => {
  const history = useHistory();
  const { authSession, logout, refreshSession } = useAuthSession();
  const sessionUser = (authSession.user as UserView | null) ?? null;
  const [user, setUser] = useState<UserView | null>(sessionUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { user: currentUser } = await userService.getCurrentUser();
        setUser(currentUser);
        setAvatarUrl(null);
      } catch (err) {
        setError('Fehler beim Laden des Profils');
        const message = getErrorMessage(err);
        toastService.error(message);
        console.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    let revoke: string | null = null;

    const loadAvatar = async () => {
      const imageId = user?.profile_image_id ?? sessionUser?.profile_image_id;
      if (!imageId) {
        setAvatarUrl(null);
        return;
      }

      const validSession = await authService.ensureValidAccessToken();
      const token = validSession?.tokens?.access_token;
      if (!token) {
        setAvatarUrl(null);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/image/${imageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          revoke = url;
          setAvatarUrl(url);
          return;
        }

        if (res.status === 404 || res.status === 403 || res.status === 401) {
          try {
            const { user: refreshed } = await userService.getCurrentUser();
            if (refreshed.profile_image_id && refreshed.profile_image_id !== imageId) {
              setUser(refreshed);
              const retrySession = await authService.ensureValidAccessToken();
              const retryToken = retrySession?.tokens?.access_token ?? token;
              const retry = await fetch(`${API_BASE_URL}/image/${refreshed.profile_image_id}`, {
                headers: { Authorization: `Bearer ${retryToken}` },
              });
              if (retry.ok) {
                const blob = await retry.blob();
                const url = URL.createObjectURL(blob);
                revoke = url;
                setAvatarUrl(url);
                return;
              }
            }
          } catch {
            setAvatarUrl(null);
            return;
          }
        }

        setAvatarUrl(null);
      } catch {
        setAvatarUrl(null);
      }
    };

    void loadAvatar();

    return () => {
      if (revoke) {
        URL.revokeObjectURL(revoke);
      }
    };
  }, [user?.profile_image_id, sessionUser?.profile_image_id]);

  const handleLogout = async () => {
    try {
      await logout();
      history.replace('/auth/login');
    } catch (err) {
      console.error('Logout fehlgeschlagen', getErrorMessage(err));
    }
  };

  const displayName = (user?.name ?? sessionUser?.name ?? '').trim();
  const displayInitial = displayName !== '' ? displayName.charAt(0).toUpperCase() : '?';

  const handleAvatarClick = () => {
    if (uploadingAvatar) {
      return;
    }
    fileInputRef.current?.click();
  };

  const handleAvatarFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) {
      return;
    }

    const accountId = user?.id ?? sessionUser?.id ?? null;
    if (!accountId) {
      toastService.error('Profil konnte nicht geladen werden.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploaded = await imageService.uploadForUser(accountId, file, 'profile');
      const updatedUser = await userService.setProfileImage(uploaded.id);

      const currentSession = sessionStore.read();
      if (currentSession) {
        sessionStore.write({ ...currentSession, user: updatedUser });
      }

      setUser(updatedUser);
      setAvatarUrl(null);
      await refreshSession();
      toastService.success('Profilbild aktualisiert.');
    } catch (err) {
      toastService.error('Profilbild konnte nicht aktualisiert werden.');
      console.error(getErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Profil...</p>
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

  return (
    <IonContent className="app-page-content profile-page">
      <div className="page-header">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFileSelected}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          <IonAvatar
            onClick={handleAvatarClick}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: uploadingAvatar ? 'default' : 'pointer',
              opacity: uploadingAvatar ? 0.8 : 1,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profilbild"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--ion-color-secondary), var(--ion-color-tertiary))',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  borderRadius: '50%',
                }}
              >
                {uploadingAvatar ? (
                  <IonSpinner name="dots" style={{ width: '28px', height: '28px' }} />
                ) : (
                  displayInitial
                )}
              </div>
            )}
          </IonAvatar>
        </div>
        <h1 className="page-title" style={{ marginTop: '16px' }}>Mein Profil</h1>
        <p className="page-subtitle">Profilbild antippen zum Ändern</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Profildaten</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <div className="profile-field">
            <IonLabel className="app-form-label">
              <IonIcon icon={personCircleOutline} style={{ marginRight: '8px' }} />
              Name
            </IonLabel>
            <div className="profile-value">{user?.name ?? '-'}</div>
          </div>

          <div className="profile-field">
            <IonLabel className="app-form-label">
              <IonIcon icon={mailOutline} style={{ marginRight: '8px' }} />
              E-Mail
            </IonLabel>
            <div className="profile-value">{user?.email ?? '-'}</div>
          </div>
        </IonCardContent>
      </IonCard>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Account-Status</IonCardTitle>
        </IonCardHeader>
      <IonCardContent>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <IonChip color={user?.active ? 'success' : 'danger'}>
              <IonIcon icon={shieldCheckmarkOutline} />
              <IonLabel>{user?.active ? 'Aktiv' : 'Inaktiv'}</IonLabel>
            </IonChip>
            {(Array.isArray((user as any)?.roles) ? (user as any)?.roles : []).map((role: any) => (
              <IonChip key={role.id ?? role.name} color="primary">
                <IonLabel>{getRoleLabel(role.name) ?? role.id}</IonLabel>
              </IonChip>
            ))}
          </div>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 32px' }}>
        <IonButton expand="block" color="medium" onClick={handleLogout}>
          <IonIcon slot="start" icon={logOutOutline} />
          Abmelden
        </IonButton>
      </div>
    </IonContent>
  );
};

export default AccountProfilePage;
