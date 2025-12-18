import React, { ReactNode, useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonMenuButton,
  IonIcon,
  IonFooter,
  IonAvatar,
} from '@ionic/react';
import { menuController } from '@ionic/core';
import { useLocation, useHistory } from 'react-router-dom';
import {
  homeOutline,
  checkmarkCircleOutline,
  briefcaseOutline,
  searchOutline,
  personOutline,
  menuOutline,
  listOutline,
  shieldOutline,
  peopleOutline,
  documentTextOutline,
  keyOutline,
} from 'ionicons/icons';
import { useAuthSession } from '../routing/useAuthSession';
import './AppShellLayout.css';
import { sessionStore } from '../services/sessionStore';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { UserView } from '../types/api';

type AppShellLayoutProps = {
  children?: ReactNode;
};

const AppShellLayout: React.FC<AppShellLayoutProps> = ({ children }) => {
  const location = useLocation();
  const history = useHistory();
  const { authSession } = useAuthSession();
  const user = authSession.user;
  const isAdmin = (authSession.roles ?? []).includes('admin');
  const isTeamlead =
    (authSession.roles ?? []).includes('teamlead') || Boolean(authSession.permissions?.['perm_can_read_all_tasks']);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const getTabSelected = () => {
    if (isAdmin) {
      if (location.pathname.startsWith('/app/admin/users')) return 'admin-users';
      if (location.pathname.startsWith('/app/admin/roles')) return 'admin-roles';
      if (location.pathname.startsWith('/app/admin/logs')) return 'admin-logs';
      if (location.pathname.startsWith('/app/admin')) return 'admin';
      return 'admin';
    }

    if (isTeamlead) {
      if (location.pathname.startsWith('/app/lead')) return 'lead';
      if (location.pathname.startsWith('/app/tasks')) return 'tasks';
      if (location.pathname.startsWith('/app/project')) return 'projects';
      if (location.pathname.startsWith('/app/account')) return 'account';
      if (location.pathname.startsWith('/app/search')) return 'search';
      if (location.pathname === '/app/dashboard') return 'dashboard';
      return '';
    }

    if (location.pathname === '/app/dashboard') return 'dashboard';
    if (location.pathname.startsWith('/app/tasks')) return 'tasks';
    if (location.pathname.startsWith('/app/project')) return 'projects';
    if (location.pathname.startsWith('/app/search')) return 'search';
    if (location.pathname.startsWith('/app/account') || location.pathname.startsWith('/app/admin')) return 'account';
    return '';
  };
  const navItems = isAdmin
    ? [
        { key: 'admin', label: 'Start', icon: homeOutline, link: '/app/admin' },
        { key: 'admin-users', label: 'Benutzer', icon: peopleOutline, link: '/app/admin/users' },
        { key: 'admin-roles', label: 'Rollen', icon: keyOutline, link: '/app/admin/roles' },
        { key: 'admin-logs', label: 'Logs', icon: documentTextOutline, link: '/app/admin/logs' },
      ]
    : isTeamlead
      ? [
          { key: 'lead', label: 'Team', icon: peopleOutline, link: '/app/lead/tasks' },
          { key: 'tasks', label: 'Meine', icon: checkmarkCircleOutline, link: '/app/tasks/my' },
          { key: 'projects', label: 'Projekte', icon: briefcaseOutline, link: '/app/project/list/all' },
          { key: 'account', label: 'Profil', icon: personOutline, link: '/app/account/profile' },
        ]
      : [
          { key: 'dashboard', label: 'Dashboard', icon: homeOutline, link: '/app/dashboard' },
          { key: 'tasks', label: 'Aufgaben', icon: checkmarkCircleOutline, link: '/app/tasks/my' },
          { key: 'projects', label: 'Projekte', icon: briefcaseOutline, link: '/app/project/list/all' },
          { key: 'search', label: 'Suche', icon: searchOutline, link: '/app/search' },
          { key: 'account', label: 'Profil', icon: personOutline, link: '/app/account/profile' },
        ];
  const activeTab = getTabSelected();
  useEffect(() => {
    menuController.enable(true, 'main-menu');
  }, []);

  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
  }, [location.pathname]);

  useEffect(() => {
    const ensureMenuClosed = async () => {
      await menuController.close('main-menu');
    };
    void ensureMenuClosed();
  }, [location.pathname]);

  useEffect(() => {
    let revokedUrl: string | null = null;
    const refreshProfile = async () => {
      try {
        const { user: freshUser, permissions } = await userService.getCurrentUser();
        const current = sessionStore.read();
        const next = current
          ? { ...current, user: freshUser, permissions }
          : { user: freshUser, permissions, roles: [], tokens: null };
        authService.setSession(next);
        return freshUser;
      } catch {
        return null;
      }
    };

    const loadAvatar = async () => {
      const imageId = (user as UserView)?.profile_image_id;
      if (!imageId) {
        setAvatarUrl(null);
        return;
      }

      const token = sessionStore.read()?.tokens?.access_token;
      if (!token) {
        setAvatarUrl(null);
        return;
      }

      try {
        const res = await fetch(`/api/image/${imageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          revokedUrl = url;
          setAvatarUrl(url);
          return;
        }

        if (res.status === 404 || res.status === 403 || res.status === 401) {
          const fresh = await refreshProfile();
          const freshImageId = (fresh as UserView | null)?.profile_image_id;
          if (freshImageId && freshImageId !== imageId) {
            const retry = await fetch(`/api/image/${freshImageId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (retry.ok) {
              const blob = await retry.blob();
              const url = URL.createObjectURL(blob);
              revokedUrl = url;
              setAvatarUrl(url);
              return;
            }
          }
        }

        setAvatarUrl(null);
      } catch {
        setAvatarUrl(null);
      }
    };

    void loadAvatar();

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton color="light" menu="main-menu" autoHide>
              <IonIcon slot="icon-only" icon={menuOutline} />
            </IonMenuButton>
          </IonButtons>

          <IonButtons slot="end">
            <IonButton
              onClick={() => {
                history.push('/app/search');
              }}
              color="light"
              fill="clear"
            >
              <IonIcon slot="icon-only" icon={searchOutline} />
            </IonButton>

            <IonButton routerLink="/app/account/profile" color="light" fill="clear">
              <IonAvatar className="header-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profilbild" />
                ) : (
                  <div className="avatar-fallback">
                    {(user as UserView)?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </IonAvatar>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {children}

      <IonFooter>
        <div className="app-footer-nav">
          {navItems.map((item) => (
            <IonButton
              key={item.key}
              routerLink={item.link}
              fill="clear"
              className={`app-footer-nav-btn ${activeTab === item.key ? 'active' : ''}`}
            >
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <IonIcon icon={item.icon} />
                <span>{item.label}</span>
              </span>
            </IonButton>
          ))}
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default AppShellLayout;
