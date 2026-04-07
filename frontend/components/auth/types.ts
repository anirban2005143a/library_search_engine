
export interface ForgetPasswordFormProps {
  onBack: () => void;
  onSuccess: (newPassword: string) => void;
  email: string;
}

export interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export interface Errors {
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

export interface PasswordStrength {
  score: number;
  feedback: string;
}

export interface OTPVerificationFormProps {
  onBack?: () => void;
  onVerify?: (otpValue: string) => void;
}