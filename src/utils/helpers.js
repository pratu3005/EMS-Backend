import { randomBytes } from 'crypto';

export const generatePassNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = randomBytes(4).toString('hex').toUpperCase();
  return `PASS-${timestamp}-${randomPart}`;
};

export const generateUniqueFileName = (originalFileName) => {
  const timestamp = Date.now();
  const randomPart = randomBytes(4).toString('hex');
  const ext = originalFileName.split('.').pop();
  return `${timestamp}-${randomPart}.${ext}`;
};

export const parseQRCodeData = (qrCodeString) => {
  try {
    return JSON.parse(qrCodeString);
  } catch {
    return null;
  }
};
