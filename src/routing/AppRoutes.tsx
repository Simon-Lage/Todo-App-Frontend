import React from "react";
import { ComponentType, FC, ReactElement, Suspense } from 'react';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';
import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import routes, { ProtectionRules, RouteDefinition } from '../routes';
import { useAuthSession, AuthSession } from './useAuthSession';
import Menu from '../components/Menu';

type RegisteredRoute = {
  path: string;
  exact: boolean;
  pageComponent?: ComponentType<any>;
  layout?: ComponentType<any>;
  redirectTo?: string;
  protectionRules?: ProtectionRules;
};

const normalizePath = (parentPath: string, segment: string): string => {
  if (segment === '*') {
    return '*';
  }

  const base = parentPath === '' ? '' : parentPath;
  const cleanedSegment = segment || '';

  if (segment.startsWith('/') && parentPath !== '') {
  }

  const cleanParent = base === '/' ? '' : base;
  const cleanSeg = cleanedSegment.startsWith('/') ? cleanedSegment : `/${cleanedSegment}`;
  
  return `${cleanParent}${cleanSeg}`.replace('//', '/');
};

const mergeProtectionRules = (
  parent?: ProtectionRules,
  child?: ProtectionRules
): ProtectionRules | undefined => {
  if (!parent) return child;
  if (!child) return parent;

  return {
    hasToBeAuthenticated: Boolean(parent.hasToBeAuthenticated || child.hasToBeAuthenticated),
    hasToBeNotAuthenticated: Boolean(parent.hasToBeNotAuthenticated || child.hasToBeNotAuthenticated),
    ifAccessDeniedRedirectTo: child.ifAccessDeniedRedirectTo ?? parent.ifAccessDeniedRedirectTo,
    userPermissionsRequired: {
      or: [...(parent.userPermissionsRequired?.or ?? []), ...(child.userPermissionsRequired?.or ?? [])],
      and: [...(parent.userPermissionsRequired?.and ?? []), ...(child.userPermissionsRequired?.and ?? [])],
    },
    userRolesRequired: {
      or: [...(parent.userRolesRequired?.or ?? []), ...(child.userRolesRequired?.or ?? [])],
      and: [...(parent.userRolesRequired?.and ?? []), ...(child.userRolesRequired?.and ?? [])],
    },
  };
};

const flattenRoutes = (
  nodes: RouteDefinition[],
  parentPath = '',
  inheritedLayout?: ComponentType<any>,
  inheritedProtectionRules?: ProtectionRules
): RegisteredRoute[] => {
  return nodes.flatMap((node) => {
    const path = normalizePath(parentPath, node.route);
    const layout = node.layout ?? inheritedLayout;
    const protectionRules = mergeProtectionRules(inheritedProtectionRules, node.protectionRules);
    const entries: RegisteredRoute[] = [];
    const hasPageComponent = Boolean(node.pageComponent);
    const hasRedirect = Boolean(node.onAccessRedirectTo);

    if (hasPageComponent && hasRedirect) {
      throw new Error(`Route ${path} cannot define both pageComponent and onAccessRedirectTo.`);
    }

    if (hasPageComponent && node.pageComponent) {
      entries.push({
        path,
        exact: path !== '*',
        pageComponent: node.pageComponent,
        layout,
        protectionRules,
      });
    }

    if (hasRedirect && node.onAccessRedirectTo) {
      entries.push({
        path,
        exact: path !== '*',
        redirectTo: node.onAccessRedirectTo,
        protectionRules,
      });
    }

    if (node.pages?.length) {
      entries.push(...flattenRoutes(node.pages, path, layout, protectionRules));
    }

    return entries;
  });
};

const registeredRoutes = flattenRoutes(routes);

const getDefaultAppRedirect = (auth: AuthSession): string => {
  const roles = auth.roles ?? [];
  if (roles.includes('admin')) return '/app/admin';
  if (roles.includes('teamlead') || Boolean(auth.permissions?.['perm_can_read_all_tasks'])) return '/app/lead/tasks';
  return '/app/dashboard';
};

