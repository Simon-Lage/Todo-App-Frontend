import React, { useEffect, useState } from 'react';
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
} from '@ionic/react';
import { personCircleOutline, mailOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { userService } from '../../../services/userService';
import type { UserView } from '../../../types/api';

const AccountProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { user: currentUser } = await userService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError('Fehler beim Laden des Profils');
        console.error(err?.message || err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          <IonAvatar style={{ width: '80px', height: '80px' }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--ion-color-secondary), var(--ion-color-tertiary))',
              fontSize: '36px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </IonAvatar>
        </div>
        <h1 className="page-title" style={{ marginTop: '16px' }}>Mein Profil</h1>
        <p className="page-subtitle">Verwalten Sie Ihre persönlichen Daten</p>
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
                <IonLabel>{role.name ?? role.id}</IonLabel>
              </IonChip>
            ))}
          </div>
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default AccountProfilePage;
