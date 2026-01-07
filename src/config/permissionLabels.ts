export const PERMISSION_LABELS: Record<string, string> = {
  perm_can_create_user: 'Benutzer erstellen',
  perm_can_edit_user: 'Benutzer bearbeiten',
  perm_can_read_user: 'Benutzer anzeigen',
  perm_can_delete_user: 'Benutzer deaktivieren',

  perm_can_create_tasks: 'Aufgaben erstellen',
  perm_can_edit_tasks: 'Aufgaben bearbeiten',
  perm_can_read_all_tasks: 'Alle Aufgaben anzeigen',
  perm_can_delete_tasks: 'Aufgaben löschen',
  perm_can_assign_tasks_to_user: 'Aufgaben zuweisen (User)',
  perm_can_assign_tasks_to_project: 'Aufgaben Projekten zuweisen',

  perm_can_create_projects: 'Projekte erstellen',
  perm_can_edit_projects: 'Projekte bearbeiten',
  perm_can_read_projects: 'Projekte anzeigen',
  perm_can_delete_projects: 'Projekte löschen',

  perm_can_read_roles: 'Rollen anzeigen',
};

export const getPermissionLabel = (key: string): string => {
  return PERMISSION_LABELS[key] ?? 'Unbekannte Berechtigung';
};

