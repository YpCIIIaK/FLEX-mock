import type { VercelRequest, VercelResponse } from "./vercel.js";

export default function handler(_request: VercelRequest, response: VercelResponse) {
  return response.status(200).json({ ok: true, service: "flex-telegram-mini-app" });
}
