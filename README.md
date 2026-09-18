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

## Деплой на Render (Static Site)

Репозиторій містить `render.yaml` (Blueprint) з SPA-роутингом (усі шляхи віддають `index.html`,
щоб працював react-router на прямих посиланнях типу `/clients/123`).

1. Бекенд має бути задеплоєний першим (дивись README бекенду) — знадобиться його URL.
2. Запушити цей репозиторій у свій GitHub-акаунт.
3. Render → New → Blueprint → обрати репозиторій → Render прочитає `render.yaml`.
4. Ввести значення `VITE_API_URL` — `https://<backend-service>.onrender.com/api` (з кроку 1).
   Це build-time змінна: Vite вшиває її у бандл під час `npm run build`, тож зміна значення
   вимагає повторного деплою.
5. Deploy — після збірки клієнт буде на `https://<client-service>.onrender.com`.
6. Повернутися до бекенду і виставити його `CLIENT_ORIGIN` на цю саму адресу (для CORS —
   Google-вхід не потребує окремого налаштування на боці клієнта, бекенд сам робить редірект).
