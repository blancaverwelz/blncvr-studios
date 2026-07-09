/**
 * Single source of truth for all portfolio projects.
 * Add new projects here only — both Home slider and All Projects grid import this file.
 *
 * thumbnail paths are relative to `public/` (no leading slash needed).
 * They are resolved with Vite's BASE_URL so GitHub Pages subdirectory deploys work.
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} link
 * @property {string} thumbnail - path under public/, e.g. 'images/foo.jpg'
 * @property {string} [category]
 */

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

/** @type {Project[]} */
export const projects = [
  {
    id: 'lumi-studios',
    title: 'Lumi Studios',
    link: 'https://salon-book-nu.vercel.app/',
    thumbnail: asset('images/lumi-studios.jpg'),
    category: 'Brand · Photography',
  },
  {
    id: 'unreal-auto-center',
    title: 'UnReal Auto Center',
    link: 'https://pms-estimator.vercel.app/',
    thumbnail: asset('images/unreal-auto.jpg'),
    category: 'Brand · Photography',
  },
  {
    id: 'cafe-pos',
    title: 'Cafe POS',
    link: 'https://blancaverwelz.github.io/cafe-pos/',
    thumbnail: asset('images/cafe-pos.jpg'),
    category: 'Brand · Photography',
  },
]
