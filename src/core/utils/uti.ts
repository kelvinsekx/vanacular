export const removeUndefinedProps = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  );
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
