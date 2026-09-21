# FLEX Telegram Mini App

Стартовая заглушка Telegram Mini App и минимальный webhook для бота. Проект готов к развёртыванию на Vercel прямо из корня репозитория.

## Локальный запуск

```powershell
npm install
npm run dev
```

В браузере интерфейс работает в режиме предпросмотра. В Telegram дополнительно вызываются `ready()`, `expand()` и настройка цветов клиента.

## Деплой на Vercel

1. Импортировать Git-репозиторий в Vercel.
2. Root Directory оставить пустым: приложение уже находится в корне репозитория.
3. Framework Preset: Vite. Build Command: `npm run build`. Output Directory: `dist`.
4. Добавить переменные из `.env.example` в Project Settings → Environment Variables.
5. После первого деплоя записать публичный HTTPS URL в `MINI_APP_URL` и повторно развернуть проект.

## Подключение Telegram

Создать бота через `@BotFather`, затем назначить webhook:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<VERCEL_DOMAIN>/api/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

В `@BotFather` также можно выбрать бота → Bot Settings → Configure Mini App и указать тот же HTTPS URL. Токен бота хранится только в переменных Vercel и не должен попадать во фронтенд или Git.

`api/webhook.ts` сейчас отвечает на `/start` кнопкой открытия Mini App. Бизнес-логика будет добавлена после утверждения сценария.
