export type AuthMode =
  | "welcome"
  | "signup"
  | "email-signin"
  | "forgot-password"
  | "otp-verify"
  | "update-password";

export interface AuthFormState {
  email: string;
  password: string;
  agreeTerms: boolean;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}
