/**
 * Reusable password complexity validator.
 *
 * Rules:
 *  - At least 8 characters
 *  - At least 1 uppercase letter (A-Z)
 *  - At least 1 lowercase letter (a-z)
 *  - At least 1 number (0-9)
 *  - At least 1 special character (!@#$%^&*...)
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

const MIN_LENGTH = 8;

const RULES = [
  {
    test: (pw: string) => pw.length >= MIN_LENGTH,
    message: `Mật khẩu cần ít nhất ${MIN_LENGTH} ký tự`,
  },
  {
    test: (pw: string) => /[A-Z]/.test(pw),
    message: 'Cần ít nhất 1 chữ hoa (A-Z)',
  },
  {
    test: (pw: string) => /[a-z]/.test(pw),
    message: 'Cần ít nhất 1 chữ thường (a-z)',
  },
  {
    test: (pw: string) => /[0-9]/.test(pw),
    message: 'Cần ít nhất 1 chữ số (0-9)',
  },
  {
    test: (pw: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
    message: 'Cần ít nhất 1 ký tự đặc biệt (!@#$%^&*...)',
  },
];

/**
 * Validate a password against all complexity rules.
 * Returns whether the password is valid and a list of failing rule messages.
 */
export function validatePasswordComplexity(password: string): PasswordValidationResult {
  if (!password) {
    return {
      valid: false,
      errors: ['Mật khẩu không được để trống'],
    };
  }

  const errors = RULES.filter((rule) => !rule.test(password)).map((rule) => rule.message);

  return {
    valid: errors.length === 0,
    errors,
  };
}
