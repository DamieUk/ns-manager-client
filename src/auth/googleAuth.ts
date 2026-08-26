export function getGoogleSignInUrl(): string {
  return `${import.meta.env.VITE_API_URL}/auth/google`;
}
