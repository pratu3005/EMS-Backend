export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateDatetime = (datetime) => {
  const date = new Date(datetime);
  return date instanceof Date && !isNaN(date);
};

export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateFieldType = (fieldType) => {
  const validTypes = [
    'text',
    'textarea',
    'number',
    'email',
    'phone',
    'dropdown',
    'radio',
    'checkbox',
    'date',
    'time',
    'file',
    'url',
  ];
  return validTypes.includes(fieldType);
};

export const validateEventFor = (eventFor) => {
  const validValues = ['all', 'tssia_members'];
  return validValues.includes(eventFor);
};

export const validateStatusType = (statusType) => {
  const validTypes = ['attendance', 'registration'];
  return validTypes.includes(statusType);
};
