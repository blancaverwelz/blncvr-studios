import { useState } from 'react'
import { Monitor, Code2, Fingerprint, Clapperboard, Sparkles, Plus } from 'lucide-react'

const services = [
  {
    icon: Monitor,
    title: 'Website Design',
    desc: 'Beautiful, functional, and user-focused websites.',
  },
  {
    icon: Code2,
    title: 'Web Development',
    desc: 'Fast, modern, and scalable front-end experiences.',
  },
  {
    icon: Fingerprint,
    title: 'Brand Identity',
    desc: 'Logos, visual systems, and brand guidelines.',
  },
  {
    icon: Clapperboard,
    title: 'Motion Design',
    desc: 'Animations and videos that bring ideas to life.',
  },
  {
    icon: Sparkles,
    title: 'Interactive Experiences',
    desc: '3D, WebGL, and immersive digital interactions.',
  },
]

export default function ContactServices() {
  // Accordion: at most one open at a time, closed by default so the
  // section reads as a compact grid rather than a wall of text.
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="service-grid">
      {services.map(({ icon: Icon, title, desc }, i) => {
        const isOpen = openIndex === i
        return (
          <div key={title} className={`service-card ${isOpen ? 'is-open' : ''}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`service-desc-${i}`}
              className="service-card-trigger"
            >
              <span className="service-card-icon">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <span className="service-card-title">{title}</span>
              <span className="service-card-plus" aria-hidden="true">
                <Plus size={15} strokeWidth={2.25} />
              </span>
            </button>
            <div id={`service-desc-${i}`} className="service-card-panel" role="region">
              <div className="service-card-panel-inner">
                <p>{desc}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
