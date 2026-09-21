const telegram = window.Telegram?.WebApp;
const status = document.querySelector("#telegram-status");

if (telegram) {
  telegram.ready();
  telegram.expand();
  telegram.setHeaderColor("#08080b");
  telegram.setBackgroundColor("#08080b");
  status.textContent = "Открыто в Telegram";
  document.documentElement.dataset.telegram = "true";
}

