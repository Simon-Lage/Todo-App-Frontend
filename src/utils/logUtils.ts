const ACTION_LABELS: Record<string, string> = {
  'task.create': 'Aufgabe erstellt',
  'task.update': 'Aufgabe aktualisiert',
  'task.delete': 'Aufgabe gelöscht',
  'task.assign_user': 'Aufgabe: Benutzer zugewiesen',
  'task.assign_users': 'Aufgabe: Benutzer zugewiesen',
  'task.unassign_user': 'Aufgabe: Benutzer entfernt',
  'task.clear_assignees': 'Aufgabe: Alle Zuweisungen entfernt',
  'task.move_to_project': 'Aufgabe verschoben',
  'task.status_update': 'Aufgabenstatus geändert',
  'task.beautify_text': 'Aufgabentext verbessert',

  'project.create': 'Projekt erstellt',
  'project.update': 'Projekt aktualisiert',
  'project.delete': 'Projekt gelöscht',
  'project.complete': 'Projekt abgeschlossen',
  'project.teamlead.join': 'Projektleitung übernommen',

  'user.create': 'Benutzer angelegt',
  'user.update': 'Benutzer aktualisiert',
  'user.deactivate': 'Benutzer deaktiviert',
  'user.reactivate': 'Benutzer reaktiviert',
  'user.reset_password_self': 'Passwort-Reset angefordert',
  'user.profile_image.update': 'Profilbild geändert',

  'auth.logout': 'Abmeldung',
  'auth.change_password': 'Passwort geändert',
  'auth.reset_password_confirm': 'Passwort zurückgesetzt',
  'auth.register': 'Registrierung angelegt',

  'image.upload': 'Bild hochgeladen',
  'image.delete': 'Bild gelöscht',
  'image.update': 'Bild aktualisiert',

  'logs.export': 'Logs exportiert',
};

export const formatLogAction = (action: string | null | undefined): string => {
  if (!action) return 'Unbekannte Aktion';
  return ACTION_LABELS[action] ?? `Unbekannte Aktion (${action})`;
};

