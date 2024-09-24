import validator from 'validator';

export const validateEmailAndPassword = (email: string, password: string): string | null => {
  if (!validator.isEmail(email)) {
    return 'Invalid email format';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  return null;
};
