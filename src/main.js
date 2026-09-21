const telegram = window.Telegram?.WebApp;
const isTelegram = Boolean(telegram?.initData);
const view = document.querySelector("#app-view");
const nav = document.querySelector(".bottom-nav");
const toast = document.querySelector("[data-toast]");

const products = [
  { id: "one", name: "FLEX ONE", tone: "violet", note: "Лёгкий и лаконичный", tag: "Выбор недели" },
  { id: "air", name: "FLEX AIR", tone: "blue", note: "Свежий характер", tag: "Новинка" },
  { id: "bold", name: "FLEX BOLD", tone: "amber", note: "Выразительный профиль", tag: "Популярное" }
];

const user = telegram?.initDataUnsafe?.user;
const userName = user?.first_name || "Гость";
const escapeHTML = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const safeUserName = escapeHTML(userName);
const safeUsername = user?.username ? escapeHTML(user.username) : "";
const favorites = new Set(JSON.parse(localStorage.getItem("flex-favorites") || "[]"));
let currentRoute = "home";
let toastTimer;

document.querySelector("[data-user-name]").textContent = userName;
document.querySelector("[data-user-avatar]").textContent = userName.slice(0, 1).toUpperCase();
document.documentElement.dataset.runtime = isTelegram ? "telegram" : "browser";

function haptic(type = "light") { telegram?.HapticFeedback?.impactOccurred(type); }

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function productCard(product, compact = false) {
  const active = favorites.has(product.id);
  return `<article class="product-card product-card--${product.tone}${compact ? " product-card--compact" : ""}">
    <div class="product-card__top"><span>${product.tag}</span><button class="favorite${active ? " is-active" : ""}" type="button" data-favorite="${product.id}" aria-label="${active ? "Убрать из избранного" : "Добавить в избранное"}">♡</button></div>
    <div class="product-visual" aria-hidden="true"><i></i><i></i><i></i></div>
    <div><h3>${product.name}</h3><p>${product.note}</p></div>
  </article>`;
}

