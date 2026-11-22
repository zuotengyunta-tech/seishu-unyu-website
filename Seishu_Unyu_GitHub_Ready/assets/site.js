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
  const captions = photos.map((photo) => photo.dataset.caption);
  const descriptions = photos.map((photo) => photo.dataset.description);
  const count = document.querySelector("#slide-count");
  const caption = document.querySelector("#photo-caption");
  const status = document.querySelector("#slide-status");
  let current = 0;
  function move(direction) {
    current = (current + direction + photos.length) % photos.length;
    photos.forEach((photo, index) => {
      const selected = index === current;
      photo.classList.toggle("active", selected);
      photo.setAttribute("aria-hidden", String(!selected));
    });
    count.textContent = String(current + 1).padStart(2, "0");
    caption.textContent = captions[current];
    status.textContent = "写真" + (current + 1) + " / " + photos.length + "　" + descriptions[current];
  }
  gallery.querySelectorAll("[data-dir]").forEach((button) => {
    button.addEventListener("click", () => move(Number(button.dataset.dir)));
  });
  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
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
    if (Math.abs(dx) > 55 && Math.abs(dx) > 1.6 * Math.abs(dy)) move(dx < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });
  gallery.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
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
  const recipient = "atsumi@seishu-unyu.jp";
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
    document.querySelector("#open-email").href = "mailto:" + recipient + "?subject=" + encodeURIComponent(subject()) + "&body=" + encodeURIComponent(mailBody());
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
    const content = "宛先 " + recipient + "\r\n件名 " + subject() + "\r\n\r\n" + mailBody();
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
    const content = "宛先 " + recipient + line + "件名 " + subject() + line + line + mailBody();
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
