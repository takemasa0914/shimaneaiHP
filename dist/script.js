"use strict";
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
if (menuButton && mobileMenu) {
  function setMenu(open) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
    mobileMenu.hidden = !open;
  }
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });
  mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    const target = document.getElementById(link.hash.slice(1));
    setMenu(false);
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
    }
  }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !mobileMenu.hidden) {
      setMenu(false);
      menuButton.focus();
    }
  });
  const wideScreen = window.matchMedia("(min-width: 981px)");
  wideScreen.addEventListener("change", event => {
    if (event.matches) setMenu(false);
  });
}

// Scroll motion is progressive enhancement: the content remains readable without it.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const progressBar = document.querySelector(".reading-progress > span");
const landscape = document.querySelector(".hero-visual > img");
const landscapeFrame = document.querySelector(".hero-visual");
const visionSection = document.querySelector(".vision-section");
const visionWordmark = document.querySelector(".vision-wordmark");
let revealObserver = null;
let scrollScheduled = false;

function drawScrollEffects() {
  scrollScheduled = false;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  if (reduceMotion.matches) return;
  if (landscape && landscapeFrame) {
    const rect = landscapeFrame.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const shift = Math.max(-22, Math.min(22, (window.innerHeight / 2 - rect.top - rect.height / 2) * .055));
      landscape.style.transform = `scale(1.09) translateY(${shift}px)`;
    }
  }
  if (visionSection && visionWordmark) {
    const rect = visionSection.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const shift = Math.max(-70, Math.min(70, (rect.top - window.innerHeight / 2) * -.1));
      visionWordmark.style.transform = `translateX(${shift}px)`;
    }
  }
}
function scheduleScrollEffects() {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(drawScrollEffects);
  }
}
function setupMotion() {
  if (revealObserver) revealObserver.disconnect();
  if (reduceMotion.matches) {
    document.documentElement.classList.remove("motion-ready");
    document.querySelectorAll(".reveal-pending").forEach(node => node.classList.add("is-visible"));
    if (landscape) landscape.style.removeProperty("transform");
    if (visionWordmark) visionWordmark.style.removeProperty("transform");
    return;
  }
  document.documentElement.classList.add("motion-ready");
  if (!("IntersectionObserver" in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
  const targets = document.querySelectorAll(".section-label,.about-grid h2,.about-copy,.network,.section-heading,.service-card,.project-row,.group-cases,.vision-inner>.eyebrow,.vision-inner h2,.vision-description,.vision-pillars article,.hackathon-heading,.hackathon-copy,.hackathon-poster,.event-facts,.member-list>li,.consultation-copy,.consultation-panel,.company-grid");
  targets.forEach(node => {
    if (node.matches(".service-card,.member-list>li,.vision-pillars article")) {
      const index = Array.prototype.indexOf.call(node.parentElement.children, node);
      node.style.setProperty("--reveal-delay", `${Math.min(index, 3) * 75}ms`);
    }
    node.classList.add("reveal-pending");
    revealObserver.observe(node);
  });
}
setupMotion();
reduceMotion.addEventListener("change", setupMotion);
window.addEventListener("scroll", scheduleScrollEffects, { passive: true });
window.addEventListener("resize", scheduleScrollEffects, { passive: true });
window.addEventListener("load", scheduleScrollEffects, { once: true });
drawScrollEffects();
// Internal links must also reveal their targets for keyboard and anchor navigation.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", () => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    if (target.classList.contains("reveal-pending")) target.classList.add("is-visible");
    target.querySelectorAll(".reveal-pending").forEach(node => node.classList.add("is-visible"));
  });
});

// No private account email is published automatically. An approved address or
// existing form URL activates the consultation link without changing the layout.
const contactConfig = window.shimaneAIContact || {};
const consultationLink = document.getElementById("consultation-contact");
const consultationNote = document.getElementById("consultation-contact-note");
let consultationUrl = "";
let consultationHelp = "";
if (typeof contactConfig.formUrl === "string" && contactConfig.formUrl) {
  try {
    const url = new URL(contactConfig.formUrl);
    if (url.protocol === "https:" && !url.username && !url.password) {
      consultationUrl = url.href;
      consultationHelp = "相談フォームが開きます。現在のお困りごとをお聞かせください。";
    }
  } catch { /* Keep the clear preparation notice for invalid configuration. */ }
}
if (!consultationUrl && typeof contactConfig.email === "string" && /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(contactConfig.email)) {
  const subject = encodeURIComponent("【ShimaneAI】無料相談の申し込み");
  const body = encodeURIComponent("お名前：\n会社・団体名：\n返信先のメールアドレス：\n\nご相談内容：\n\nご希望の連絡方法・日時：\n");
  consultationUrl = `mailto:${encodeURIComponent(contactConfig.email)}?subject=${subject}&body=${body}`;
  consultationHelp = "メールアプリが開きます。内容を記入し、ご確認のうえ送信してください。";
}
if (consultationUrl && consultationLink) {
  consultationLink.href = consultationUrl;
  if (consultationUrl.startsWith("https:")) {
    consultationLink.target = "_blank";
    consultationLink.rel = "noopener noreferrer";
  }
  consultationNote.textContent = consultationHelp;
  document.getElementById("consultation-ready").hidden = false;
  document.getElementById("consultation-pending").hidden = true;
}