const pages = {
  home: () => `<section class="hero-card">
      <div class="hero-card__copy"><p class="eyebrow">FLEX CLUB · DEMO</p><h1>Всё нужное<br />в одном месте</h1><p>Новости, коллекции и персональные предложения прямо в Telegram.</p><button class="primary-button" type="button" data-route="catalog">Смотреть коллекцию <span>→</span></button></div>
      <div class="hero-mark" aria-hidden="true"><i></i><i></i><i></i></div>
    </section>
    <section class="section"><div class="section-heading"><div><p class="eyebrow">Возможности</p><h2>Что уже работает</h2></div></div>
      <div class="feature-grid"><button class="feature-card" type="button" data-route="catalog"><span class="feature-icon">◇</span><strong>Каталог</strong><small>Карточки и избранное</small></button><button class="feature-card" type="button" data-route="feedback"><span class="feature-icon">↗</span><strong>Обратная связь</strong><small>Рабочая демо-форма</small></button></div>
    </section>
    <section class="section"><div class="section-heading"><div><p class="eyebrow">Подборка</p><h2>Для знакомства</h2></div><button class="text-button" type="button" data-route="catalog">Все</button></div>
      <div class="slider" data-slider><div class="product-scroll" data-slider-track>${products.map((item) => productCard(item, true)).join("")}</div>
        <div class="slider-controls"><div class="slider-dots" aria-label="Переключение слайдов">${products.map((_, index) => `<button class="slider-dot${index === 0 ? " is-active" : ""}" type="button" data-slide="${index}" aria-label="Слайд ${index + 1}"></button>`).join("")}</div><div class="slider-arrows"><button type="button" data-slider-prev aria-label="Предыдущий слайд">←</button><button type="button" data-slider-next aria-label="Следующий слайд">→</button></div></div>
      </div></section>`,

  catalog: () => `<section class="page-head"><p class="eyebrow">Коллекция</p><h1>Найди свой FLEX</h1><p>Добавляй понравившиеся варианты в избранное.</p></section>
    <div class="filter-row" role="group" aria-label="Фильтр каталога"><button class="filter is-active" type="button" data-filter="all">Все</button><button class="filter" type="button" data-filter="new">Новинки</button><button class="filter" type="button" data-filter="popular">Популярное</button></div>
    <section class="product-grid" data-product-grid>${products.map((item) => productCard(item)).join("")}</section>`,

  profile: () => {
    const saved = products.filter((item) => favorites.has(item.id));
    const sent = localStorage.getItem("flex-feedback-sent") === "true";
    return `<section class="profile-card"><span class="profile-avatar">${escapeHTML(userName.slice(0, 1).toUpperCase())}</span><div><p class="eyebrow">Участник FLEX CLUB</p><h1>${safeUserName}</h1><p>${safeUsername ? `@${safeUsername}` : "Telegram-профиль"}</p></div><span class="age-chip">21+</span></section>
      <section class="stats"><div><strong>${saved.length}</strong><span>В избранном</span></div><div><strong>${sent ? "1" : "0"}</strong><span>Обращений</span></div></section>
      <section class="section"><div class="section-heading"><div><p class="eyebrow">Сохранено</p><h2>Избранное</h2></div></div>
      ${saved.length ? `<div class="saved-list">${saved.map((item) => `<div class="saved-item"><span class="saved-dot saved-dot--${item.tone}"></span><div><strong>${item.name}</strong><small>${item.note}</small></div><button type="button" data-favorite="${item.id}" aria-label="Удалить">×</button></div>`).join("")}</div>` : `<div class="empty-state"><span>♡</span><strong>Пока ничего нет</strong><p>Добавь варианты из каталога — они появятся здесь.</p><button class="secondary-button" type="button" data-route="catalog">Перейти в каталог</button></div>`}</section>
      <button class="support-link" type="button" data-route="feedback"><span>↗</span><span><strong>Связаться с нами</strong><small>Ответим на вопрос или примем предложение</small></span><b>›</b></button>`;
  },

  feedback: () => `<section class="page-head page-head--form"><button class="back-button" type="button" data-route="profile">←</button><p class="eyebrow">Обратная связь</p><h1>Напиши нам</h1><p>Это демонстрационная форма. После отправки покажем успешный сценарий.</p></section>
    <form class="form" data-feedback-form novalidate>
      <label><span>Имя</span><input name="name" type="text" value="${userName === "Гость" ? "" : safeUserName}" autocomplete="name" placeholder="Как к вам обращаться" required /></label>
      <label><span>Телефон</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required /></label>
      <label><span>Город</span><select name="city" required><option value="">Выберите город</option><option>Алматы</option><option>Астана</option><option>Шымкент</option><option>Другой</option></select></label>
      <label><span>Тема</span><select name="topic" required><option value="">Выберите тему</option><option>Вопрос о FLEX</option><option>Предложение</option><option>Сообщить о проблеме</option></select></label>
      <label><span>Сообщение</span><textarea name="message" rows="4" placeholder="Расскажите подробнее" required></textarea></label>
      <label class="check"><input name="agreement" type="checkbox" required /><span>Я подтверждаю, что мне исполнился 21 год, и согласен на обработку данных.</span></label>
      <button class="primary-button primary-button--wide" type="submit">Отправить</button>
    </form>`
};

function setRoute(route, pushHash = true) {
  if (!pages[route]) route = "home";
  currentRoute = route;
  view.innerHTML = pages[route]();
  view.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });
  const isRoot = ["home", "catalog", "profile"].includes(route);
  nav.hidden = !isRoot;
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("is-active", button.dataset.route === route));
  if (pushHash && location.hash !== `#${route}`) history.pushState({ route }, "", `#${route}`);
  if (telegram?.BackButton) isRoot ? telegram.BackButton.hide() : telegram.BackButton.show();
  telegram?.MainButton?.hide();
  bindForm();
  bindSlider();
}

