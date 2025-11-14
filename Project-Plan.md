# TODO-APP Project Plan

Ursprungsaufgabe:
Sie sind Auszubildende bzw. Auszubildender der ChangeIT GmbH und derzeit in der Abteilung Anwendungsentwicklung eingesetzt. Von Ihrer Vorgesetzten erhalten Sie die Aufgabe, für einen Kunden eine Projektverwaltung (To-do App) zu entwickeln. Die Anwendung sollte es ermöglichen, Mitarbeitern diverse Aufgaben (To-dos) zuzuordnen und diese mit Prioritäten zu versehen. Die Aufgaben sind unterschiedlichen Projekten zugewiesen.

Meldet sich ein Mitarbeiter an dem System an, so sieht er eine Liste der zu bearbeitenden Aufgaben. Über eine Detailanzeige kann er hierbei erkennen, zu welchem Projekt die Aufgabe gehört, welche Priorität sie hat und wer noch daran mitarbeitet. Er hat ferner die Möglichkeit, die Aufgabe als erledigt zu markieren.

Abteilungsleiter und Mitarbeiter haben die gleichen Berechtigungen. Wenn sich ein Abteilungsleiter am System anmeldet, so hat er darüber hinaus die Möglichkeit, die Aufgaben seiner Mitarbeiter zu sehen, sowie neue Aufgabe zu erstellen und diesen Prioritäten sowie Projekten zuzuweisen. Ferner verfügt er über die Berechtigung, neue Projekte anzulegen.

Der Administrator des Systems kann Benutzerkonten anlegen und für diese Rollen vergeben und ändern. Das Backend steht in Form einer REST-API zur Verfügung (Dokumentation der REST-API). In diesem Lernfeld soll für diese Anwendung ein Frontend in Form einer Webseite und einer Android-App entwickelt werden.



Daraus resultierender Seitenaufbau als json.

