(function () {
  "use strict";

  var I18N = window.STUB_I18N;
  var STORAGE_LANG = "stub-lang";
  var STORAGE_AGREE = "stub-agreed";
  var DRUM_DELAY = 3200;

  var state = { lang: "ru" };

  var els = {
    html: document.documentElement,
    drum: document.querySelector("[data-drum]"),
    track: document.querySelector("[data-drum-track]"),
    notice: document.querySelector("[data-notice]"),
    noticeText: document.querySelector("[data-notice-text]"),
    agree: document.querySelector("[data-agree]"),
    footer: document.querySelector("[data-footer-links]"),
    copyright: document.querySelector("[data-copyright]"),
    contacts: document.querySelector("[data-contacts]"),
    langButtons: [].slice.call(document.querySelectorAll("[data-lang]")),
    modal: document.querySelector("[data-modal]"),
    modalTitle: document.querySelector("[data-modal-title]"),
    modalBody: document.querySelector("[data-modal-body]")
  };

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  }

  var drum = {
    timer: null,
    index: 0,
    count: 0,
    rows: [],

    build: function (phrases) {
      var html = "";
      var repeats = 3;
      var i;
      var phrase;

      for (i = 0; i < phrases.length * repeats; i++) {
        phrase = phrases[i % phrases.length];

        html +=
          '<p class="drum__row">' +
            '<span class="drum__big">' + phrase + "</span>" +
            '<span class="drum__small">' + phrase.replace(/<br\s*\/?>/gi, " ") + "</span>" +
          "</p>";
      }

      els.track.innerHTML = html;
      this.rows = [].slice.call(els.track.children);
      this.count = phrases.length;
      this.reset();
    },

    setActive: function () {
      var active = this.index + 1;
      var i;

      for (i = 0; i < this.rows.length; i++) {
        this.rows[i].classList.toggle("is-active", i === active);
      }
    },

    offset: function () {
      var row = this.rows[0] ? this.rows[0].offsetHeight : 0;
      return row * 1.5 - els.drum.clientHeight / 2 + this.index * row;
    },

    apply: function (animate) {
      els.track.classList.toggle("is-animating", !!animate);
      els.track.style.transform = "translate3d(0, " + -this.offset() + "px, 0)";
      this.setActive();
    },

    reset: function () {
      var self = this;

      els.track.classList.add("is-resetting");
      this.index = 0;
      this.apply(false);

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          els.track.classList.remove("is-resetting");
        });
      });
    },

    step: function () {
      this.index += 1;
      this.apply(true);
    },

    start: function () {
      var self = this;
      this.stop();
      this.timer = window.setInterval(function () { self.step(); }, DRUM_DELAY);
    },

    stop: function () {
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }
  };

  if (els.track) {
    els.track.addEventListener("transitionend", function (e) {
      if (e.target !== els.track || e.propertyName !== "transform") return;

      if (drum.index >= drum.count) drum.reset();
    });
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () { drum.reset(); }, 150);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) drum.stop();
    else drum.start();
  });

  function renderFooter(data) {
    var html = "";
    var i;

    for (i = 0; i < data.footer.length; i++) {
      html +=
        '<li><a class="footer__link" href="#" data-modal-open="' +
        data.footer[i].key + '">' + data.footer[i].label + "</a></li>";
    }

    els.footer.innerHTML = html;
  }

  function setLang(lang) {
    var data = I18N[lang];
    if (!data) return;

    state.lang = lang;
    els.html.setAttribute("lang", data.htmlLang);
    safeSet(STORAGE_LANG, lang);

    drum.build(data.phrases);
    drum.start();

    els.noticeText.innerHTML = data.notice;
    els.agree.textContent = data.agree;
    els.copyright.innerHTML = data.copyright;
    els.contacts.innerHTML = data.contacts;
    renderFooter(data);

    els.langButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });

    if (els.modal.classList.contains("is-open")) {
      var key = els.modal.getAttribute("data-current");
      if (key) openModal(key);
    }
  }

  var langBar = document.querySelector(".lang");

  if (langBar) {
    langBar.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-lang]") : null;
      if (!btn) return;

      e.preventDefault();
      setLang(btn.getAttribute("data-lang"));
    });
  }

  function hideNotice() {
    els.notice.classList.add("is-hidden");
    safeSet(STORAGE_AGREE, "1");
  }

  if (els.agree) els.agree.addEventListener("click", hideNotice);
  if (safeGet(STORAGE_AGREE) === "1") els.notice.classList.add("is-hidden");

  function openModal(key) {
    var content = I18N[state.lang].modals[key];
    if (!content) return;

    els.modal.setAttribute("data-current", key);
    els.modalTitle.textContent = content.title;
    els.modalBody.innerHTML = content.body;
    els.modalBody.scrollTop = 0;
    els.modal.classList.add("is-open");
    document.body.classList.add("is-locked");
  }

  function closeModal() {
    els.modal.classList.remove("is-open");
    els.modal.removeAttribute("data-current");
    document.body.classList.remove("is-locked");
  }

  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;

    var opener = e.target.closest("[data-modal-open]");
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute("data-modal-open"));
      return;
    }

    if (e.target.closest("[data-modal-close]") || e.target === els.modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  setLang(safeGet(STORAGE_LANG) || "ru");
})();