function bindSlider() {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;
  const track = slider.querySelector("[data-slider-track]");
  const cards = [...track.children];
  const dots = [...slider.querySelectorAll("[data-slide]")];
  const previous = slider.querySelector("[data-slider-prev]");
  const next = slider.querySelector("[data-slider-next]");
  let active = 0;

  const updateControls = () => {
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === active));
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  };
  const goTo = (index) => {
    active = Math.max(0, Math.min(index, cards.length - 1));
    track.scrollTo({ left: cards[active].offsetLeft - track.offsetLeft, behavior: "smooth" });
    updateControls();
  };

  track.addEventListener("scroll", () => {
    const closest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - track.offsetLeft - track.scrollLeft) ? index : best, 0);
    if (closest !== active) { active = closest; updateControls(); }
  }, { passive: true });
  dots.forEach((dot, index) => dot.addEventListener("click", () => { haptic(); goTo(index); }));
  previous.addEventListener("click", () => { haptic(); goTo(active - 1); });
  next.addEventListener("click", () => { haptic(); goTo(active + 1); });
  updateControls();
}

function bindForm() {
  const form = document.querySelector("[data-feedback-form]");
  if (!form) return;
  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    const digits = phone.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
    const local = digits.startsWith("7") ? digits.slice(1) : digits;
    let value = "+7";
    if (local.length) value += ` (${local.slice(0, 3)}`;
    if (local.length >= 3) value += ")";
    if (local.length > 3) value += ` ${local.slice(3, 6)}`;
    if (local.length > 6) value += `-${local.slice(6, 8)}`;
    if (local.length > 8) value += `-${local.slice(8, 10)}`;
    phone.value = value;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) { haptic("heavy"); return; }
    localStorage.setItem("flex-feedback-sent", "true");
    telegram?.HapticFeedback?.notificationOccurred("success");
    view.innerHTML = `<section class="success"><span>✓</span><p class="eyebrow">Готово</p><h1>Спасибо!</h1><p>Демо-обращение принято. В настоящем приложении оно отправится менеджеру.</p><button class="primary-button" type="button" data-route="home">Вернуться на главную</button></section>`;
    telegram?.MainButton?.hide();
  });
  if (isTelegram && telegram?.MainButton) {
    telegram.MainButton.setParams({ text: "Отправить", color: "#8068ff", text_color: "#ffffff", is_visible: true });
  }
}

document.addEventListener("click", (event) => {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) { haptic(); setRoute(routeButton.dataset.route); return; }
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    localStorage.setItem("flex-favorites", JSON.stringify([...favorites]));
    telegram?.HapticFeedback?.selectionChanged();
    notify(favorites.has(id) ? "Добавлено в избранное" : "Удалено из избранного");
    setRoute(currentRoute, false);
    return;
  }
  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    const matches = filterButton.dataset.filter === "new" ? products.filter((item) => item.tag === "Новинка") : filterButton.dataset.filter === "popular" ? products.filter((item) => item.tag === "Популярное") : products;
    document.querySelectorAll("[data-filter]").forEach((button) => button.classList.toggle("is-active", button === filterButton));
    document.querySelector("[data-product-grid]").innerHTML = matches.map((item) => productCard(item)).join("");
    telegram?.HapticFeedback?.selectionChanged();
  }
});

window.addEventListener("popstate", () => setRoute(location.hash.slice(1) || "home", false));
telegram?.BackButton?.onClick(() => setRoute("profile"));
telegram?.MainButton?.onClick(() => document.querySelector("[data-feedback-form]")?.requestSubmit());

if (isTelegram) {
  telegram.ready();
  telegram.expand();
  telegram.setHeaderColor("#08080b");
  telegram.setBackgroundColor("#08080b");
}

setRoute(location.hash.slice(1) || "home", false);
