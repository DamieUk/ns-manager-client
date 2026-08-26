# Numenor Client

React + Vite + Material UI (MUI) + React Router.

## Розробка

```bash
cp .env.example .env.local   # налаштувати VITE_API_URL (адреса бекенду)
npm install
npm run dev                  # http://localhost:5173
```

## Структура

```
src/
  main.jsx            # entrypoint: ThemeProvider, CssBaseline, BrowserRouter
  App.jsx             # оголошення маршрутів
  theme.js            # MUI тема
  layouts/            # спільні лейаути (AppBar + навігація)
  pages/              # сторінки-маршрути
  components/         # перевикористовувані компоненти
  api/client.js        # axios-інстанс, base URL з VITE_API_URL
```

## Маршрути

- `/` — Home (з перевіркою доступності бекенду через `GET /api/health`)
- `/about` — About
- `*` — 404
