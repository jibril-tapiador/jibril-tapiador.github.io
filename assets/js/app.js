(function () {
  "use strict";

  var DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";

  /* Technologies and tools from my resume. */
  var SKILLS = [
    { title: "Ruby", icon: "ruby/ruby-original", shine: 0.9 },
    { title: "Ruby on Rails", icon: "rails/rails-plain", shine: 1 },
    { title: "JavaScript", icon: "javascript/javascript-original", shine: 1.1 },
    { title: "Python", icon: "python/python-original", shine: 0.7 },
    { title: "GraphQL", icon: "graphql/graphql-plain", shine: 1.2 },
    { title: "React", icon: "react/react-original", shine: 1 },
    { title: "React Native", icon: "react/react-original", shine: 0.9 },
    { title: "Vue.js", icon: "vuejs/vuejs-original", shine: 0.8 },
    { title: "Expo", icon: "expo/expo-original", shine: 0.8, invertOnDark: true },
    { title: "Bootstrap", icon: "bootstrap/bootstrap-original", shine: 1 },
    { title: "PostgreSQL", icon: "postgresql/postgresql-original", shine: 0.8 },
    { title: "Redis", icon: "redis/redis-original", shine: 0.9 },
    { title: "Docker", icon: "docker/docker-original", shine: 0.9 },
    {
      title: "AWS",
      icon: "amazonwebservices/amazonwebservices-plain-wordmark",
      shine: 1,
    },
    { title: "Heroku", icon: "heroku/heroku-original", shine: 0.8 },
    { title: "Git", icon: "git/git-original", shine: 0.9 },
  ];

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function throttle(fn, wait) {
    var last = 0;
    return function (arg) {
      var now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(arg);
      }
    };
  }

  /* ======================================================================
     Theme: light / dark / system
     ====================================================================== */

  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      var value = localStorage.getItem("theme");
      if (value === "light" || value === "dark" || value === "system") {
        return value;
      }
    } catch (err) {
      /* Storage can be unavailable in private mode. */
    }
    return "system";
  }

  function applyTheme(theme) {
    var dark = theme === "dark" || (theme === "system" && systemDark.matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  function setTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (err) {
      /* Ignore write failures. */
    }
    applyTheme(theme);
    syncThemeMenu(theme);
  }

  function syncThemeMenu(theme) {
    var items = document.querySelectorAll(".theme-menu button");
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute(
        "aria-checked",
        items[i].dataset.theme === theme ? "true" : "false"
      );
    }
  }

  systemDark.addEventListener("change", function () {
    if (storedTheme() === "system") applyTheme("system");
  });

  function initThemeControls() {
    var groups = document.querySelectorAll(".theme");

    groups.forEach(function (group) {
      var button = group.querySelector(".theme-toggle");
      var menu = group.querySelector(".theme-menu");
      if (!button || !menu) return;

      button.addEventListener("click", function (event) {
        event.stopPropagation();
        var open = menu.hidden;
        closeThemeMenus();
        if (open) {
          menu.hidden = false;
          button.setAttribute("aria-expanded", "true");
        }
      });

      menu.addEventListener("click", function (event) {
        var target = event.target.closest("button[data-theme]");
        if (!target) return;
        setTheme(target.dataset.theme);
        closeThemeMenus();
      });
    });

    document.addEventListener("click", closeThemeMenus);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeThemeMenus();
        closeDrawer();
      }
    });

    syncThemeMenu(storedTheme());
  }

  function closeThemeMenus() {
    document.querySelectorAll(".theme-menu").forEach(function (menu) {
      menu.hidden = true;
    });
    document.querySelectorAll(".theme-toggle").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  /* ======================================================================
     Mobile drawer
     ====================================================================== */

  function openDrawer() {
    var drawer = document.getElementById("drawer");
    var overlay = document.getElementById("drawer-overlay");
    if (!drawer || !overlay) return;
    drawer.hidden = false;
    overlay.hidden = false;
    document.querySelector(".menu-trigger").setAttribute("aria-expanded", "true");
  }

  function closeDrawer() {
    var drawer = document.getElementById("drawer");
    var overlay = document.getElementById("drawer-overlay");
    if (!drawer || !overlay) return;
    drawer.hidden = true;
    overlay.hidden = true;
    var trigger = document.querySelector(".menu-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  }

  function initDrawer() {
    var trigger = document.querySelector(".menu-trigger");
    var overlay = document.getElementById("drawer-overlay");
    var drawer = document.getElementById("drawer");
    if (!trigger || !overlay || !drawer) return;

    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      drawer.hidden ? openDrawer() : closeDrawer();
    });
    overlay.addEventListener("click", closeDrawer);
    drawer.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", closeDrawer);
    });
  }

  /* ======================================================================
     Mouse-tracking 3D tilt
     ====================================================================== */

  function createTilt(el, options) {
    var xMax = options.xMax;
    var yMax = options.yMax;
    var perspective = options.perspective;
    var phase = options.randStart ? Math.random() * 4000 : 0;

    var idle = true;
    var idleStart = Date.now();
    var rot = { x: 0, y: 0 };
    var idleTimer = null;
    var frame = null;

    function render() {
      el.style.transform =
        "perspective(" +
        perspective +
        "px) rotateX(" +
        rot.x +
        "deg) rotateY(" +
        rot.y +
        "deg) scale3d(1, 1, 1)";
    }

    function loop() {
      if (idle) {
        var t = ((Date.now() - idleStart + phase) / 4000) * Math.PI * 2;
        rot = { x: Math.sin(t) * xMax, y: Math.cos(t) * yMax };
        render();
      }
      frame = requestAnimationFrame(loop);
    }

    var track = throttle(function (event) {
      var rect = el.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      rot = { x: (y - centerY) / 20, y: (centerX - x) / 20 };
      render();
    }, 50);

    function onMove(event) {
      idle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        idle = true;
        idleStart = Date.now();
      }, 3000);
      track(event);
    }

    function onLeave() {
      clearTimeout(idleTimer);
      idle = true;
      idleStart = Date.now();
      rot = { x: 0, y: 0 };
      render();
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    render();
    if (!reduceMotion.matches) frame = requestAnimationFrame(loop);

    return function destroy() {
      clearTimeout(idleTimer);
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }

  /* ======================================================================
     Skill cards
     ====================================================================== */

  function skillCardMarkup(skill) {
    return (
      '<div class="skill-card is-idle" data-shine="' +
      (skill.shine || 1) +
      '">' +
      '<div class="skill-card__shine">' +
      '<div class="s r"></div><div class="s g"></div><div class="s b"></div>' +
      "</div>" +
      '<div class="skill-card__spot"></div>' +
      '<div class="skill-card__icon">' +
      '<img src="' +
      DEVICON +
      skill.icon +
      '.svg" alt="' +
      skill.title +
      '"' +
      (skill.invertOnDark ? " data-invert-on-dark" : "") +
      ">" +
      "</div>" +
      '<div class="skill-card__label">' +
      skill.title +
      "</div>" +
      "</div>"
    );
  }

  function initSkillCard(card) {
    var shine = parseFloat(card.dataset.shine) || 1;
    var target = { x: 50, y: 50 };
    var current = { x: 50, y: 50 };
    var frame = null;

    var destroyTilt = createTilt(card, {
      xMax: 10,
      yMax: 15,
      perspective: 700,
      randStart: true,
    });

    function spotLoop() {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      card.style.setProperty("--mxp", current.x + "%");
      card.style.setProperty("--myp", current.y + "%");
      frame = requestAnimationFrame(spotLoop);
    }

    function pointFrom(clientX, clientY) {
      var rect = card.getBoundingClientRect();
      var x = clientX - rect.left;
      var y = clientY - rect.top;
      target.x = Math.min(100, Math.max(0, (x / rect.width) * 100));
      target.y = Math.min(100, Math.max(0, (y / rect.height) * 100));
      card.style.setProperty(
        "--spot-size",
        Math.max(32, Math.min(shine * 64, 110)) + "px"
      );
      card.classList.remove("is-idle");
      card.classList.add("is-hovering");
      if (!frame) frame = requestAnimationFrame(spotLoop);
    }

    card.addEventListener("pointerenter", function () {
      card.classList.remove("is-idle");
      card.classList.add("is-hovering");
      if (!frame) frame = requestAnimationFrame(spotLoop);
    });

    card.addEventListener("pointermove", function (event) {
      pointFrom(event.clientX, event.clientY);
    });

    card.addEventListener(
      "touchmove",
      function (event) {
        if (!event.touches || !event.touches.length) return;
        pointFrom(event.touches[0].clientX, event.touches[0].clientY);
      },
      { passive: true }
    );

    card.addEventListener("pointerleave", function () {
      card.classList.add("is-idle");
      card.classList.remove("is-hovering");
      target.x = 50;
      target.y = 50;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    });

    return function destroy() {
      destroyTilt();
      if (frame) cancelAnimationFrame(frame);
    };
  }

  /* ======================================================================
     Views
     ====================================================================== */

  function heroMarkup() {
    return (
      '<div class="card hero tilt" id="hero">' +
      '<div class="hero-inner">' +
      '<span class="hero-avatar">' +
      '<img src="assets/jib.jpg" alt="Jibril Tapiador" width="360" height="360">' +
      "</span>" +
      '<div class="hero-text">' +
      '<div class="hero-name">Jibril Tapiador</div>' +
      '<div class="hero-role">Senior Ruby on Rails Engineer</div>' +
      '<div class="hero-meta">@Davao, Philippines</div>' +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function homeMarkup() {
    return (
      '<div class="animate-fade-in">' +
      heroMarkup() +
      '<div class="card" style="margin-bottom:16px">' +
      '<div class="card-header"><div class="card-title">Hey there!</div></div>' +
      '<div class="card-content">' +
      "My name is Jibril Tapiador and I'm a senior Ruby on Rails engineer and " +
      "technical lead based in Davao, Philippines. With 6+ years of experience " +
      "building and scaling web products, I care most about software that stays " +
      "fast, maintainable, and genuinely useful to the people who depend on it." +
      "<br><br>" +
      "My work spans from architecting Rails APIs and leading cross-functional " +
      "engineering teams, to shipping frontend and mobile work in React Native, " +
      "Expo, and Vue. I've delivered a " +
      '<a href="https://apps.apple.com/us/app/bump-connect-social-community/id6475402930" target="_blank" rel="noreferrer noopener">social media app</a>' +
      ", a video recording tool for " +
      '<a href="https://dashcam.io/" target="_blank" rel="noreferrer noopener">capturing highlights in software</a>' +
      ", a telehealth pharmacy platform connecting doctors and patients by " +
      "video, and a CRM for the " +
      '<a href="https://customtattoodesign.ca/" target="_blank" rel="noreferrer noopener">biggest online tattoo design website</a>' +
      "<br><br>" +
      "Away from the keyboard you'll usually find me on " +
      '<a href="https://leetcode.com/u/jibriltapiador/" target="_blank" rel="noreferrer noopener">LeetCode</a>' +
      ", sharpening my data structures, algorithms, and PostgreSQL skills." +
      "<br><br>" +
      "Looking for my resume? You can find a copy of it " +
      '<a href="assets/jibril-tapiador-cv.pdf" target="_blank" rel="noreferrer noopener">here</a>!' +
      "</div>" +
      "</div>" +
      '<div class="card skills-card">' +
      '<div class="card-header">' +
      '<div class="card-title">Skills</div>' +
      '<div class="card-description">A showcase of the technologies and tools I have experience with.</div>' +
      "</div>" +
      '<div class="card-content">' +
      '<div class="skills-marquee" id="skills-marquee">' +
      SKILLS.concat(SKILLS).map(skillCardMarkup).join("") +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function contactMarkup() {
    return (
      '<div class="animate-fade-in">' +
      '<div class="card">' +
      '<div class="card-header"><h1 class="card-title card-title--lg">Contact</h1></div>' +
      '<div class="card-content">' +
      "Got any questions or want to chat? Feel free to reach out!" +
      '<div class="contact-email">' +
      '<a href="mailto:tapiador@jib.is">tapiador@jib.is</a>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function skillsMarkup() {
    return (
      '<div class="animate-fade-in">' +
      '<h1 class="skills-page-title">Skills</h1>' +
      '<div class="skills-grid">' +
      SKILLS.map(skillCardMarkup).join("") +
      "</div>" +
      "</div>"
    );
  }

  /* ======================================================================
     Skills marquee
     ====================================================================== */

  function initMarquee(track) {
    if (reduceMotion.matches) return function () {};

    var offset = 0;
    var paused = false;
    var frame;

    function step() {
      if (!paused) {
        offset += 0.35;
        if (offset >= track.scrollWidth / 2) offset = 0;
        track.scrollLeft = offset;
      }
      frame = requestAnimationFrame(step);
    }

    function pause() {
      paused = true;
    }
    function resume() {
      paused = false;
    }

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    track.addEventListener("touchstart", pause);
    track.addEventListener("touchend", resume);
    frame = requestAnimationFrame(step);

    return function destroy() {
      cancelAnimationFrame(frame);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("touchend", resume);
    };
  }

  /* ======================================================================
     Router
     ====================================================================== */

  var ROUTES = {
    "/": { render: homeMarkup, title: "Jibril Tapiador" },
    "/contact": { render: contactMarkup, title: "Contact | Jibril Tapiador" },
    "/skills": { render: skillsMarkup, title: "Skills | Jibril Tapiador" },
  };

  var teardown = [];

  function currentRoute() {
    var hash = window.location.hash.replace(/^#/, "");
    if (!hash || hash === "/") return "/";
    hash = hash.replace(/\/+$/, "");
    return ROUTES[hash] ? hash : "/";
  }

  function render() {
    var path = currentRoute();
    var route = ROUTES[path];
    var view = document.getElementById("view");

    teardown.forEach(function (fn) {
      fn();
    });
    teardown = [];

    view.innerHTML = route.render();
    document.title = route.title;

    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.classList.toggle("active", link.dataset.route === path);
      if (link.dataset.route === path) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    var hero = view.querySelector("#hero");
    if (hero) {
      teardown.push(
        createTilt(hero, { xMax: 5, yMax: 7, perspective: 2500, randStart: false })
      );
    }

    view.querySelectorAll(".skill-card").forEach(function (card) {
      teardown.push(initSkillCard(card));
    });

    var marquee = view.querySelector("#skills-marquee");
    if (marquee) teardown.push(initMarquee(marquee));

    window.scrollTo(0, 0);
  }

  /* ======================================================================
     Boot
     ====================================================================== */

  function init() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    initThemeControls();
    initDrawer();
    render();
    window.addEventListener("hashchange", render);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
