import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  {
    num: '01',
    title: 'Web Design & Development',
    desc: 'Custom, responsive interfaces built and shipped end-to-end.',
  },
  {
    num: '02',
    title: 'Advertising and Marketing Campaigns',
    desc: 'Landing pages and campaign sites built to convert.',
  },
  {
    num: '03',
    title: 'Creative Consulting and Development',
    desc: 'Turning rough ideas into working product plans.',
  },
  {
    num: '04',
    title: 'Branding and Identity Design',
    desc: 'Visual identity systems that give apps a distinct feel.',
  },
]

const bizmanImage = `${import.meta.env.BASE_URL}images/bizman.jpg`

function ProjectsButton({ className = '' }) {
  return (
    <Link
      to="/projects"
      aria-label="View all projects"
      className={`group flex shrink-0 items-center justify-center rounded-full bg-[#ffd301] text-[#05060a] shadow-[0_0_24px_rgba(255,211,1,0.28),0_0_52px_rgba(255,211,1,0.12)] transition duration-300 hover:scale-105 hover:bg-[#ffe05a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffd301] ${className}`}
    >
      <ArrowUpRight
        strokeWidth={3.25}
        className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
      />
    </Link>
  )
}

export default function UniqueSolutions() {
  return (
    <section className="relative w-full overflow-hidden bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Desktop and tablet: matches the site's existing section-heading scale. */}
        <div className="hidden text-white md:block">
          <div className="flex items-center gap-5 lg:gap-6">
            <h2 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-5xl">
              Tailoring Unique Solutions
            </h2>

            <div className="relative w-48 shrink-0 lg:w-60">
              <div className="absolute -inset-2 rounded-[1.5rem] bg-[#ffd301]/20 blur-xl" aria-hidden />
              <img
                src={bizmanImage}
                alt="Business leader viewing a connected city"
                className="relative aspect-[3.1/1] w-full rounded-[1.25rem] object-cover object-center shadow-[0_0_20px_rgba(255,211,1,0.3),0_0_45px_rgba(158,26,15,0.1)] ring-1 ring-[#fff4bf]/15"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-5 pl-10 lg:gap-6 lg:pl-14">
            <ProjectsButton className="h-16 w-16 lg:h-20 lg:w-20 [&_svg]:h-8 [&_svg]:w-8 lg:[&_svg]:h-10 lg:[&_svg]:w-10" />
            <h2 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-5xl">
              For Your Next Breakthrough.
            </h2>
          </div>
        </div>

        {/* Mobile: follows the supplied stacked layout. */}
        <div className="text-white md:hidden">
          <h2 className="text-[clamp(2.65rem,9vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.035em]">
            Tailoring Unique
          </h2>

          <div className="mt-2 flex items-center gap-5">
            <h2 className="text-[clamp(2.65rem,9vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.035em]">
              Solutions
            </h2>
            <ProjectsButton className="h-20 w-20 [&_svg]:h-10 [&_svg]:w-10" />
          </div>

          <h2 className="mt-12 text-[clamp(2.65rem,9vw,4rem)] leading-[1.05] font-extrabold tracking-[-0.035em]">
            <span className="block">For Your Next</span>
            <span className="mt-3 block">Breakthrough.</span>
          </h2>

          <div className="relative mt-10 w-full">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#ffd301]/20 blur-2xl" aria-hidden />
            <img
              src={bizmanImage}
              alt="Business leader viewing a connected city"
              className="relative aspect-[3.1/1] w-full rounded-[1.75rem] object-cover object-center shadow-[0_0_24px_rgba(255,211,1,0.3),0_0_52px_rgba(158,26,15,0.1)] ring-1 ring-[#fff4bf]/15"
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.num} className="unique-card group relative bg-[#05060a] p-7 sm:p-8">
              <h3 className="text-base font-bold text-white sm:text-lg">{card.title}</h3>

              <p className="unique-card-desc text-sm leading-relaxed text-white/50">
                {card.desc}
              </p>

              <div className="mt-8 flex items-center justify-between">
                <span className="unique-card-arrow flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70 transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--color-neon-teal)] group-hover:text-[#05060a]">
                  ↗
                </span>
                <span className="unique-card-num text-3xl font-extrabold text-white/10 transition-colors duration-300 group-hover:text-[var(--color-neon-teal)]">
                  {card.num}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
