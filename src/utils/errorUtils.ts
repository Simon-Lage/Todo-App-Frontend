export const getErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unbekannter Fehler';
};

