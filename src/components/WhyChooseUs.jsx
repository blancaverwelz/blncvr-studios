import { Link } from 'react-router-dom'

function CircuitGraphic() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <svg
        viewBox="0 0 400 500"
        className="h-full w-full"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="whyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-neon-teal)" />
            <stop offset="100%" stopColor="var(--color-neon-pink)" />
          </linearGradient>
        </defs>
        <g stroke="url(#whyGrad)" strokeOpacity="0.55" strokeWidth="1.5" fill="none">
          <path d="M60 80 H180 V160 H320" />
          <path d="M60 240 H140 V340 H260 V420" />
          <path d="M340 100 V220 H240" />
        </g>
        <g fill="var(--color-neon-teal)">
          <circle cx="60" cy="80" r="5" />
          <circle cx="320" cy="160" r="5" />
          <circle cx="140" cy="340" r="5" />
        </g>
        <g fill="var(--color-neon-pink)">
          <circle cx="60" cy="240" r="5" />
          <circle cx="260" cy="420" r="5" />
          <circle cx="340" cy="100" r="5" />
        </g>
        <rect x="150" y="200" width="90" height="90" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.2)" />
      </svg>
    </div>
  )
}

export default function WhyChooseUs() {
  return (
    <section className="relative w-full bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <CircuitGraphic />

          <Link
            to="/projects"
            className="why-choose-cta group absolute -bottom-6 right-4 flex w-[78%] max-w-xs flex-col gap-4 rounded-2xl bg-[var(--color-neon-teal)] p-6 shadow-xl shadow-black/40 transition-transform duration-300 hover:-translate-y-1 sm:right-8"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#05060a] text-lg text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
            <span className="text-lg font-bold leading-snug text-[#05060a]">
              Custom Solutions Built Around Your Vision
            </span>
          </Link>
        </div>

        <div className="pt-2 lg:pt-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[var(--color-neon-teal)] uppercase">
            Why Choose BLNCVR Studios
            <span aria-hidden>↗</span>
          </p>
          <h2 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-5xl">
            Where Your Vision Meets Next-Gen Execution
          </h2>

          <div className="mt-10 space-y-8">
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-base font-bold text-white sm:text-lg">
                Fast, Focused Development
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50 sm:text-base">
                Every project moves from idea to working app without unnecessary
                delays or bloated processes.
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-base font-bold text-white sm:text-lg">
                Direct Collaboration, Real Results
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50 sm:text-base">
                You work directly with the builder — no middlemen, no
                lost-in-translation briefs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
