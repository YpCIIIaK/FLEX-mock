import type { VercelRequest, VercelResponse } from "./vercel.js";

type TelegramUpdate = {
  message?: {
    chat?: { id: number };
    text?: string;
  };
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = request.headers["x-telegram-bot-api-secret-token"];

  if (!webhookSecret || receivedSecret !== webhookSecret) {
    return response.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const update = request.body as TelegramUpdate;
  const chatId = update.message?.chat?.id;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const miniAppUrl = process.env.MINI_APP_URL;

  if (chatId && botToken && miniAppUrl && update.message?.text?.startsWith("/start")) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "FLEX скоро запустится. Откройте мини-приложение, чтобы увидеть первый экран.",
        reply_markup: {
          inline_keyboard: [[{ text: "Открыть FLEX", web_app: { url: miniAppUrl } }]]
        }
      })
    });
  }

  return response.status(200).json({ ok: true });
}
