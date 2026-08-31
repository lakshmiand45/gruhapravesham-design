"use strict";

/* ==========================================================================
   Griha Pravesham Invitation — behaviour
   Each section below wires one independent piece of the page.
   ========================================================================== */

const CORNER_ORNAMENT = `
  <svg viewBox="0 0 40 40" fill="none">
    <path d="M2 2c10 0 16 3 20 10M2 2c0 10 3 16 10 20" stroke="#9C7326" stroke-width="2" stroke-linecap="round"/>
    <circle cx="6" cy="6" r="2.4" fill="#C9A227"/>
  </svg>`;

const PEACOCK_EYE = `
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="#C9A227" stroke-width="1"/>
    <circle cx="12" cy="12" r="5.5" fill="none" stroke="#2F5FA8" stroke-width="1"/>
    <circle cx="12" cy="12" r="2.5" fill="#E8CD6E"/>
  </svg>`;

function addPanelCorners() {
  document.querySelectorAll(".panel").forEach((panel) => {
    ["tl", "tr", "bl", "br"].forEach((corner) => {
      const span = document.createElement("span");
      span.className = `panel__corner panel__corner--${corner}`;
      span.innerHTML = CORNER_ORNAMENT;
      panel.appendChild(span);
    });
  });
}

function addDividerEyes() {
  document.querySelectorAll(".divider__eye").forEach((el) => {
    el.innerHTML = PEACOCK_EYE;
  });
}

function buildFeatherGarlands(unitCount = 15) {
  document.querySelectorAll(".feather-garland").forEach((garland) => {
    for (let i = 0; i < unitCount; i++) {
      const unit = document.createElement("div");
      unit.className = "feather-unit";
      unit.innerHTML = `
        <div class="feather-string"></div>
        <div class="feather-quill"></div>
        ${i % 3 === 1 ? '<div class="feather-eye"></div>' : ""}
      `;
      garland.appendChild(unit);
    }
  });
}

function wireCoverGate() {
  const cover = document.getElementById("cover");
  const page = document.getElementById("page");
  const sealBtn = document.getElementById("seal-btn");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.classList.add("is-locked");

  sealBtn.addEventListener("click", () => {
    document.body.classList.remove("is-locked");

    if (prefersReducedMotion) {
      cover.hidden = true;
      page.classList.add("is-visible");
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in-view"));
      return;
    }

    cover.classList.add("is-opening");
    setTimeout(() => {
      cover.hidden = true;
      requestAnimationFrame(() => page.classList.add("is-visible"));
    }, 550);
  });
}

function wireScrollReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

function wireCountdown() {
  // Placeholder ceremony date/time — update to the real muhurtham date & time.
  const TARGET = new Date("2026-09-12T17:00:00");
  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const diff = Math.max(0, TARGET.getTime() - Date.now());
    els.days.textContent = pad(Math.floor(diff / 86400000));
    els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    els.mins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    els.secs.textContent = pad(Math.floor((diff % 60000) / 1000));
  }

  tick();
  setInterval(tick, 1000);
}

function wireVenueMapLink() {
  const addressEl = document.getElementById("venue-address");
  const mapLink = document.getElementById("map-link");
  const query = encodeURIComponent(addressEl.textContent.trim());
  mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function wirePetalCanvas() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("petal-canvas");
  if (prefersReducedMotion) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext("2d");
  const COLORS = ["#2C9678", "#1E7A63", "#C9A227"];
  let width, height, petals;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function makePetal() {
    return {
      x: Math.random() * width,
      y: Math.random() * -height,
      radius: 4 + Math.random() * 4,
      speed: 0.4 + Math.random() * 0.6,
      drift: Math.random() * 0.8 - 0.4,
      angle: Math.random() * Math.PI * 2,
      spin: Math.random() * 0.02 - 0.01,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    petals.forEach((petal, index) => {
      petal.y += petal.speed;
      petal.x += petal.drift + Math.sin(petal.y * 0.01) * 0.3;
      petal.angle += petal.spin;

      if (petal.y > height + 10) {
        petals[index] = makePetal();
        petals[index].y = -10;
        return;
      }

      ctx.save();
      ctx.translate(petal.x, petal.y);
      ctx.rotate(petal.angle);
      ctx.fillStyle = petal.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, petal.radius, petal.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }

  resize();
  petals = Array.from({ length: 22 }, makePetal);
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
}

function init() {
  addPanelCorners();
  addDividerEyes();
  buildFeatherGarlands();
  wireCoverGate();
  wireScrollReveal();
  wireCountdown();
  wireVenueMapLink();
  wirePetalCanvas();
}

document.addEventListener("DOMContentLoaded", init);
