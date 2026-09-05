import { useRef } from 'react'
import ContactForm from './ContactForm'
import ContactServices from './ContactServices'
import ContactProcess from './ContactProcess'
import ContactAmbient from './ContactAmbient'

export default function ContactSection() {
  // Dedicated spacer between the hint and the process/form grid — reserves
  // real vertical room for the terrain, and is exactly what bounds/clips it
  // (see ContactAmbient). The terrain never has to share space with cards,
  // the hint, or the process/form content because it draws only inside
  // this element's own bounds.
  const terrainStageRef = useRef(null)

  return (
    <section className="relative w-full overflow-hidden bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <ContactAmbient terrainStageRef={terrainStageRef} />

      <div className="relative z-[1] mx-auto max-w-7xl">
        {/* Full-width services section */}
        <div>
          <p className="mb-12 text-center text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase sm:mb-8">
            What I Can Help You With
          </p>
          <ContactServices />
        </div>

        {/* Desktop/mobile wording differs; only one is ever visible via CSS. */}
        <div>
          <p className="service-hint service-hint--desktop">
            <span className="service-hint-dot" aria-hidden="true" />
            Hover or click to explore
          </p>
          <p className="service-hint service-hint--mobile">
            <span className="service-hint-dot" aria-hidden="true" />
            Swipe or tap to explore
          </p>
        </div>

        <div ref={terrainStageRef} className="terrain-stage" aria-hidden="true" />

        {/* Process (left) + form (right) */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase">
              How We Work Together
            </p>
            <ContactProcess />
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  )
}
