import { Monitor, Code2, Fingerprint, Clapperboard, Sparkles } from 'lucide-react'

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

// Static grid — every card always visible, no click-to-expand. Hover gets a
// subtle lift + border glow in the accent color via .service-card:hover.
export default function ContactServices() {
  return (
    <div className="service-grid">
      {services.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="service-card">
          <span className="service-card-icon">
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <p className="service-card-title">{title}</p>
          <p className="service-card-desc">{desc}</p>
        </div>
      ))}
    </div>
  )
}
