import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonFooter,
  IonAvatar,
  IonSplitPane,
  IonSearchbar,
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  homeOutline,
  checkmarkCircleOutline,
  briefcaseOutline,
  searchOutline,
  personOutline,
  closeOutline,
} from 'ionicons/icons';
import { useAuthSession } from '../routing/useAuthSession';
import Menu from '../components/Menu';
import './AppShellLayout.css';
import { sessionStore } from '../services/sessionStore';
import { UserView } from '../types/api';

type AppShellLayoutProps = {
  children?: ReactNode;
};

const AppShellLayout: React.FC<AppShellLayoutProps> = ({ children }) => {
  const location = useLocation();
  const history = useHistory();
  const { authSession } = useAuthSession();
  const user = authSession.user;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const getTabSelected = () => {
    if (location.pathname === '/app/dashboard') return 'dashboard';
    if (location.pathname.startsWith('/app/tasks')) return 'tasks';
    if (location.pathname.startsWith('/app/project')) return 'projects';
    if (location.pathname.startsWith('/app/search')) return 'search';
    if (location.pathname.startsWith('/app/account') || location.pathname.startsWith('/app/admin')) return 'account';
    return '';
  };
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: homeOutline, link: '/app/dashboard' },
    { key: 'tasks', label: 'Aufgaben', icon: checkmarkCircleOutline, link: '/app/tasks/my' },
    { key: 'projects', label: 'Projekte', icon: briefcaseOutline, link: '/app/project/list/all' },
    { key: 'search', label: 'Suche', icon: searchOutline, link: '/app/search' },
    { key: 'account', label: 'Profil', icon: personOutline, link: '/app/account/profile' },
  ];
  const activeTab = getTabSelected();
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.setFocus();
    }
  }, [searchOpen]);

  useEffect(() => {
    let revokedUrl: string | null = null;
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
        if (!res.ok) {
          setAvatarUrl(null);
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        revokedUrl = url;
        setAvatarUrl(url);
      } catch (err) {
        console.warn('Avatar laden fehlgeschlagen', err);
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

  const triggerSearch = () => {
    const term = searchValue.trim();
    setSearchOpen(false);
    if (term) {
      history.push(`/app/search?q=${encodeURIComponent(term)}`);
    } else {
      history.push('/app/search');
    }
  };

  return (
    <IonSplitPane contentId="main">
      <Menu />
      
      <IonPage id="main">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>

            <div className={`header-search ${searchOpen ? 'open' : ''}`}>
              {searchOpen && (
                <>
                  <IonSearchbar
                    ref={searchRef}
                    value={searchValue}
                    onIonChange={(e) => setSearchValue(e.detail.value ?? '')}
                    debounce={200}
                    placeholder="Suche"
                    showCancelButton="never"
                    className="header-searchbar"
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        triggerSearch();
                      }
                    }}
                  />
                  <IonButtons>
                    <IonButton onClick={triggerSearch}>
                      <IonIcon slot="icon-only" icon={searchOutline} />
                    </IonButton>
                    <IonButton onClick={() => setSearchOpen(false)}>
                      <IonIcon slot="icon-only" icon={closeOutline} />
                    </IonButton>
                  </IonButtons>
                </>
              )}
            </div>
            
            <IonButtons slot="end">
              {!searchOpen && (
                <IonButton onClick={() => setSearchOpen(true)}>
                  <IonIcon slot="icon-only" icon={searchOutline} />
                </IonButton>
              )}
              
              <IonButton routerLink="/app/account/profile">
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
                <IonIcon icon={item.icon} />
                <span>{item.label}</span>
              </IonButton>
            ))}
          </div>
        </IonFooter>
      </IonPage>
    </IonSplitPane>
  );
};

export default AppShellLayout;
