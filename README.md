# BLNCVR Portfolio

Personal portfolio site for **BLNCVR** — React + Vite, Tailwind CSS, Lucide icons.

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

Because this site is configured for GitHub Pages under `/blncvr-portfolio/`, the dev URL is:

**http://localhost:5173/blncvr-portfolio/**

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages:

**https://blancaverwelz.github.io/blncvr-portfolio/**
