import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { services } from '../data/services'

/* ------------------------------------------------------------------ */
/* One flip card. Flip state and accordion behavior (only one card     */
/* flipped at a time) are owned by the parent — this component is      */
/* presentational plus keyboard handling.                              */
/*                                                                     */
/* prefers-reduced-motion is handled entirely in CSS (see index.css):  */
/* the 3D rotateY transform is disabled and swapped for an opacity     */
/* cross-fade, so it stays correct even if the setting changes live.   */
/* ------------------------------------------------------------------ */

function FlipCard({ service, isFlipped, onToggle }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <div className="flip-card-scene h-60 sm:h-64">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={`${service.title}. ${isFlipped ? 'Showing description. Activate to flip back.' : 'Activate to see description.'}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={`flip-card h-full w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] ${
          isFlipped ? 'is-flipped flip-card-glow' : ''
        }`}
      >
        <div
          className="flip-card-face flip-card-face--front flex h-full w-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          aria-hidden={isFlipped}
        >
          <h3 className="text-xl leading-tight font-extrabold tracking-tight text-white sm:text-2xl">
            {service.title}
          </h3>
          <div className="flex items-end justify-between">
            <span className="text-sm font-extrabold tracking-[0.2em] text-[var(--color-neon-teal)]">
              {service.num}
            </span>
            <ArrowUpRight strokeWidth={2.5} className="h-5 w-5 text-white/50" />
          </div>
        </div>

        <div
          className="flip-card-face flip-card-face--back flex h-full w-full flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          aria-hidden={!isFlipped}
        >
          <p className="text-sm leading-6 text-white/70 sm:text-base">{service.desc}</p>
        </div>
      </div>
    </div>
  )
}

export default function WhatIDo() {
  const [activeIndex, setActiveIndex] = useState(null)

  const toggle = (i) => setActiveIndex((prev) => (prev === i ? null : i))

  return (
    <section className="relative mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-[var(--color-neon-teal)] uppercase">
          What I Do
        </span>
        <h2 className="mt-5 text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-white">
          Tailoring unique solutions for your next breakthrough.
        </h2>
      </div>

      <div className="flip-card-grid mt-14">
        {services.map((service, i) => (
          <FlipCard
            key={service.num}
            service={service}
            isFlipped={activeIndex === i}
            onToggle={() => toggle(i)}
          />
        ))}
      </div>
    </section>
  )
}