```json
{
  "pages": [
    {
      "route": "/",
      "onAccessRedirectTo": "/app/dashboard"
    },
    {
      "route": "/auth",
      "layout": "AuthLayout",
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
          "route": "/auth/login",
          "pageComponent": "LoginPage",
          "dataDependencies": [
            {
              "method": "POST",
              "path": "/api/auth/login"
            }
          ]
        },
        {
          "route": "/auth/register",
          "pageComponent": "RegisterPage",
          "dataDependencies": [
            {
              "method": "POST",
              "path": "/api/info/user"
            },
            {
              "method": "POST",
              "path": "/api/auth/register"
            }
          ]
        },
        {
          "route": "/auth/reset-password",
          "pageComponent": "ResetPasswordFlowPage",
          "onAccessRedirectTo": "/auth/reset-password/request",
          "pages": [
            {
              "route": "/auth/reset-password/request",
              "pageComponent": "ResetPasswordRequestPage",
              "dataDependencies": [
                {
                  "method": "POST",
                  "path": "/api/user/reset-password"
                }
              ]
            },
            {
              "route": "/auth/reset-password/verify-email",
              "pageComponent": "ResetPasswordVerifyEmailPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/user/obfuscated-email/:userId"
                },
                {
                  "method": "POST",
                  "path": "/api/user/verify-email-for-password-reset/:userId"
                }
              ]
            },
            {
              "route": "/auth/reset-password/confirm",
              "pageComponent": "ResetPasswordConfirmPage",
              "dataDependencies": [
                {
                  "method": "POST",
                  "path": "/api/info/auth/reset-password/confirm"
                },
                {
                  "method": "POST",
                  "path": "/api/auth/reset-password/confirm"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "route": "/app",
      "layout": "AppShellLayout",
      "pageComponent": "AppRootPage",
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
          "route": "/app/dashboard",
          "pageComponent": "DashboardPage",
          "dataDependencies": [
            {
              "method": "GET",
              "path": "/api/task/list?assigned_to_user_id=current&limit=10"
            },
            {
              "method": "GET",
              "path": "/api/project/list?created_by_user_id=current&limit=5"
            },
            {
              "method": "GET",
              "path": "/api/user"
            }
          ]
        },
        {
          "route": "/app/tasks",
          "pageComponent": "TaskOverviewPage",
          "onAccessRedirectTo": "/app/tasks/my",
          "pages": [
            {
              "route": "/app/tasks/my",
              "pageComponent": "TaskMyListPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/task/list?assigned_to_user_id=current"
                }
              ]
            },
            {
              "route": "/app/tasks/all",
              "pageComponent": "TaskAllListPage",
              "protectionRules": {
                "userPermissionsRequired": {
                  "or": [
                    "perm_can_read_all_tasks"
                  ],
                  "and": []
                },
                "ifAccessDeniedRedirectTo": "/app/tasks/my"
              },
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/task/list"
                }
              ]
            },
            {
              "route": "/app/tasks/create",
              "pageComponent": "TaskCreatePage",
              "protectionRules": {
                "userPermissionsRequired": {
                  "or": [],
                  "and": [
                    "perm_can_create_tasks"
                  ]
                },
                "ifAccessDeniedRedirectTo": "/app/tasks/my"
              },
              "dataDependencies": [
                {
                  "method": "POST",
                  "path": "/api/info/task"
                }
              ],
              "mutations": [
                {
                  "method": "POST",
                  "path": "/api/task"
                }
              ]
            },
            {
              "route": "/app/tasks/:taskId",
              "pageComponent": "TaskDetailsPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/task/:taskId"
                },
                {
                  "method": "GET",
                  "path": "/api/image/list?task_id=:taskId"
                },
                {
                  "method": "POST",
                  "path": "/api/info/task/:taskId/status"
                }
              ],
              "mutations": [
                {
                  "method": "POST",
                  "path": "/api/task/:taskId/status"
                }
              ],
              "pages": [
                {
                  "route": "/app/tasks/:taskId/edit",
                  "pageComponent": "TaskEditPage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [],
                      "and": [
                        "perm_can_edit_tasks"
                      ]
                    },
                    "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/task/:taskId"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "PATCH",
                      "path": "/api/task/:taskId"
                    }
                  ]
                },
                {
                  "route": "/app/tasks/:taskId/assign-user",
                  "pageComponent": "TaskAssignUserPage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [
                        "perm_can_assign_tasks_to_user"
                      ],
                      "and": []
                    },
                    "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/task/:taskId/assign-user"
                    },
                    {
                      "method": "GET",
                      "path": "/api/user/list"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/task/:taskId/assign-user"
                    }
                  ]
                },
                {
                  "route": "/app/tasks/:taskId/move-to-project",
                  "pageComponent": "TaskMoveToProjectPage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [
                        "perm_can_assign_tasks_to_project"
                      ],
                      "and": []
                    },
                    "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/task/:taskId/move-to-project"
                    },
                    {
                      "method": "GET",
                      "path": "/api/project/list"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/task/:taskId/move-to-project"
                    }
                  ]
                },
                {
                  "route": "/app/tasks/:taskId/images",
                  "pageComponent": "TaskImagesPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/image/list?task_id=:taskId"
                    },
                    {
                      "method": "POST",
                      "path": "/api/info/image"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/image"
                    },
                    {
                      "method": "PATCH",
                      "path": "/api/image/:imageId"
                    },
                    {
                      "method": "DELETE",
                      "path": "/api/image/:imageId"
                    }
                  ]
                },
                {
                  "route": "/app/tasks/:taskId/unassign-user",
                  "pageComponent": "TaskUnassignUserPage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [
                        "perm_can_assign_tasks_to_user"
                      ],
                      "and": []
                    },
                    "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/task/:taskId/unassign-user"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/task/:taskId/unassign-user"
                    }
                  ]
                },
                {
                  "route": "/app/tasks/:taskId/delete",
                  "pageComponent": "TaskDeletePage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [],
                      "and": [
                        "perm_can_delete_tasks"
                      ]
                    },
                    "ifAccessDeniedRedirectTo": "/app/tasks/:taskId"
                  },
                  "mutations": [
                    {
                      "method": "DELETE",
                      "path": "/api/task/:taskId"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "route": "/app/projects",
          "pageComponent": "ProjectOverviewPage",
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
              "route": "/app/projects/list",
              "pageComponent": "ProjectListPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/project/list"
                }
              ]
            },
            {
              "route": "/app/projects/create",
              "pageComponent": "ProjectCreatePage",
              "protectionRules": {
                "userPermissionsRequired": {
                  "or": [],
                  "and": [
                    "perm_can_create_projects"
                  ]
                },
                "ifAccessDeniedRedirectTo": "/app/projects/list"
              },
              "dataDependencies": [
                {
                  "method": "POST",
                  "path": "/api/info/project"
                }
              ],
              "mutations": [
                {
                  "method": "POST",
                  "path": "/api/project"
                }
              ]
            },
            {
              "route": "/app/projects/:projectId",
              "pageComponent": "ProjectDetailsPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/project/:projectId"
                },
                {
                  "method": "GET",
                  "path": "/api/task/list?project_id=:projectId"
                },
                {
                  "method": "GET",
                  "path": "/api/image/list?project_id=:projectId"
                }
              ],
              "pages": [
                {
                  "route": "/app/projects/:projectId/edit",
                  "pageComponent": "ProjectEditPage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [],
                      "and": [
                        "perm_can_edit_projects"
                      ]
                    },
                    "ifAccessDeniedRedirectTo": "/app/projects/:projectId"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/project/:projectId"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "PATCH",
                      "path": "/api/project/:projectId"
                    }
                  ]
                },
                {
                  "route": "/app/projects/:projectId/delete",
                  "pageComponent": "ProjectDeletePage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [],
                      "and": [
                        "perm_can_delete_projects"
                      ]
                    },
                    "ifAccessDeniedRedirectTo": "/app/projects/:projectId"
                  },
                  "mutations": [
                    {
                      "method": "DELETE",
                      "path": "/api/project/:projectId"
                    }
                  ]
                },
                {
                  "route": "/app/projects/:projectId/team",
                  "pageComponent": "ProjectTeamPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/user/list?project_id=:projectId"
                    }
                  ]
                },
                {
                  "route": "/app/projects/:projectId/tasks",
                  "pageComponent": "ProjectTasksPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/task/list?project_id=:projectId"
                    }
                  ],
                  "pages": [
                    {
                      "route": "/app/projects/:projectId/tasks/create",
                      "pageComponent": "ProjectTaskCreatePage",
                      "protectionRules": {
                        "userPermissionsRequired": {
                          "or": [],
                          "and": [
                            "perm_can_create_tasks"
                          ]
                        },
                        "ifAccessDeniedRedirectTo": "/app/projects/:projectId/tasks"
                      },
                      "dataDependencies": [
                        {
                          "method": "POST",
                          "path": "/api/info/task"
                        }
                      ],
                      "mutations": [
                        {
                          "method": "POST",
                          "path": "/api/task"
                        }
                      ]
                    }
                  ]
                },
                {
                  "route": "/app/projects/:projectId/images",
                  "pageComponent": "ProjectImagesPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/image/list?project_id=:projectId"
                    },
                    {
                      "method": "POST",
                      "path": "/api/info/image"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/image"
                    },
                    {
                      "method": "PATCH",
                      "path": "/api/image/:imageId"
                    },
                    {
                      "method": "DELETE",
                      "path": "/api/image/:imageId"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "route": "/app/search",
          "pageComponent": "GlobalSearchPage",
          "dataDependencies": [
            {
              "method": "GET",
              "path": "/api/search/:query"
            },
            {
              "method": "GET",
              "path": "/api/search/user/:query"
            },
            {
              "method": "GET",
              "path": "/api/search/project/:query"
            },
            {
              "method": "GET",
              "path": "/api/search/task/:query"
            },
            {
              "method": "GET",
              "path": "/api/search/logs/:query"
            }
          ]
        },
        {
          "route": "/app/account",
          "pageComponent": "AccountAreaPage",
          "onAccessRedirectTo": "/app/account/profile",
          "pages": [
            {
              "route": "/app/account/profile",
              "pageComponent": "AccountProfilePage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/user"
                },
                {
                  "method": "POST",
                  "path": "/api/info/user"
                },
                {
                  "method": "GET",
                  "path": "/api/image/list?user_id=current"
                },
                {
                  "method": "POST",
                  "path": "/api/info/image"
                }
              ],
              "mutations": [
                {
                  "method": "PATCH",
                  "path": "/api/user"
                },
                {
                  "method": "POST",
                  "path": "/api/image"
                },
                {
                  "method": "PATCH",
                  "path": "/api/image/:imageId"
                },
                {
                  "method": "DELETE",
                  "path": "/api/image/:imageId"
                }
              ]
            },
            {
              "route": "/app/account/security",
              "pageComponent": "AccountSecurityPage",
              "dataDependencies": [
                {
                  "method": "POST",
                  "path": "/api/info/auth/change-password"
                }
              ],
              "mutations": [
                {
                  "method": "POST",
                  "path": "/api/auth/change-password"
                }
              ]
            },
            {
              "route": "/app/account/logout",
              "pageComponent": "LogoutPage",
              "mutations": [
                {
                  "method": "POST",
                  "path": "/api/auth/logout"
                }
              ],
              "onAccessRedirectTo": "/auth/login"
            }
          ]
        },
        {
          "route": "/app/admin",
          "pageComponent": "AdminHubPage",
          "onAccessRedirectTo": "/app/admin/users",
          "protectionRules": {
            "userPermissionsRequired": {
              "or": [
                "perm_can_read_user",
                "perm_can_edit_user",
                "perm_can_delete_user",
                "perm_can_create_user",
                "perm_can_crate_user",
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
              "route": "/app/admin/users",
              "pageComponent": "AdminUserListPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/user/list"
                }
              ],
              "pages": [
                {
                  "route": "/app/admin/users/create",
                  "pageComponent": "AdminUserCreatePage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [
                        "perm_can_create_user",
                        "perm_can_crate_user"
                      ],
                      "and": []
                    },
                    "ifAccessDeniedRedirectTo": "/app/admin/users"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/user"
                    },
                    {
                      "method": "GET",
                      "path": "/api/role/list"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/user"
                    }
                  ]
                },
                {
                  "route": "/app/admin/users/:userId",
                  "pageComponent": "AdminUserDetailsPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/user/:userId"
                    },
                    {
                      "method": "GET",
                      "path": "/api/role/by-user/:userId"
                    },
                    {
                      "method": "GET",
                      "path": "/api/user/:userId/tasks"
                    },
                    {
                      "method": "GET",
                      "path": "/api/user/:userId/projects"
                    }
                  ],
                  "pages": [
                    {
                      "route": "/app/admin/users/:userId/edit",
                      "pageComponent": "AdminUserEditPage",
                      "protectionRules": {
                        "userPermissionsRequired": {
                          "or": [],
                          "and": [
                            "perm_can_edit_user"
                          ]
                        },
                        "ifAccessDeniedRedirectTo": "/app/admin/users/:userId"
                      },
                      "dataDependencies": [
                        {
                          "method": "POST",
                          "path": "/api/info/user/:userId"
                        }
                      ],
                      "mutations": [
                        {
                          "method": "PATCH",
                          "path": "/api/user/:userId"
                        }
                      ]
                    },
                    {
                      "route": "/app/admin/users/:userId/status",
                      "pageComponent": "AdminUserStatusPage",
                      "protectionRules": {
                        "userPermissionsRequired": {
                          "or": [],
                          "and": [
                            "perm_can_edit_user"
                          ]
                        }
                      },
                      "dataDependencies": [
                        {
                          "method": "POST",
                          "path": "/api/info/user/:userId/deactivate"
                        },
                        {
                          "method": "POST",
                          "path": "/api/info/user/:userId/reactivate"
                        }
                      ],
                      "mutations": [
                        {
                          "method": "POST",
                          "path": "/api/user/:userId/deactivate"
                        },
                        {
                          "method": "POST",
                          "path": "/api/user/:userId/reactivate"
                        }
                      ]
                    },
                    {
                      "route": "/app/admin/users/:userId/roles",
                      "pageComponent": "AdminUserRolesPage",
                      "protectionRules": {
                        "userPermissionsRequired": {
                          "or": [],
                          "and": [
                            "perm_can_edit_user"
                          ]
                        }
                      },
                      "dataDependencies": [
                        {
                          "method": "GET",
                          "path": "/api/role/list"
                        },
                        {
                          "method": "POST",
                          "path": "/api/info/role/by-user/:userId"
                        }
                      ],
                      "mutations": [
                        {
                          "method": "PATCH",
                          "path": "/api/role/by-user/:userId"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "route": "/app/admin/roles",
              "pageComponent": "AdminRoleListPage",
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/role/list"
                },
                {
                  "method": "GET",
                  "path": "/api/permission/catalog"
                }
              ],
              "pages": [
                {
                  "route": "/app/admin/roles/create",
                  "pageComponent": "AdminRoleCreatePage",
                  "protectionRules": {
                    "userPermissionsRequired": {
                      "or": [],
                      "and": [
                        "perm_can_edit_user"
                      ]
                    },
                    "ifAccessDeniedRedirectTo": "/app/admin/roles"
                  },
                  "dataDependencies": [
                    {
                      "method": "POST",
                      "path": "/api/info/role"
                    }
                  ],
                  "mutations": [
                    {
                      "method": "POST",
                      "path": "/api/role"
                    }
                  ]
                },
                {
                  "route": "/app/admin/roles/:roleId",
                  "pageComponent": "AdminRoleDetailsPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/role/:roleId"
                    },
                    {
                      "method": "GET",
                      "path": "/api/user/by-role/:roleId"
                    }
                  ],
                  "pages": [
                    {
                      "route": "/app/admin/roles/:roleId/edit",
                      "pageComponent": "AdminRoleEditPage",
                      "protectionRules": {
                        "userPermissionsRequired": {
                          "or": [],
                          "and": [
                            "perm_can_edit_user"
                          ]
                        }
                      },
                      "dataDependencies": [
                        {
                          "method": "POST",
                          "path": "/api/info/role/:roleId"
                        }
                      ],
                      "mutations": [
                        {
                          "method": "PATCH",
                          "path": "/api/role/:roleId"
                        }
                      ]
                    },
                    {
                      "route": "/app/admin/roles/:roleId/delete",
                      "pageComponent": "AdminRoleDeletePage",
                      "protectionRules": {
                        "userPermissionsRequired": {
                          "or": [],
                          "and": [
                            "perm_can_delete_user"
                          ]
                        }
                      },
                      "mutations": [
                        {
                          "method": "DELETE",
                          "path": "/api/role/:roleId"
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              "route": "/app/admin/logs",
              "pageComponent": "AdminLogsPage",
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
              "dataDependencies": [
                {
                  "method": "GET",
                  "path": "/api/logs/list"
                },
                {
                  "method": "GET",
                  "path": "/api/logs/stats"
                }
              ],
              "pages": [
                {
                  "route": "/app/admin/logs/:logId",
                  "pageComponent": "AdminLogDetailsPage",
                  "dataDependencies": [
                    {
                      "method": "GET",
                      "path": "/api/logs/:logId"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "route": "/app/system/status",
          "pageComponent": "SystemStatusPage",
          "dataDependencies": [
            {
              "method": "GET",
              "path": "/api/health"
            },
            {
              "method": "GET",
              "path": "/api/version"
            }
          ]
        }
      ],
      "dataDependencies": [
        {
          "method": "GET",
          "path": "/api/user"
        },
        {
          "method": "GET",
          "path": "/api/user/permissions"
        }
      ]
    },
    {
      "route": "/error",
      "pages": [
        {
          "route": "/error/401",
          "pageComponent": "Error401Page"
        },
        {
          "route": "/error/403",
          "pageComponent": "Error403Page"
        },
        {
          "route": "/error/404",
          "pageComponent": "Error404Page"
        },
        {
          "route": "/error/500",
          "pageComponent": "Error500Page"
        }
      ]
    },
    {
      "route": "*",
      "onAccessRedirectTo": "/error/404"
    }
  ]
}
```
