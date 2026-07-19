import { Clock, MapPin, Globe2 } from 'lucide-react'

const stats = [
  { icon: Clock, label: 'Reply within', value: '24–48 hours' },
  { icon: MapPin, label: 'Based in', value: 'Manila, Philippines' },
  { icon: Globe2, label: 'Available', value: 'worldwide' },
]

/**
 * Hero content for the Contact page. Passed as children into <HeroBanner />
 * so it inherits the existing city image, rain, fog, and vignette layers —
 * only the title block markup differs from the default AnimatedTitle.
 */
export default function ContactHero() {
  return (
    <div className="hero-fade-up">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[var(--color-neon-teal)] uppercase">
        <span className="h-px w-8 bg-[var(--color-neon-teal)]" aria-hidden />
        Let&rsquo;s work together
      </p>

      <h1 className="max-w-2xl text-4xl leading-[1.08] font-extrabold text-white sm:text-5xl md:text-6xl">
        Your next big idea deserves a great{' '}
        <span className="text-[var(--color-neon-teal)]">digital experience.</span>
      </h1>

      <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
        Whether you&rsquo;re launching a new business, refreshing an existing brand, or
        creating something entirely new, I&rsquo;d love to hear about it. Let&rsquo;s build an
        experience that feels as good as it performs.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70">
              <Icon size={16} strokeWidth={1.75} />
            </span>
            <span className="text-xs leading-tight text-white/50">
              {label}
              <br />
              <span className="text-sm font-semibold text-white">{value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
