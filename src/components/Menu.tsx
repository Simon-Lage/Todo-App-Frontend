import React, { useEffect, useMemo, useState } from "react";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonAvatar,
  IonImg,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import {
  homeOutline,
  homeSharp,
  listOutline,
  listSharp,
  briefcaseOutline,
  briefcaseSharp,
  searchOutline,
  searchSharp,
  personOutline,
  personSharp,
  shieldOutline,
  shieldSharp,
  logOutOutline,
  logOutSharp,
  checkmarkCircleOutline,
  checkmarkCircleSharp,
  peopleOutline,
  peopleSharp,
} from 'ionicons/icons';
import './Menu.css';
import { useAuthSession } from '../routing/useAuthSession';
import logoImg from '../assets/ChangeIT_logo_1500x480_WEI_BM.png';
import { menuController } from '@ionic/core';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
  requiredPermission?: string;
  rolesOnly?: string[];
}

const baseMainPages: AppPage[] = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    iosIcon: homeOutline,
    mdIcon: homeSharp,
  },
  {
    title: 'Meine Aufgaben',
    url: '/app/tasks/my',
    iosIcon: checkmarkCircleOutline,
    mdIcon: checkmarkCircleSharp,
  },
  {
    title: 'Projekte',
    url: '/app/project/list/all',
    iosIcon: briefcaseOutline,
    mdIcon: briefcaseSharp,
  },
  {
    title: 'Suche',
    url: '/app/search',
    iosIcon: searchOutline,
    mdIcon: searchSharp,
  },
];

const teamleadPages: AppPage[] = [
  {
    title: 'Teamleitung',
    url: '/app/lead',
    iosIcon: peopleOutline,
    mdIcon: peopleSharp,
    requiredPermission: 'perm_can_read_all_tasks',
  },
  {
    title: 'Team-Aufgaben',
    url: '/app/lead/tasks',
    iosIcon: listOutline,
    mdIcon: listSharp,
    requiredPermission: 'perm_can_read_all_tasks',
  },
];

const legacyAllTasksPage: AppPage = {
  title: 'Alle Aufgaben',
  url: '/app/tasks/all',
  iosIcon: listOutline,
  mdIcon: listSharp,
  requiredPermission: 'perm_can_read_all_tasks',
};

const accountPages: AppPage[] = [
  {
    title: 'Mein Profil',
    url: '/app/account/profile',
    iosIcon: personOutline,
    mdIcon: personSharp
  },
  {
    title: 'Admin-Bereich',
    url: '/app/admin',
    iosIcon: shieldOutline,
    mdIcon: shieldSharp,
    rolesOnly: ['admin']
  },
  {
    title: 'Abmelden',
    url: '/app/account/logout',
    iosIcon: logOutOutline,
    mdIcon: logOutSharp
  }
];

const Menu: React.FC = () => {
  const location = useLocation();
  const { authSession } = useAuthSession();
  const user = authSession.user as { name?: string } | null;
  const permissions = authSession.permissions ?? {};
  const roles = authSession.roles ?? [];
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [userRoles, setUserRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allowedPermissions = Object.entries(permissions)
      .filter(([, allowed]) => Boolean(allowed))
      .map(([permissionKey]) => permissionKey);
    setUserPermissions(new Set(allowedPermissions));
  }, [permissions]);

  useEffect(() => {
    if (roles) {
      setUserRoles(new Set(roles));
    }
  }, [roles]);

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return userPermissions.has(permission);
  };

  const hasRole = (role?: string): boolean => {
    if (!role) return true;
    return userRoles.has(role);
  };

  const isAdmin = hasRole('admin');
  const isTeamlead = hasPermission('perm_can_read_all_tasks');

  const visibleMainPages = useMemo(() => {
    if (isAdmin) return [];
    if (isTeamlead) return [...teamleadPages, ...baseMainPages];
    return [...baseMainPages, legacyAllTasksPage];
  }, [isAdmin, isTeamlead]);

  const visibleAccountPages = accountPages.filter((page) => {
    if (page.rolesOnly && !page.rolesOnly.every((role) => hasRole(role))) {
      return false;
    }
    return hasPermission(page.requiredPermission);
  });

  return (
    <IonMenu contentId="main" type="overlay" menuId="main-menu" swipeGesture={false}>
      <IonContent>
        {/* Header mit Logo und User-Info */}
        <div id="menu-header" className="menu-header">
          <div className="menu-header-logo">
            <IonImg
              src={logoImg}
              alt="ChangeIT Logo"
              style={{
                height: '48px',
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto 8px',
              }}
            />
          </div>
          {user && (
            <IonNote className="menu-user-note">
              {user.name}
            </IonNote>
          )}
        </div>

        {/* Haupt-Navigation */}
        <IonList id="main-list">
          <IonListHeader>Navigation</IonListHeader>
          {visibleMainPages.map((page, index) => {
            if (page.rolesOnly && !page.rolesOnly.every((role) => hasRole(role))) return null;
            if (!hasPermission(page.requiredPermission)) return null;
            
            return (
              <IonMenuToggle key={index} autoHide>
                <IonItem 
                  className={location.pathname === page.url ? 'selected' : ''} 
                  routerLink={page.url} 
                  routerDirection="root" 
                  lines="none" 
                  detail={false}
                  onClick={() => void menuController.close('main-menu')}
                >
                  <IonIcon aria-hidden="true" slot="start" ios={page.iosIcon} md={page.mdIcon} />
                  <IonLabel>{page.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Account & Admin */}
        <IonList id="account-list">
          <IonListHeader>Account</IonListHeader>
          {visibleAccountPages.map((page, index) => {
            return (
              <IonMenuToggle key={index} autoHide>
                <IonItem 
                  className={location.pathname === page.url ? 'selected' : ''} 
                  routerLink={page.url} 
                  routerDirection="root" 
                  lines="none" 
                  detail={false}
                  onClick={() => void menuController.close('main-menu')}
                >
                  <IonIcon aria-hidden="true" slot="start" ios={page.iosIcon} md={page.mdIcon} />
                  <IonLabel>{page.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
