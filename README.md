# Numenor Client

React + Vite + Material UI (MUI) + React Router, TypeScript.

## Розробка

```bash
cp .env.example .env.local   # налаштувати VITE_API_URL (адреса бекенду)
npm install
npm run dev                  # http://localhost:5173
```

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
  api/client.ts        # axios-інстанс, base URL з VITE_API_URL
```

## Деплой

Клієнт деплоїться разом з бекендом на один сервер — інструкція в README бекенду
(`ns-manager-backend/README.md`, розділ «Деплой на власний сервер»). Цей репозиторій має лише
лежати поруч з бекендом: `ns-manager-backend/deploy/docker-compose.yml` збирає його з `Dockerfile`.

- `Dockerfile` — збирає Vite-бандл і віддає `dist/` через Caddy (`Caddyfile`), з SPA-фолбеком
  на `index.html`, щоб працювали прямі посилання типу `/clients/123`.
- `VITE_API_URL` за замовчуванням `/api` (той самий домен — edge-проксі шле `/api/*` на бекенд).
  Це build-time змінна: Vite вшиває її в бандл, тож зміна вимагає перезбірки
  (`docker compose up -d --build`).
