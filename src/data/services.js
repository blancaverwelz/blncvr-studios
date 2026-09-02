/**
 * Single source of truth for the "What I Do" section.
 *
 * @typedef {Object} Service
 * @property {string} num - 2-digit display number, e.g. '01'
 * @property {string} title
 * @property {string} desc
 * @property {'gem'|'cube'|'mark'|'ribbon'|'particles'} [shape] - which 3D geometry
 *   ServicesScene renders for this service. Optional/additive field only — does not
 *   change the display content above.
 */

/** @type {Service[]} */
export const services = [
  {
    num: '01',
    title: 'Website Design',
    desc: 'Designing visually striking, user-centered websites that blend aesthetics, usability, and strategy to create memorable digital experiences that convert visitors into customers.',
    shape: 'gem',
  },
  {
    num: '02',
    title: 'Web Development',
    desc: 'Building high-performance, responsive, and scalable web applications using modern technologies, optimized for speed, accessibility, and seamless user experiences across every device.',
    shape: 'cube',
  },
  {
    num: '03',
    title: 'Brand Identity',
    desc: 'Crafting distinctive brand identities through logos, visual systems, typography, and design guidelines that communicate your story and leave a lasting impression.',
    shape: 'mark',
  },
  {
    num: '04',
    title: 'Motion Design',
    desc: 'Creating engaging animations, cinematic motion graphics, and interactive visuals that enhance storytelling, elevate user engagement, and bring digital experiences to life.',
    shape: 'ribbon',
  },
  {
    num: '05',
    title: 'Interactive Experiences',
    desc: 'Developing immersive 3D, WebGL, and interactive experiences that combine creativity and technology to captivate audiences through dynamic, real-time digital environments.',
    shape: 'particles',
  },
]
