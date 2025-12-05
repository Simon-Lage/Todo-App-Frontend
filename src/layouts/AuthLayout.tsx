import { IonContent, IonPage, IonImg, IonCard, IonCardContent } from '@ionic/react';
import React, { ReactNode } from 'react';
import logoImg from '../assets/ChangeIT_logo_1500x480_WEI_BM.png';
import './AuthLayout.css';

type AuthLayoutProps = {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <IonPage>
    <IonContent className="auth-layout-content" fullscreen>
      <div className="auth-layout-container">
        <div className="auth-layout-header">
          <IonImg 
            src={logoImg} 
            alt="ChangeIT Logo" 
            className="auth-layout-logo"
          />
          <h1 className="auth-layout-title">Todo-App</h1>
          {subtitle && <p className="auth-layout-subtitle">{subtitle}</p>}
        </div>
        
        <IonCard className="auth-layout-card">
          <IonCardContent className="auth-layout-card-content">
            {children}
          </IonCardContent>
        </IonCard>
        
        <div className="auth-layout-footer">
          <p>&copy; 2025 ChangeIT GmbH</p>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default AuthLayout;
