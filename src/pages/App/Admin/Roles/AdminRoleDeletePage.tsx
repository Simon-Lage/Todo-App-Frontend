import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonSpinner, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonIcon, IonText, useIonAlert } from '@ionic/react';
import { trashOutline, closeOutline } from 'ionicons/icons';
import { roleService } from '../../../../services/roleService';
import type { RoleView } from '../../../../types/api';
import { getRoleLabel } from '../../../../config/roleLabels';
import { getErrorMessage } from '../../../../utils/errorUtils';

const AdminRoleDeletePage: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [role, setRole] = useState<RoleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        setLoading(true);
        const roleData = await roleService.getById(roleId);
        setRole(roleData);
      } catch (err) {
        setError('Fehler beim Laden der Rolle');
        console.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, [roleId]);

  const handleDelete = async () => {
    if (!role) return;

    try {
      setDeleting(true);
      await roleService.delete(role.id);
      history.push('/app/admin/roles');
    } catch (err) {
      setError('Fehler beim Löschen der Rolle');
      console.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!role || deleting) return;

    const roleLabel = getRoleLabel(role.name) ?? role.name ?? role.id;
    presentAlert({
      header: 'Rolle löschen',
      message: `Möchten Sie die Rolle "${roleLabel}" wirklich löschen?`,
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            void handleDelete();
          },
        },
      ],
    });
  };

  if (loading) {
    return (
      <IonContent className="app-page-content">
        <div className="loading-container">
          <IonSpinner name="circular" />
          <p>Lade Rolle...</p>
        </div>
      </IonContent>
    );
  }

  if (error && !role) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Rolle löschen</h1>
        <p className="page-subtitle">Bestätigung erforderlich</p>
      </div>

      <IonCard className="app-card">
        <IonCardHeader>
          <IonCardTitle>Rolle löschen</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
            <IonText>
              <p>Möchten Sie die folgende Rolle wirklich löschen?</p>
              <h2 style={{ marginTop: '16px', marginBottom: '8px' }}>{getRoleLabel(role?.name) ?? role?.name}</h2>
              <p style={{ color: 'var(--ion-color-danger)', marginTop: '16px' }}>
                <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Benutzer, die diese Rolle haben, verlieren die zugehörigen Berechtigungen.
              </p>
            </IonText>

          {error && (
            <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>
          )}
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton
          onClick={confirmDelete}
          expand="block"
          color="danger"
          disabled={deleting}
          className="app-button"
        >
          <IonIcon slot="start" icon={trashOutline} />
          {deleting ? 'Löscht...' : 'Ja, Rolle löschen'}
        </IonButton>

        <IonButton
          routerLink={`/app/admin/roles/${roleId}`}
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

export default AdminRoleDeletePage;

