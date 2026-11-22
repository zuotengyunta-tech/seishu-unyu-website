"use strict";

function setupMenu() {
  const trigger = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");
  if (!trigger || !navigation) return;

  const setOpen = (open) => {
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    navigation.classList.toggle("is-open", open);
  };
  trigger.addEventListener("click", () => setOpen(trigger.getAttribute("aria-expanded") !== "true"));
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  const header = trigger.closest("header");
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });
  header.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      trigger.focus();
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

function setupGallery() {
  const gallery = document.querySelector(".hero-visual");
  if (!gallery) return;

  const photos = Array.from(gallery.querySelectorAll(".hero-slide"));
  if (photos.length < 2) return;
  const captions = photos.map((photo) => photo.dataset.caption || "");
  const descriptions = photos.map((photo) => photo.dataset.description || "");
  const count = gallery.querySelector("#slide-count");
  const caption = gallery.querySelector("#photo-caption");
  const status = gallery.querySelector("#slide-status");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const INTERVAL_MS = 5500; // Automatic slide change interval. Adjust here if desired.
  let current = photos.findIndex((photo) => photo.classList.contains("active"));
  if (current < 0) current = 0;
  let timer = null;
  let manualPaused = motionPreference.matches;
  let hovered = false;
  let focused = false;

  function playing() {
    return !manualPaused && !hovered && !focused && !document.hidden;
  }
  // The gallery has no play/pause button. Screen-reader updates remain quiet
  // during automatic changes, while reduced-motion preferences are respected.
  if (status) status.setAttribute("aria-live", "off");
  function move(direction) {
    current = (current + direction + photos.length) % photos.length;
    photos.forEach((photo, index) => {
      const selected = index === current;
      photo.classList.toggle("active", selected);
      photo.setAttribute("aria-hidden", String(!selected));
    });
    if (count) count.textContent = String(current + 1).padStart(2, "0");
    if (caption) caption.textContent = captions[current];
    if (status) status.textContent = "写真" + (current + 1) + " / " + photos.length + "　" + descriptions[current];
  }
  function stopTimer() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
  }
  function schedule() {
    stopTimer();
    if (!playing()) return;
    timer = window.setTimeout(() => {
      timer = null;
      move(1);
      schedule();
    }, INTERVAL_MS);
  }
  function manuallyMove(direction) {
    move(direction);
    schedule();
  }
  gallery.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("click", () => manuallyMove(Number(button.dataset.dir)));
  });
  gallery.addEventListener("mouseenter", () => { hovered = true; schedule(); });
  gallery.addEventListener("mouseleave", () => { hovered = false; schedule(); });
  gallery.addEventListener("focusin", () => { focused = true; schedule(); });
  gallery.addEventListener("focusout", () => {
    // Defer the focus check until the next task, after focus has moved.
    window.setTimeout(() => {
      focused = gallery.contains(document.activeElement);
      schedule();
    }, 0);
  });
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      manuallyMove(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  let touchStart = null;
  gallery.addEventListener("touchstart", (event) => {
    touchStart = event.touches.length === 1 ? [event.touches[0].clientX, event.touches[0].clientY] : null;
  }, { passive: true });
  gallery.addEventListener("touchend", (event) => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart[0];
    const dy = event.changedTouches[0].clientY - touchStart[1];
    if (Math.abs(dx) > 55 && Math.abs(dx) > 1.6 * Math.abs(dy)) manuallyMove(dx < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });
  gallery.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  motionPreference.addEventListener("change", (event) => {
    manualPaused = event.matches;
    schedule();
  });
  schedule();
}

