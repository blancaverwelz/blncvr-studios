# BLNCVR Studios

Personal portfolio site for **BLNCVR Studios** — React + Vite, Tailwind CSS, Lucide icons.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — animated cyberpunk hero + featured projects slider |
| `/projects` | All Projects — banner + full project grid |

## Adding a project

Edit **only** `src/data/projects.js`:

```js
{
  id: 'my-project',
  title: 'My Project',
  link: 'https://example.com',
  thumbnail: '/images/my-project.jpg',  // drop file in public/images/
  category: 'Brand · Photography',      // optional
}
```

Both the Home slider and All Projects grid pick it up automatically.

## Develop

```bash
npm install
npm run dev
```

Because this site is configured for GitHub Pages under `/blncvr-studios/`, the dev URL is:

**http://localhost:5173/blncvr-studios/**

## Build

```bash
npm run build
npm run preview
```

## Deploy (GitHub Pages)

GitHub Pages serves the production build from the **`docs/`** folder on `main`.

After any source change, rebuild and commit `docs/` before pushing:

```bash
npm run build
# copies SPA fallback for client routes
cp docs/index.html docs/404.html
git add docs
git commit -m "Update site build"
git push
```

Live site: **https://blancaverwelz.github.io/blncvr-studios/**
