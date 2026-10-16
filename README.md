# Numenor Client

React + Vite + Material UI (MUI) + React Router, TypeScript.

## Розробка

```bash
npm install
npm run dev                  # http://localhost:5173
```

Бекенд має працювати на `http://localhost:5001` — Vite проксіює на нього `/api`, тож клієнт і
API в розробці на одному origin, як і в продакшені. Авторизація — httpOnly cookie сесії, яку
ставить бекенд; токенів у `localStorage` немає.

## Структура

```
src/
  main.tsx             # entrypoint: ThemeProvider, CssBaseline, BrowserRouter
  App.tsx              # оголошення маршрутів
  theme.ts             # MUI тема
  auth/                # AuthContext/Provider, дозволи, зберігання токена
  layouts/             # MainLayout (сайдбар), AuthLayout
  pages/               # сторінки-маршрути
  components/          # перевикористовувані компоненти
  routing/             # ProtectedRoute, роль-based редіректи
  types/               # TS-типи відповідей API
  api/client.ts        # axios-інстанс (base URL /api, cookie-сесія)
```

## Деплой

Покрокові інструкції — у README бекенду (`ns-manager-backend/README.md`). Коротко про клієнт:

- **Shared hosting (Spaceship / cPanel).** Зібрати з адресою API на піддомені й залити вміст `dist/`
  у корінь сайту (`public_html`):

  ```bash
  VITE_API_URL=https://api.<домен>/api npm run build
  ```

  `public/.htaccess` потрапляє в `dist/` автоматично й віддає `index.html` для маршрутів
  застосунку (прямі посилання типу `/clients/123`).
- **VPS з Docker.** `Dockerfile` збирає бандл і віддає `dist/` через Caddy (`Caddyfile`) з тим самим
  SPA-фолбеком. `VITE_API_URL` за замовчуванням `/api` — edge-проксі з
  `ns-manager-backend/deploy` шле `/api/*` на бекенд того ж домену. Репозиторій має лежати поруч із
  бекендом.

`VITE_API_URL` — build-time змінна: Vite вшиває її в бандл, тож зміна вимагає перезбірки.