function setupInquiry() {
  const form = document.querySelector("#inquiry-form");
  if (!form) return;

  const kind = form.querySelector("#kind");
  const organization = form.querySelector("#organization");
  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const message = form.querySelector("#message");
  const review = document.querySelector("#review");
  const reviewHeading = document.querySelector("#review-heading");
  const values = document.querySelector("#review-values");
  const status = document.querySelector("#save-status");
  const query = new URLSearchParams(window.location.search);
  const requestedKind = query.get("service");
  if (Array.from(kind.options).some((option) => option.value === requestedKind)) kind.value = requestedKind;
  const role = { trailer: "トレーラードライバー", crane: "3tユニックドライバー" }[query.get("role")];
  if (kind.value === "recruit" && typeof role === "string") message.value = role + "について相談します。";
  const recipient = () => window.__seishuSiteSettings?.email || "atsumi@seishu-unyu.jp";
  const rows = () => [
    ["お問い合わせの種類", kind.selectedOptions[0].textContent],
    ["会社名", organization.value.trim() || "未入力"],
    ["お名前", name.value.trim()],
    ["メールアドレス", email.value.trim()],
    ["お問い合わせ内容", message.value.trim()]
  ];

  const subject = () => "【お問い合わせ】" + kind.selectedOptions[0].textContent + "／" + name.value.trim();
  const mailBody = () => "勢州運輸有限会社 ご担当者様\r\n\r\n" + rows().map(([label, value]) => "【" + label + "】\r\n" + value).join("\r\n\r\n");

  [name, message].forEach((field) => field.addEventListener("input", () => field.setCustomValidity("")));
  form.querySelector("#review-button").disabled = false;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    [name, message].forEach((field) => field.setCustomValidity(field.value.trim() ? "" : "入力してください。"));
    if (!form.reportValidity()) return;
    values.replaceChildren();
    rows().forEach(([label, content]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = content;
      row.append(dt, dd);
      values.append(row);
    });
    form.hidden = true;
    review.hidden = false;
    status.textContent = "";
    document.querySelector("#open-email").href = "mailto:" + recipient() + "?subject=" + encodeURIComponent(subject()) + "&body=" + encodeURIComponent(mailBody());
    document.querySelector("#copy-fallback").hidden = true;
    reviewHeading.focus();
  });
  document.querySelector("#edit-inquiry").addEventListener("click", () => {
    review.hidden = true;
    form.hidden = false;
    document.querySelector("#copy-fallback").hidden = true;
    kind.focus();
  });
  document.querySelector("#copy-inquiry").addEventListener("click", async () => {
    const content = "宛先 " + recipient() + "\r\n件名 " + subject() + "\r\n\r\n" + mailBody();
    try {
      await navigator.clipboard.writeText(content);
      status.textContent = "宛先と本文をコピーしました。メールに貼り付けて送信してください。";
    } catch {
      const fallback = document.querySelector("#copy-fallback");
      const text = document.querySelector("#copy-content");
      text.value = content;
      fallback.hidden = false;
      text.focus();
      text.select();
      status.textContent = "下の文章を選択してコピーしてください。";
    }
  });
  document.querySelector("#save-inquiry").addEventListener("click", () => {
    const line = "\r\n";
    const content = "宛先 " + recipient() + line + "件名 " + subject() + line + line + mailBody();
    const file = new Blob(["\uFEFF", content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "勢州運輸_お問い合わせメモ.txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = "相談メモのダウンロードを開始しました。";
  });
}

setupMenu();
setupGallery();
setupInquiry();


// Pages CMS content integration: JSON files in assets/content are the only content source.
// All visitor-supplied text is inserted via textContent; do not use innerHTML for posts.
async function loadCMSContent() {
  const fetchJSON = async (path) => {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${path}`);
    return response.json();
  };
  try {
    const config = await fetchJSON("assets/content/site.json");
    if (config && typeof config === "object" && !Array.isArray(config)) applySiteSettings(config);
  } catch (error) {
    console.warn("サイト設定は既定の表示を使用します", error);
  }
  if (document.querySelector("#news-entries") || document.querySelector("[data-cms-latest-news]")) {
    try {
      const news = await fetchJSON("assets/content/news.json");
      if (Array.isArray(news)) renderNews(news);
    } catch (error) {
      console.warn("お知らせを取得できませんでした", error);
    }
  }
}

function applySiteSettings(settings) {
  window.__seishuSiteSettings = settings;
  document.querySelectorAll("[data-cms]").forEach((target) => {
    const value = settings[target.dataset.cms];
    if (typeof value === "string" && value.trim()) target.textContent = value;
  });
  const phone = String(settings.phone || "").trim();
  if (phone && /^[0-9\-()+\s]{8,26}$/.test(phone)) {
    document.querySelectorAll('a[href^="tel:"]').forEach((anchor) => {
      anchor.href = "tel:" + phone.replace(/[^\d+]/g, "");
      for (const node of anchor.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && /[0-9]{2,4}-[0-9]{2,4}-[0-9]{4}/.test(node.textContent)) {
          node.textContent = node.textContent.replace(/[0-9]{2,4}-[0-9]{2,4}-[0-9]{4}/, phone);
        }
      }
    });
  }
  const fax = String(settings.fax || "").trim();
  if (fax && /^[0-9\-()+\s]{8,26}$/.test(fax)) {
    document.querySelectorAll(".footer-lower, .contact-channels").forEach((parent) => {
      const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        node.textContent = node.textContent.replace(/FAX\s+[0-9]{2,4}-[0-9]{2,4}-[0-9]{4}/g, "FAX　" + fax);
      }
    });
  }
  const email = String(settings.email || "").trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.querySelectorAll('a[href^="mailto:"]').forEach((anchor) => {
      anchor.href = "mailto:" + email;
      if (anchor.textContent.includes("@")) anchor.textContent = email;
    });
  }
}

function renderNews(items) {
  const published = items
    .filter((item) => item && item.published === true && typeof item.title === "string" && item.title.trim())
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const headline = document.querySelector("[data-cms-latest-news]");
  if (headline && published.length) {
    headline.textContent = published[0].title;
    const link = headline.closest("a");
    if (link) link.href = "news.html";
    const label = document.querySelector(".ribbon-label");
    if (label) label.textContent = "NEWS";
  }
  const target = document.querySelector("#news-entries");
  if (!target || !published.length) return;
  target.replaceChildren();
  published.forEach((item) => {
    const article = document.createElement("article");
    article.className = "cms-news-card";
    const header = document.createElement("div");
    header.className = "cms-news-meta";
    const date = document.createElement("time");
    const rawDate = typeof item.date === "string" ? item.date : "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
      date.dateTime = rawDate;
      date.textContent = rawDate.replace(/-/g, ".");
    }
    const category = document.createElement("span");
    category.textContent = { notice: "お知らせ", recruit: "採用情報", press: "その他" }[item.category] || "お知らせ";
    header.append(date, category);
    const heading = document.createElement("h2");
    heading.textContent = item.title;
    const body = document.createElement("p");
    body.className = "cms-news-body";
    body.textContent = typeof item.body === "string" ? item.body : "";
    article.append(header, heading, body);
    target.append(article);
  });
}

loadCMSContent();
