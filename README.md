# jibriltapiador.com

My personal website hosted at [jibriltapiador.com](https://www.jibriltapiador.com)

A static site with no build step, served directly by GitHub Pages from the
repository root.

```
index.html          markup shell: nav, mobile drawer, footer
assets/css/         styles and design tokens
assets/js/app.js    theme switcher, hash router, views, card animations
assets/img/         tiling grid backdrop
assets/             profile photo, CV / resume
```

Routing is hash based (`#/`, `#/contact`, `#/skills`) so every route resolves
from a single `index.html` without server rewrites. Skill icons are loaded from
the [devicon](https://devicon.dev) CDN.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.
