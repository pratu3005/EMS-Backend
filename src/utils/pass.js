

/**
 * Generates a unique pass number for event registration.
 * Format: PASS-YYYYMMDD-RandomString
 */
export const generatePassNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PASS-${date}-${randomPart}`;
};
