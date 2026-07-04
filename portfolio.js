(function () {
  "use strict";

  var DATA = window.PORTFOLIO_DATA;
  if (!DATA) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function displayUrl(url) {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  function statusClass(status) {
    if (status === "CANLI") return "status-badge--live";
    if (status === "YAPIM AŞAMASINDA") return "status-badge--wip";
    return "";
  }

  function renderScreenshot(project, compact) {
    var alt = project.title + " — ekran görüntüsü";
    var aspect = compact ? "16 / 10" : "16 / 10";
    if (project.screenshotSrc) {
      return (
        '<img class="browser-screenshot-img" src="' +
        escapeHtml(project.screenshotSrc) +
        '" alt="' +
        escapeHtml(alt) +
        '" loading="lazy" />'
      );
    }
    return (
      '<div class="browser-screenshot placeholder-media" role="img" aria-label="' +
      escapeHtml(alt) +
      '" style="aspect-ratio:' +
      aspect +
      '">' +
      '<span class="placeholder-label">Yerine koy: ' +
      escapeHtml(project.screenshotFile) +
      "</span></div>"
    );
  }

  function renderBrowserCard(project, compact) {
    var statusHtml = project.status
      ? '<span class="status-badge ' +
        statusClass(project.status) +
        '">' +
        escapeHtml(project.status) +
        "</span>"
      : "";

    return (
      '<article class="browser-card' +
      (compact ? " browser-card--compact" : "") +
      ' reveal">' +
      '<div class="browser-chrome">' +
      '<div class="browser-dots" aria-hidden="true">' +
      '<span class="dot dot-red"></span>' +
      '<span class="dot dot-yellow"></span>' +
      '<span class="dot dot-green"></span>' +
      "</div>" +
      '<div class="browser-url">' +
      escapeHtml(displayUrl(project.url)) +
      "</div>" +
      "</div>" +
      renderScreenshot(project, compact) +
      '<div class="browser-body">' +
      '<div class="browser-title-row">' +
      "<h3>" +
      escapeHtml(project.title) +
      "</h3>" +
      statusHtml +
      "</div>" +
      '<p class="browser-desc">' +
      escapeHtml(project.description) +
      "</p>" +
      '<a href="' +
      escapeHtml(project.url) +
      '" class="browser-visit" target="_blank" rel="noopener noreferrer">Ziyaret Et ↗</a>' +
      "</div>" +
      "</article>"
    );
  }

  function renderSkills() {
    var container = document.getElementById("skills-groups");
    if (!container) return;

    container.innerHTML = DATA.skills
      .map(function (group) {
        var pills = group.items
          .map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          })
          .join("");
        return (
          '<div class="skills-group">' +
          "<h3>" +
          escapeHtml(group.category) +
          "</h3>" +
          '<ul class="skills-list">' +
          pills +
          "</ul></div>"
        );
      })
      .join("");
  }

  function renderExperience() {
    var container = document.getElementById("experience-list");
    if (!container) return;

    container.innerHTML = DATA.experience
      .map(function (item) {
        return (
          '<article class="timeline-card reveal">' +
          '<div class="timeline-meta">' +
          "<span>" +
          escapeHtml(item.period) +
          "</span>" +
          "<span>" +
          escapeHtml(item.location) +
          "</span></div>" +
          "<h3>" +
          escapeHtml(item.role) +
          "</h3>" +
          '<p class="timeline-company">' +
          escapeHtml(item.company) +
          "</p>" +
          '<p class="timeline-desc">' +
          escapeHtml(item.description) +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderEducation() {
    var container = document.getElementById("education-list");
    if (!container) return;

    container.innerHTML = DATA.education
      .map(function (item) {
        return (
          '<article class="edu-card reveal">' +
          "<h3>" +
          escapeHtml(item.degree) +
          "</h3>" +
          '<p class="edu-school">' +
          escapeHtml(item.school) +
          "</p>" +
          '<p class="edu-meta">' +
          escapeHtml(item.period) +
          " · " +
          escapeHtml(item.location) +
          "</p></article>"
        );
      })
      .join("");
  }

  function renderWork() {
    var clientGrid = document.getElementById("client-work-grid");
    var personalGrid = document.getElementById("personal-work-grid");
    if (!clientGrid || !personalGrid) return;

    clientGrid.innerHTML = DATA.clientProjects.items
      .map(function (project) {
        return renderBrowserCard(project, false);
      })
      .join("");

    personalGrid.innerHTML = DATA.personalProjects.items
      .map(function (project) {
        return renderBrowserCard(project, true);
      })
      .join("");
  }

  function initRevealAnimations() {
    var items = document.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add("is-visible");
      }
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );

    for (var j = 0; j < items.length; j++) {
      observer.observe(items[j]);
    }
  }

  function initStickyNav() {
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("site-nav-toggle");
    var menu = document.getElementById("site-nav-menu");
    var heroScroll = document.getElementById("hero-scroll");
    if (!nav || !heroScroll) return;

    var navLayoutCache = { heroBottom: 0 };

    function refreshNavLayoutCache() {
      navLayoutCache.heroBottom = heroScroll.offsetTop + heroScroll.offsetHeight;
    }

    function updateNav() {
      var scrollY = window.scrollY || window.pageYOffset || 0;
      nav.classList.toggle("is-visible", scrollY > window.innerHeight * 0.85);
      nav.classList.toggle("is-solid", scrollY > navLayoutCache.heroBottom - 120);
    }

    refreshNavLayoutCache();
    window.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", function () {
      refreshNavLayoutCache();
      updateNav();
    }, { passive: true });
    updateNav();

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });

      menu.addEventListener("click", function (event) {
        if (event.target.classList.contains("site-nav-link")) {
          menu.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    var links = document.querySelectorAll('.site-nav-link[href^="#"], .nav-links a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (event) {
        var id = this.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    }
  }

  function initYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  renderSkills();
  renderExperience();
  renderEducation();
  renderWork();
  initRevealAnimations();
  initStickyNav();
  initYear();
})();
