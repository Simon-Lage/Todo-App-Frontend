export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  teamlead: 'Teamleitung',
  staff: 'Mitarbeiter',
  user: 'Benutzer',
};

export const getRoleLabel = (roleKey: string | null | undefined): string | null => {
  if (!roleKey) return null;

  const exact = ROLE_LABELS[roleKey];
  if (exact) return exact;

  const lowered = ROLE_LABELS[roleKey.toLowerCase()];
  if (lowered) return lowered;

  return roleKey;
};
