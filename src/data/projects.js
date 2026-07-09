/**
 * Single source of truth for all portfolio projects.
 * Add new projects here only — both Home slider and All Projects grid import this file.
 *
 * @typedef {Object} Project
 * @property {string} id        - Unique slug
 * @property {string} title     - Display title
 * @property {string} link      - Live project URL
 * @property {string} thumbnail - Path under /public (e.g. /images/foo.jpg)
 * @property {string} [category] - Optional label shown above the title
 */

/** @type {Project[]} */
export const projects = [
  {
    id: 'lumi-studios',
    title: 'Lumi Studios',
    link: 'https://salon-book-nu.vercel.app/',
    thumbnail: '/images/lumi-studios.jpg',
    category: 'Brand · Photography',
  },
  {
    id: 'unreal-auto-center',
    title: 'UnReal Auto Center',
    link: 'https://pms-estimator.vercel.app/',
    thumbnail: '/images/unreal-auto.jpg',
    category: 'Brand · Photography',
  },
  {
    id: 'cafe-pos',
    title: 'Cafe POS',
    link: 'https://blancaverwelz.github.io/cafe-pos/',
    thumbnail: '/images/cafe-pos.jpg',
    category: 'Brand · Photography',
  },
]
