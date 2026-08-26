export function getGoogleSignInUrl(): string {
  return `${import.meta.env.VITE_API_URL}/auth/google`;
}

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  not_invited: 'Цей Google-акаунт не запрошено в систему. Зверніться до адміністратора.',
  no_email: 'Google не надав email для цього акаунту.',
  account_disabled: 'Цей акаунт деактивовано. Зверніться до адміністратора.',
  auth_failed: 'Не вдалося увійти через Google. Спробуйте ще раз.',
};

export function getLoginErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return LOGIN_ERROR_MESSAGES[code] ?? LOGIN_ERROR_MESSAGES.auth_failed;
}
