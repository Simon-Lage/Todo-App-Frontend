import React from "react";
import { ComponentType, FC, ReactElement, Suspense } from 'react';
import { Redirect, Route, RouteComponentProps } from 'react-router-dom';
import routes, { RouteDefinition } from '../routes';

type RegisteredRoute = {
  path: string;
  exact: boolean;
  pageComponent?: ComponentType<any>;
  layout?: ComponentType<any>;
  redirectTo?: string;
};

const normalizePath = (parentPath: string, segment: string): string => {
  if (segment === '*') {
    return '*';
  }

  const base = parentPath === '' ? '' : parentPath;
  const cleanedSegment = segment || '';

  if (!base || base === '/') {
    if (!cleanedSegment) {
      return '/';
    }
    if (cleanedSegment.startsWith('/')) {
      return cleanedSegment === '/' ? '/' : cleanedSegment;
    }
    return `/${cleanedSegment}`;
  }

  if (cleanedSegment === '/' || !cleanedSegment) {
    return base;
  }

  if (cleanedSegment.startsWith('/')) {
    return `${base}${cleanedSegment}`;
  }

  return `${base}/${cleanedSegment}`;
};

const flattenRoutes = (
  nodes: RouteDefinition[],
  parentPath = '',
  inheritedLayout?: ComponentType<any>
): RegisteredRoute[] => {
  return nodes.flatMap((node) => {
    const path = normalizePath(parentPath, node.route);
    const layout = node.layout ?? inheritedLayout;
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
      });
    }

    if (hasRedirect && node.onAccessRedirectTo) {
      entries.push({
        path,
        exact: path !== '*',
        redirectTo: node.onAccessRedirectTo,
      });
    }

    if (node.pages?.length) {
      entries.push(...flattenRoutes(node.pages, path, layout));
    }

    return entries;
  });
};

const registeredRoutes = flattenRoutes(routes);

const renderPage = (
  PageComponent: ComponentType<any>,
  LayoutComponent: ComponentType<any> | undefined,
  routeProps: RouteComponentProps<any>
): ReactElement => {
  const page = <PageComponent {...routeProps} />;
  return LayoutComponent ? <LayoutComponent>{page}</LayoutComponent> : page;
};

const AppRoutes: FC = () => (
  <>
    {registeredRoutes.map((route, index) => {
      if (route.redirectTo) {
        return (
          <Route
            key={`redirect-${route.path}-${index}`}
            exact={route.exact}
            path={route.path}
            render={() => <Redirect to={route.redirectTo!} />}
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
          render={(routeProps) => (
            <Suspense fallback={null}>
              {renderPage(route.pageComponent!, route.layout, routeProps)}
            </Suspense>
          )}
        />
      );
    })}
  </>
);

export default AppRoutes;
