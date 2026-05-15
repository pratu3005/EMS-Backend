/**
 * Generates a unique pass number for event registration.
 * Format: 4 LETTERS + "-" + 4 SERIAL DIGITS (e.g., EVEN-0001)
 */
export const generatePassNumber = (prefix, serial) => {
  const cleanPrefix = (prefix || 'EVNT').substring(0, 4).toUpperCase().padEnd(4, 'X');
  const cleanSerial = String(serial).padStart(4, '0');
  return `${cleanPrefix}-${cleanSerial}`;
};

/**
 * Generates a random 10-digit numeric string for QR codes.
 */
export const generateRandomQRText = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};
