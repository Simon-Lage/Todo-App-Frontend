import { ComponentType, lazy } from "react";

export type RouteComponent = ComponentType<any>;

export type RouteDefinition = {
  route: string;
  pageComponent?: RouteComponent;
  layout?: RouteComponent;
  onAccessRedirectTo?: string;
  pages?: RouteDefinition[];
  protectionRules?: Record<string, unknown>;
  mutations?: Array<{
    method: string;
    path: string;
  }>;
};

const AuthLayout = lazy(() => import('./layouts/AuthLayout'));
const AppShellLayout = lazy(() => import('./layouts/AppShellLayout'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const ResetPasswordFlowPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordFlowPage'));
const ResetPasswordRequestPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordRequestPage'));
const ResetPasswordVerifyEmailPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordVerifyEmailPage'));
const ResetPasswordConfirmPage = lazy(() => import('./pages/Auth/ResetPassword/ResetPasswordConfirmPage'));
const AppRootPage = lazy(() => import('./pages/App/AppRootPage'));
const DashboardPage = lazy(() => import('./pages/App/Dashboard/DashboardPage'));
const TaskOverviewPage = lazy(() => import('./pages/App/Tasks/TaskOverviewPage'));
const TaskMyListPage = lazy(() => import('./pages/App/Tasks/TaskMyListPage'));
const TaskAllListPage = lazy(() => import('./pages/App/Tasks/TaskAllListPage'));
const TaskCreatePage = lazy(() => import('./pages/App/Tasks/TaskCreatePage'));
const TaskDetailsPage = lazy(() => import('./pages/App/Tasks/TaskDetailsPage'));
const TaskEditPage = lazy(() => import('./pages/App/Tasks/TaskEditPage'));
const TaskAssignUserPage = lazy(() => import('./pages/App/Tasks/TaskAssignUserPage'));
const TaskMoveToProjectPage = lazy(() => import('./pages/App/Tasks/TaskMoveToProjectPage'));
const TaskImagesPage = lazy(() => import('./pages/App/Tasks/TaskImagesPage'));
const TaskUnassignUserPage = lazy(() => import('./pages/App/Tasks/TaskUnassignUserPage'));
const TaskDeletePage = lazy(() => import('./pages/App/Tasks/TaskDeletePage'));
const ProjectOverviewPage = lazy(() => import('./pages/App/Projects/ProjectOverviewPage'));
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
const AccountAreaPage = lazy(() => import('./pages/App/Account/AccountAreaPage'));
const AccountProfilePage = lazy(() => import('./pages/App/Account/AccountProfilePage'));
const AccountSecurityPage = lazy(() => import('./pages/App/Account/AccountSecurityPage'));
const LogoutPage = lazy(() => import('./pages/App/Account/LogoutPage'));
const AdminHubPage = lazy(() => import('./pages/App/Admin/AdminHubPage'));
const AdminUserListPage = lazy(() => import('./pages/App/Admin/Users/AdminUserListPage'));
const AdminUserCreatePage = lazy(() => import('./pages/App/Admin/Users/AdminUserCreatePage'));
const AdminUserDetailsPage = lazy(() => import('./pages/App/Admin/Users/AdminUserDetailsPage'));
const AdminUserEditPage = lazy(() => import('./pages/App/Admin/Users/AdminUserEditPage'));
const AdminUserStatusPage = lazy(() => import('./pages/App/Admin/Users/AdminUserStatusPage'));
const AdminUserRolesPage = lazy(() => import('./pages/App/Admin/Users/AdminUserRolesPage'));
const AdminLogsPage = lazy(() => import('./pages/App/Admin/Logs/AdminLogsPage'));
const AdminLogDetailsPage = lazy(() => import('./pages/App/Admin/Logs/AdminLogDetailsPage'));
const AdminRoleListPage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleListPage'));
const AdminRoleCreatePage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleCreatePage'));
const AdminRoleDetailsPage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleDetailsPage'));
const AdminRoleEditPage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleEditPage'));
const AdminRoleDeletePage = lazy(() => import('./pages/App/Admin/Roles/AdminRoleDeletePage'));
const SystemStatusPage = lazy(() => import('./pages/App/System/SystemStatusPage'));
const Error401Page = lazy(() => import('./pages/App/Errors/Error401Page'));
const Error403Page = lazy(() => import('./pages/App/Errors/Error403Page'));
const Error404Page = lazy(() => import('./pages/App/Errors/Error404Page'));
const Error500Page = lazy(() => import('./pages/App/Errors/Error500Page'));

const routes: RouteDefinition[] = [
  {
    "route": "/",
    "onAccessRedirectTo": "/app/dashboard",
    "pages": [
      {
        "route": "auth",
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
            "route": "/register",
            "pageComponent": RegisterPage,
          },
          {
            "route": "/reset-password",
            "pageComponent": ResetPasswordFlowPage,
            "onAccessRedirectTo": "/auth/reset-password/request",
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
        "route": "app",
        "layout": AppShellLayout,
        "pageComponent": AppRootPage,
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
            "route": "/tasks",
            "pageComponent": TaskOverviewPage,
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
                "route": "/:taskId",
                "pageComponent": TaskDetailsPage,


                "pages": [
                  {
                    "route": "/edit",
                    "pageComponent": TaskEditPage,
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [],
                        "and": [
                          "perm_can_edit_tasks"
                        ]
                      },
                      "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                    },


                  },
                  {
                    "route": "/assign-user",
                    "pageComponent": TaskAssignUserPage,
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [
                          "perm_can_assign_tasks_to_user"
                        ],
                        "and": []
                      },
                      "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                    },


                  },
                  {
                    "route": "/move-to-project",
                    "pageComponent": TaskMoveToProjectPage,
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [
                          "perm_can_assign_tasks_to_project"
                        ],
                        "and": []
                      },
                      "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                    },


                  },
                  {
                    "route": "/images",
                    "pageComponent": TaskImagesPage,


                  },
                  {
                    "route": "/unassign-user",
                    "pageComponent": TaskUnassignUserPage,
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [
                          "perm_can_assign_tasks_to_user"
                        ],
                        "and": []
                      },
                      "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                    },


                  },
                  {
                    "route": "/delete",
                    "pageComponent": TaskDeletePage,
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [],
                        "and": [
                          "perm_can_delete_tasks"
                        ]
                      },
                      "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                    },

                  }
                ]
              }
            ]
          },
          {
            "route": "/projects",
            "pageComponent": ProjectOverviewPage,
            "onAccessRedirectTo": "/app/projects/list",
            "protectionRules": {
              "userPermissionsRequired": {
                "or": [
                  "perm_can_read_projects"
                ],
                "and": []
              },
              "ifAccessDeniedRedirectTo": "/app/dashboard"
            },
            "pages": [
              {
                "route": "/list",
                "pageComponent": ProjectListPage,
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
                  "ifAccessDeniedRedirectTo": "/app/projects/list"
                },


              },
              {
                "route": "/:projectId",
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
                      "ifAccessDeniedRedirectTo": "/app/projects/:projectId"
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
                      "ifAccessDeniedRedirectTo": "/app/projects/:projectId"
                    },

                  },
                  {
                    "route": "/team",
                    "pageComponent": ProjectTeamPage,

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
                          "ifAccessDeniedRedirectTo": "/app/projects/:projectId/tasks"
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

          },
          {
            "route": "/account",
            "pageComponent": AccountAreaPage,
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
                "pageComponent": LogoutPage,

                "onAccessRedirectTo": "/auth/login"
              }
            ]
          },
          {
            "route": "/admin",
            "pageComponent": AdminHubPage,
            "onAccessRedirectTo": "/app/admin/users",
            "protectionRules": {
              "userPermissionsRequired": {
                "or": [
                  "perm_can_read_user",
                  "perm_can_edit_user",
                  "perm_can_delete_user",
                  "perm_can_create_user",
                  "perm_can_create_user",
                  "perm_can_assign_tasks_to_user",
                  "perm_can_assign_tasks_to_project",
                  "perm_can_edit_projects",
                  "perm_can_delete_projects"
                ],
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
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [
                          "perm_can_create_user",
                          "perm_can_create_user"
                        ],
                        "and": []
                      },
                      "ifAccessDeniedRedirectTo": "/app/admin/users"
                    },
                  },
                  {
                    "route": "/:userId",
                    "pageComponent": AdminUserDetailsPage,

                    "pages": [
                      {
                        "route": "/edit",
                        "pageComponent": AdminUserEditPage,
                        "protectionRules": {
                          "userPermissionsRequired": {
                            "or": [],
                            "and": [
                              "perm_can_edit_user"
                            ]
                          },
                          "ifAccessDeniedRedirectTo": "/app/admin/users/:userId"
                        },


                      },
                      {
                        "route": "/status",
                        "pageComponent": AdminUserStatusPage,
                        "protectionRules": {
                          "userPermissionsRequired": {
                            "or": [],
                            "and": [
                              "perm_can_edit_user"
                            ]
                          }
                        },


                      },
                      {
                        "route": "/roles",
                        "pageComponent": AdminUserRolesPage,
                        "protectionRules": {
                          "userPermissionsRequired": {
                            "or": [],
                            "and": [
                              "perm_can_edit_user"
                            ]
                          }
                        },


                      }
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
                    "protectionRules": {
                      "userPermissionsRequired": {
                        "or": [],
                        "and": [
                          "perm_can_edit_user"
                        ]
                      },
                      "ifAccessDeniedRedirectTo": "/app/admin/roles"
                    },


                  },
                  {
                    "route": "/:roleId",
                    "pageComponent": AdminRoleDetailsPage,

                    "pages": [
                      {
                        "route": "/edit",
                        "pageComponent": AdminRoleEditPage,
                        "protectionRules": {
                          "userPermissionsRequired": {
                            "or": [],
                            "and": [
                              "perm_can_edit_user"
                            ]
                          }
                        },


                      },
                      {
                        "route": "/delete",
                        "pageComponent": AdminRoleDeletePage,
                        "protectionRules": {
                          "userPermissionsRequired": {
                            "or": [],
                            "and": [
                              "perm_can_delete_user"
                            ]
                          }
                        },

                      }
                    ]
                  }
                ]
              },
              {
                "route": "/logs",
                "pageComponent": AdminLogsPage,
                "protectionRules": {
                  "userPermissionsRequired": {
                    "or": [
                      "perm_can_edit_user",
                      "perm_can_delete_user"
                    ],
                    "and": []
                  },
                  "ifAccessDeniedRedirectTo": "/app/admin"
                },
                
                "pages": [
                  {
                    "route": "/:logId",
                    "pageComponent": AdminLogDetailsPage,
                    
                  }
                ]
              }
            ]
          },
          {
            "route": "/system/status",
            "pageComponent": SystemStatusPage,
            
          }
        ],
        
      },
      {
        "route": "error",
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
      },
    ]
  },
  {
    "route": "*",
    "onAccessRedirectTo": "/error/404"
  }
]

export default routes;
