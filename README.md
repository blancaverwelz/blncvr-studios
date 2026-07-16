# BLNCVR Studios

Personal portfolio site for **BLNCVR Studios** — React + Vite, Tailwind CSS, Lucide icons.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — animated cyberpunk hero + brand banner + featured projects slider |
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

**http://localhost:5173/**

## Build

```bash
npm run build
npm run preview
```

## Deploy (Vercel)

Deployment is fully automatic. Vercel is connected to this repo and watches the
`main` branch — every push triggers a build and redeploy on its own, usually
live within ~30 seconds. No manual build step, no local `npm run build`, no
committing a `docs/` folder.

Build settings live in `vercel.json` (output directory + SPA rewrites) and
`vite.config.js` — don't need to touch either unless the build setup changes.

Live site: **https://blncvr-studios.vercel.app**