const renderPage = (
  PageComponent: ComponentType<any>,
  LayoutComponent: ComponentType<any> | undefined,
  routeProps: RouteComponentProps<any>
): ReactElement => {
  const page = <PageComponent {...routeProps} />;
  return LayoutComponent ? <LayoutComponent>{page}</LayoutComponent> : page;
};

const evaluateProtection = (rules: ProtectionRules | undefined, auth: AuthSession) => {
  if (!rules) {
    return { allowed: true };
  }

  if (rules.hasToBeAuthenticated && !auth.isAuthenticated) {
    return { allowed: false, redirectTo: rules.ifAccessDeniedRedirectTo ?? '/auth/login' };
  }

  if (rules.hasToBeNotAuthenticated && auth.isAuthenticated) {
    return { allowed: false, redirectTo: getDefaultAppRedirect(auth) };
  }

  if (rules.userPermissionsRequired) {
    const { or = [], and = [] } = rules.userPermissionsRequired;
    const orSatisfied = or.length === 0 || or.some((permission) => Boolean(auth.permissions?.[permission]));
    const andSatisfied = and.length === 0 || and.every((permission) => Boolean(auth.permissions?.[permission]));

    if (!orSatisfied || !andSatisfied) {
      return { allowed: false, redirectTo: rules.ifAccessDeniedRedirectTo };
    }
  }

  if (rules.userRolesRequired) {
    const { or = [], and = [] } = rules.userRolesRequired;
    const roles = auth.roles ?? [];
    const orSatisfied = or.length === 0 || or.some((role) => roles.includes(role));
    const andSatisfied = and.length === 0 || and.every((role) => roles.includes(role));

    if (!orSatisfied || !andSatisfied) {
      return { allowed: false, redirectTo: rules.ifAccessDeniedRedirectTo };
    }
  }

  return { allowed: true };
};

const AppRoutes: FC = () => {
  const { authSession, loading } = useAuthSession();

  const renderOutlet = (
    <IonRouterOutlet id="main" key={loading ? 'loading' : 'loaded'}>
      <Route
        exact
        path="/"
        render={() => <Redirect to={loading ? '/app/dashboard' : (authSession.isAuthenticated ? getDefaultAppRedirect(authSession) : '/auth/login')} />}
      />

      {loading ? (
        <Route path="*" render={() => <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Lädt...</div>} />
      ) : (
        [
          ...registeredRoutes
            .map((route, index) => {
              if (route.redirectTo) {
                return (
                  <Route
                    key={`redirect-${route.path}-${index}`}
                    exact={route.exact}
                    path={route.path}
                    render={() => {
                      const guard = evaluateProtection(route.protectionRules, authSession);
                      if (!guard.allowed) {
                        return <Redirect to={guard.redirectTo ?? '/error/403'} />;
                      }

                      return <Redirect to={route.redirectTo!} />;
                    }}
                  />
                );
              }

              if (!route.pageComponent) {
                return null;
              }

              return (
                <Route
                  key={`page-${route.path}-${index}`}
                  exact={route.exact}
                  path={route.path}
                  render={(routeProps) => {
                    const guard = evaluateProtection(route.protectionRules, authSession);

                    if (!guard.allowed) {
                      return <Redirect to={guard.redirectTo ?? '/error/403'} />;
                    }

                    return (
                      <Suspense fallback={<div>Loading Page...</div>}>
                        {renderPage(route.pageComponent!, route.layout, routeProps)}
                      </Suspense>
                    );
                  }}
                />
              );
            })
            .filter((route): route is ReactElement => route !== null),
          <Route
            key="fallback-route"
            render={() =>
              authSession.isAuthenticated ? <Redirect to={getDefaultAppRedirect(authSession)} /> : <Redirect to="/auth/login" />
            }
          />
        ]
      )}
    </IonRouterOutlet>
  );

  return (
    <IonSplitPane contentId="main">
      <Menu />
      {renderOutlet}
    </IonSplitPane>
  );
};

export default AppRoutes;
