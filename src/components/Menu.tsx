import React, { useEffect, useState } from "react";
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
} from 'ionicons/icons';
import './Menu.css';
import { useAuthSession } from '../routing/useAuthSession';
import logoImg from '../assets/ChangeIT_logo_1500x480_WEI_BM.png';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
  requiredPermission?: string;
}

const mainPages: AppPage[] = [
  {
    title: 'Dashboard',
    url: '/app/dashboard',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'Meine Aufgaben',
    url: '/app/tasks/my',
    iosIcon: checkmarkCircleOutline,
    mdIcon: checkmarkCircleSharp
  },
  {
    title: 'Alle Aufgaben',
    url: '/app/tasks/all',
    iosIcon: listOutline,
    mdIcon: listSharp,
    requiredPermission: 'perm_can_read_tasks_all'
  },
  {
    title: 'Projekte',
    url: '/app/project/list/all',
    iosIcon: briefcaseOutline,
    mdIcon: briefcaseSharp
  },
  {
    title: 'Suche',
    url: '/app/search',
    iosIcon: searchOutline,
    mdIcon: searchSharp
  }
];

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
    requiredPermission: 'perm_can_read_user'
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
  const { user, permissions } = useAuthSession();
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (permissions) {
      setUserPermissions(new Set(permissions));
    }
  }, [permissions]);

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true;
    return userPermissions.has(permission);
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        {/* Header mit Logo und User-Info */}
        <IonList id="menu-header">
          <IonListHeader>
            <IonImg src={logoImg} alt="ChangeIT Logo" style={{ maxHeight: '40px', marginBottom: '8px' }} />
          </IonListHeader>
          {user && (
            <IonNote style={{ padding: '0 16px', marginBottom: '16px' }}>
              {user.name}
            </IonNote>
          )}
        </IonList>

        {/* Haupt-Navigation */}
        <IonList id="main-list">
          <IonListHeader>Navigation</IonListHeader>
          {mainPages.map((page, index) => {
            if (!hasPermission(page.requiredPermission)) return null;
            
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem 
                  className={location.pathname === page.url ? 'selected' : ''} 
                  routerLink={page.url} 
                  routerDirection="none" 
                  lines="none" 
                  detail={false}
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
          {accountPages.map((page, index) => {
            if (!hasPermission(page.requiredPermission)) return null;
            
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem 
                  className={location.pathname === page.url ? 'selected' : ''} 
                  routerLink={page.url} 
                  routerDirection="none" 
                  lines="none" 
                  detail={false}
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
