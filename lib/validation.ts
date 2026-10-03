/** Shared form validators. Each returns an error message, or '' when the value is valid. */

export const MIN_PASSWORD_LENGTH = 8;

// local-part @ domain . tld  (e.g. user@domain.com, first.last+tag@mail.example.co)
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export const validateEmail = (value: string): string => {
  const email = value.trim();
  if (!email) return 'Email is required.';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address (e.g. user@domain.com).';
  return '';
};

export const validatePassword = (value: string): string => {
  if (!value) return 'Password is required.';
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  return '';
};

export const validateDisplayName = (value: string): string => {
  const name = value.trim();
  if (!name) return 'Display name is required.';
  if (/\s/.test(name)) return 'Please enter a single display name only (no spaces).';
  return '';
};