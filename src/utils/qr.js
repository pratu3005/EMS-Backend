import QRCode from 'qrcode';

/**
 * Generates a Base64 QR code image from a data object.
 * @param {Object} data - The data to encode in the QR code.
 * @returns {Promise<string>} - Base64 encoded QR code image.
 */
export const generateQRCodeBase64 = async (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const qrCode = await QRCode.toDataURL(jsonString);
    return qrCode;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Encodes data into a string for QR code usage.
 * @param {Object} data - The data to encode.
 * @returns {string} - Base64 encoded JSON string.
 */
export const encodeQRData = (data) => {
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString).toString('base64');
};

/**
 * Decodes a QR code string back into data.
 * @param {string} encodedData - The encoded QR string.
 * @returns {Object} - The decoded data.
 */
export const decodeQRData = (encodedData) => {
  try {
    const jsonString = Buffer.from(encodedData, 'base64').toString('utf-8');
    return JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Invalid QR code data');
  }
};
