import { ComponentType, lazy } from "react";
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const AppShellLayout = lazy(() => import('./layouts/AppShellLayout'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const ResetPasswordFlowPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordFlowPage'));
const ResetPasswordRequestPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordRequestPage'));
const ResetPasswordVerifyEmailPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordVerifyEmailPage'));
const ResetPasswordConfirmPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordConfirmPage'));
const DashboardPage = lazy(() => import('./pages/App/Dashboard/DashboardPage'));
const LeadHubPage = lazy(() => import('./pages/App/Lead/LeadHubPage'));
const LeadTeamTasksPage = lazy(() => import('./pages/App/Lead/LeadTeamTasksPage'));
const TaskMyListPage = lazy(() => import('./pages/App/Tasks/TaskMyListPage'));
const TaskAllListPage = lazy(() => import('./pages/App/Tasks/TaskAllListPage'));
const TaskCreatePage = lazy(() => import('./pages/App/Tasks/TaskCreatePage'));
const TaskDetailsPage = lazy(() => import('./pages/App/Tasks/TaskDetailsPage'));
const TaskEditPage = lazy(() => import('./pages/App/Tasks/TaskEditPage'));
const TaskImagesPage = lazy(() => import('./pages/App/Tasks/TaskImagesPage'));
const ProjectListPage = lazy(() => import('./pages/App/Projects/ProjectListPage'));
const ProjectCreatePage = lazy(() => import('./pages/App/Projects/ProjectCreatePage'));
const ProjectDetailsPage = lazy(() => import('./pages/App/Projects/ProjectDetailsPage'));
const ProjectEditPage = lazy(() => import('./pages/App/Projects/ProjectEditPage'));
const ProjectDeletePage = lazy(() => import('./pages/App/Projects/ProjectDeletePage'));
const ProjectTeamPage = lazy(() => import('./pages/App/Projects/ProjectTeamPage'));
const ProjectTasksPage = lazy(() => import('./pages/App/Projects/ProjectTasksPage'));
const ProjectTaskCreatePage = lazy(() => import('./pages/App/Projects/ProjectTaskCreatePage'));
const ProjectImagesPage = lazy(() => import('./pages/App/Projects/ProjectImagesPage'));
const GlobalSearchPage = lazy(() => import('./pages/App/Search/GlobalSearchPage'));
const AccountProfilePage = lazy(() => import('./pages/App/Account/AccountProfilePage'));
const AccountSecurityPage = lazy(() => import('./pages/App/Account/AccountSecurityPage'));
const LogoutPage = lazy(() => import('./pages/App/Account/LogoutPage'));
const AdminHubPage = lazy(() => import('./pages/App/Admin/AdminHubPage'));
const AdminUserListPage = lazy(() => import('./pages/App/Admin/Users/AdminUserListPage'));
const AdminUserCreatePage = lazy(() => import('./pages/App/Admin/Users/AdminUserCreatePage'));
const AdminUserDetailsPage = lazy(() => import('./pages/App/Admin/Users/AdminUserDetailsPage'));
const AdminUserEditPage = lazy(() => import('./pages/App/Admin/Users/AdminUserEditPage'));
const AdminLogsPage = lazy(() => import('./pages/App/Admin/Logs/AdminLogsPage'));
const AdminLogDetailsPage = lazy(() => import('./pages/App/Admin/Logs/AdminLogDetailsPage'));
const AdminRoleListPage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleListPage'));
const AdminRoleCreatePage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleCreatePage'));
const AdminRoleDetailsPage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleDetailsPage'));
const AdminRoleEditPage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleEditPage'));
const AdminRoleDeletePage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleDeletePage'));
const Error401Page = lazy(() => import('./pages/App/Errors/Error401Page'));
const Error403Page = lazy(() => import('./pages/App/Errors/Error403Page'));
const Error404Page = lazy(() => import('./pages/App/Errors/Error404Page'));
const Error500Page = lazy(() => import('./pages/App/Errors/Error500Page'));

export type RouteComponent = ComponentType<any>;

export type ProtectionRules = {
  userPermissionsRequired?: {
    or: string[];
    and: string[];
  };
  userRolesRequired?: {
    or: string[];
    and: string[];
  };
  hasToBeAuthenticated?: boolean;
  hasToBeNotAuthenticated?: boolean;
  ifAccessDeniedRedirectTo?: string;
};

export type RouteDefinition = {
  route: string;
  pageComponent?: RouteComponent;
  layout?: RouteComponent;
  onAccessRedirectTo?: string;
  pages?: RouteDefinition[];
  protectionRules?: ProtectionRules;
  mutations?: Array<{
    method: string;
    path: string;
  }>;
};

const routes: RouteDefinition[] = [
  {
    "route": "/auth",
    "layout": AuthLayout,
    "protectionRules": {
      "userPermissionsRequired": {
        "or": [],
        "and": []
      },
      "userRolesRequired": {
        "or": [],
        "and": []
      },
      "hasToBeNotAuthenticated": true,
      "ifAccessDeniedRedirectTo": "/app/dashboard"
    },
    "pages": [
      {
        "route": "/login",
        "pageComponent": LoginPage,
      },
      {
        "route": "/reset-password",
        "pageComponent": ResetPasswordFlowPage,
        "pages": [
          {
            "route": "/request",
            "pageComponent": ResetPasswordRequestPage,
          },
          {
            "route": "/verify-email",
            "pageComponent": ResetPasswordVerifyEmailPage,
          },
          {
            "route": "/confirm",
            "pageComponent": ResetPasswordConfirmPage,
          }
        ]
      }
    ]
  },
  {
    "route": "/app",
    "layout": AppShellLayout,
    "onAccessRedirectTo": "/app/dashboard",
    "protectionRules": {
      "userPermissionsRequired": {
        "or": [],
        "and": []
      },
      "userRolesRequired": {
        "or": [],
        "and": []
      },
      "hasToBeAuthenticated": true,
      "ifAccessDeniedRedirectTo": "/auth/login"
    },
    "pages": [
      {
        "route": "/dashboard",
        "pageComponent": DashboardPage,
      },
      {
        "route": "/lead",
        "pageComponent": LeadHubPage,
        "protectionRules": {
          "userPermissionsRequired": {
            "or": [],
            "and": ["perm_can_read_all_tasks"]
          },
          "ifAccessDeniedRedirectTo": "/app/dashboard"
        },
        "pages": [
          {
            "route": "/tasks",
            "pageComponent": LeadTeamTasksPage,
          }
        ]
      },
      {
        "route": "/tasks",
        "onAccessRedirectTo": "/app/tasks/my",
        "pages": [
          {
            "route": "/my",
            "pageComponent": TaskMyListPage,
          },
          {
            "route": "/all",
            "pageComponent": TaskAllListPage,
            "protectionRules": {
              "userPermissionsRequired": {
                "or": [
                  "perm_can_read_all_tasks"
                ],
                "and": []
              },
              "ifAccessDeniedRedirectTo": "/app/tasks/my"
            },
          },
          {
            "route": "/create",
            "pageComponent": TaskCreatePage,
            "protectionRules": {
              "userPermissionsRequired": {
                "or": [],
                "and": [
                  "perm_can_create_tasks"
                ]
              },
              "ifAccessDeniedRedirectTo": "/app/tasks/my"
            },
          },
          {
            "route": "/:taskId([0-9a-fA-F-]{36})",
            "pageComponent": TaskDetailsPage,
            "pages": [
              {
                "route": "/edit",
                "pageComponent": TaskEditPage,
              },
              {
                "route": "/images",
                "pageComponent": TaskImagesPage,
              },
            ]
          }
        ]
      },
      {
        "route": "/project",
        "onAccessRedirectTo": "/app/project/list/all",
        "pages": [
          {
            "route": "/list",
            "onAccessRedirectTo": "/app/project/list/all",
            "pages": [
              {
                "route": "/all",
                "pageComponent": ProjectListPage,
                "protectionRules": {
                  "userPermissionsRequired": {
                    "or": [
                      "perm_can_read_projects"
                    ],
                    "and": []
                  },
                  "ifAccessDeniedRedirectTo": "/app/project/list/my"
                },
              },
              {
                "route": "/my",
                "pageComponent": ProjectListPage
              }
            ]
          },
          {
            "route": "/create",
            "pageComponent": ProjectCreatePage,
            "protectionRules": {
              "userPermissionsRequired": {
                "or": [],
                "and": [
                  "perm_can_create_projects"
                ]
              },
              "ifAccessDeniedRedirectTo": "/app/project/list/all"
            },
          },
          {
            "route": "/:projectId([0-9a-fA-F-]{36})",
            "pageComponent": ProjectDetailsPage,
            "pages": [
              {
                "route": "/edit",
                "pageComponent": ProjectEditPage,
                "protectionRules": {
                  "userPermissionsRequired": {
                    "or": [],
                    "and": [
                      "perm_can_edit_projects"
                    ]
                  },
                  "ifAccessDeniedRedirectTo": "/app/project/:projectId"
                },
              },
              {
                "route": "/delete",
                "pageComponent": ProjectDeletePage,
                "protectionRules": {
                  "userPermissionsRequired": {
                    "or": [],
                    "and": [
                      "perm_can_delete_projects"
                    ]
                  },
                  "ifAccessDeniedRedirectTo": "/app/project/:projectId"
                },
              },
              {
                "route": "/team",
                "pageComponent": ProjectTeamPage,
                "protectionRules": {
                  "userPermissionsRequired": {
                    "or": [],
                    "and": [
                      "perm_can_read_user"
                    ]
                  },
                  "ifAccessDeniedRedirectTo": "/app/project/list"
                }
              },
              {
                "route": "/tasks",
                "pageComponent": ProjectTasksPage,
                "pages": [
                  {
                    "route": "/create",
                    "pageComponent": ProjectTaskCreatePage,
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [],
                        "and": [
                          "perm_can_create_tasks"
                        ]
                      },
                      "ifAccessDeniedRedirectTo": "/app/project/:projectId/tasks"
                    },
                  }
                ]
              },
              {
                "route": "/images",
                "pageComponent": ProjectImagesPage,
              }
            ]
          }
        ]
      },
      {
        "route": "/search",
        "pageComponent": GlobalSearchPage,
        "protectionRules": {
          "userPermissionsRequired": {
            "or": [
              "perm_can_read_user",
              "perm_can_read_projects",
              "perm_can_read_all_tasks",
              "perm_can_read_roles"
            ],
            "and": []
          },
          "ifAccessDeniedRedirectTo": "/app/dashboard"
        }
      },
      {
        "route": "/account",
        "onAccessRedirectTo": "/app/account/profile",
        "pages": [
          {
            "route": "/profile",
            "pageComponent": AccountProfilePage,
          },
          {
            "route": "/security",
            "pageComponent": AccountSecurityPage,
          },
          {
            "route": "/logout",
            "pageComponent": LogoutPage
          }
        ]
      },
      {
        "route": "/admin",
        "pageComponent": AdminHubPage,
        "protectionRules": {
          "userRolesRequired": {
            "or": ["admin"],
            "and": []
          },
          "ifAccessDeniedRedirectTo": "/app/dashboard"
        },
        "pages": [
          {
            "route": "/users",
            "pageComponent": AdminUserListPage,
            "pages": [
              {
                "route": "/create",
                "pageComponent": AdminUserCreatePage,
              },
              {
                "route": "/:userId",
                "pageComponent": AdminUserDetailsPage,
                "pages": [
                  {
                    "route": "/edit",
                    "pageComponent": AdminUserEditPage,
                  },
                ]
              }
            ]
          },
          {
            "route": "/roles",
            "pageComponent": AdminRoleListPage,
            "pages": [
              {
                "route": "/create",
                "pageComponent": AdminRoleCreatePage,
              },
              {
                "route": "/:roleId",
                "pageComponent": AdminRoleDetailsPage,
                "pages": [
                  {
                    "route": "/edit",
                    "pageComponent": AdminRoleEditPage,
                  },
                  {
                    "route": "/delete",
                    "pageComponent": AdminRoleDeletePage,
                  }
                ]
              }
            ]
          },
          {
            "route": "/logs",
            "pageComponent": AdminLogsPage,
            "pages": [
              {
                "route": "/:logId",
                "pageComponent": AdminLogDetailsPage,
              }
            ]
          }
        ]
      },
    ]
  },
  {
    "route": "/error",
    "pages": [
      {
        "route": "/401",
        "pageComponent": Error401Page
      },
      {
        "route": "/403",
        "pageComponent": Error403Page
      },
      {
        "route": "/404",
        "pageComponent": Error404Page
      },
      {
        "route": "/500",
        "pageComponent": Error500Page
      }
    ]
  }
];

export default routes;
