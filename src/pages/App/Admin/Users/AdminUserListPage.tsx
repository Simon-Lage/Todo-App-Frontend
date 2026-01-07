import React, { useEffect, useState } from 'react';
import { IonContent, IonSpinner, IonSearchbar, IonButton, IonIcon, IonChip, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { userService } from '../../../../services/userService';
import { roleService } from '../../../../services/roleService';
import PaginationControls from '../../../../components/PaginationControls';
import type { RoleView, UserListView } from '../../../../types/api';
import { useAuthSession } from '../../../../routing/useAuthSession';
import { getRoleLabel } from '../../../../config/roleLabels';
import { getErrorMessage } from '../../../../utils/errorUtils';
import { toastService } from '../../../../services/toastService';

const AdminUserListPage: React.FC = () => {
  const { authSession } = useAuthSession();
  const [users, setUsers] = useState<UserListView[]>([]);
  const [roles, setRoles] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const currentUserId = (authSession.user as { id?: string } | null)?.id ?? null;

  const isAdminAccount = (user: UserListView): boolean =>
    user.roles.some((role) => (role.name ?? '').toLowerCase() === 'admin');

  const getUserRoleRank = (user: UserListView): number => {
    const roleNames = user.roles.map((role) => (role.name ?? '').toLowerCase()).filter(Boolean);
    if (roleNames.includes('admin')) return 0;
    if (roleNames.includes('teamlead')) return 1;
    if (roleNames.includes('staff')) return 2;
    if (roleNames.includes('user')) return 3;
    return 4;
  };

  const sortedUsers = React.useMemo(() => {
    return [...users].sort((a, b) => {
      const rankDiff = getUserRoleRank(a) - getUserRoleRank(b);
      if (rankDiff !== 0) return rankDiff;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [users]);

  useEffect(() => {
    loadUsers();
  }, [offset, searchText, selectedRoleId]);

  useEffect(() => {
    if (offset !== 0) {
      setOffset(0);
    }
  }, [searchText, selectedRoleId]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await roleService.list({ limit: 200 });
        setRoles(response.items);
      } catch (err) {
        console.error(getErrorMessage(err));
      }
    };

    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.list(
        { q: searchText || undefined, role_id: selectedRoleId || undefined },
        { offset, limit, sort_by: 'created_at', direction: 'desc' }
      );
      setUsers(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Fehler beim Laden der Benutzer');
      const message = getErrorMessage(err);
      toastService.error(message);
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
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

  if (error) {
    return (
      <IonContent className="app-page-content">
        <div className="error-message">{error}</div>
      </IonContent>
    );
  }

  return (
    <IonContent className="app-page-content">
      <div className="page-header">
        <h1 className="page-title">Benutzerverwaltung</h1>
        <p className="page-subtitle">{total} Benutzer{total !== 1 ? '' : ''} gesamt</p>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Benutzer durchsuchen..."
          className="app-searchbar"
          debounce={300}
        />

        <IonItem lines="none" style={{ marginTop: '12px', borderRadius: '12px' }}>
          <IonLabel>Rolle</IonLabel>
            <IonSelect
            value={selectedRoleId}
            placeholder="Alle"
            onIonChange={(e) => setSelectedRoleId((e.detail.value as string) ?? '')}
            interface="popover"
          >
            <IonSelectOption value="">Alle</IonSelectOption>
            {roles.map((role) => (
              <IonSelectOption key={role.id} value={role.id}>
                {getRoleLabel(role.name) ?? role.id}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>Keine Benutzer gefunden</p>
        </div>
      ) : (
        <>
          <div className="admin-table" style={{ padding: '0 16px' }}>
            <div className="admin-table-header">
              <span>Name</span>
              <span>E-Mail</span>
              <span>Rollen</span>
              <span>Status</span>
              <span>Aktion</span>
            </div>
            {sortedUsers.map((user) => (
              <div className="admin-table-row" key={user.id}>
                <span>{user.name}</span>
                <span>{user.email}</span>
                <span>
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <IonChip key={role.id} className="app-chip" color="secondary">
                        {getRoleLabel(role.name) ?? role.id}
                      </IonChip>
                    ))
                  ) : (
                    '-'
                  )}
                </span>
                <span>{user.active ? 'Aktiv' : 'Inaktiv'}</span>
                <span>
                  {isAdminAccount(user) && currentUserId !== user.id ? (
                    <IonButton size="small" disabled fill="outline">
                      Geschützt
                    </IonButton>
                  ) : (
                    <IonButton size="small" routerLink={`/app/admin/users/${user.id}`} fill="outline">
                      Bearbeiten
                    </IonButton>
                  )}
                </span>
              </div>
            ))}
          </div>
          <PaginationControls
            offset={offset}
            limit={limit}
            total={total}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <div style={{ padding: '16px' }}>
        <IonButton routerLink="/app/admin/users/create" expand="block" className="app-button">
          <IonIcon slot="start" icon={addOutline} />
          Neuen Benutzer erstellen
        </IonButton>
      </div>
    </IonContent>
  );
};

export default AdminUserListPage;
