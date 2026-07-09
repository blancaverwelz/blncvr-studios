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

## Build

```bash
npm run build
npm run preview
```
