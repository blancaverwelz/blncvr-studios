import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  {
    num: '01',
    title: 'Web Apps & Digital Platforms',
    desc: 'Custom SaaS products, dashboards, client portals, and AI-powered tools.',
    tags: ['SaaS', 'Dashboards', 'AI'],
  },
  {
    num: '02',
    title: 'Premium Websites',
    desc: 'High-converting websites crafted for modern brands and businesses.',
    tags: ['Landing Pages', 'Business', 'Portfolio'],
  },
  {
    num: '03',
    title: 'Interactive 3D Experiences',
    desc: 'Immersive WebGL websites and real-time 3D experiences.',
    tags: ['Three.js', 'Blender', 'WebGL'],
  },
  {
    num: '04',
    title: 'Creative Strategy & AI',
    desc: 'Product strategy and AI-assisted development from concept to launch.',
    tags: ['Strategy', 'AI', 'Product'],
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

        {/* Desktop */}
        <div className="hidden text-white md:block">
          <div className="flex items-center gap-5 lg:gap-6">
            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
              Tailoring Unique Solutions
            </h2>

            <div className="relative w-48 shrink-0 lg:w-60">
              <div className="absolute -inset-2 rounded-[1.5rem] bg-[#ffd301]/20 blur-xl" />

              <img
                src={bizmanImage}
                alt="Business leader viewing a connected city"
                className="relative aspect-[3.1/1] w-full rounded-[1.25rem] object-cover object-center shadow-[0_0_20px_rgba(255,211,1,0.3),0_0_45px_rgba(158,26,15,0.1)] ring-1 ring-[#fff4bf]/15"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-5 pl-10 lg:gap-6 lg:pl-14">
            <ProjectsButton className="h-16 w-16 lg:h-20 lg:w-20 [&_svg]:h-8 [&_svg]:w-8 lg:[&_svg]:h-10 lg:[&_svg]:w-10" />

            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
              For Your Next Breakthrough.
            </h2>
          </div>
        </div>

        {/* Mobile */}
        <div className="text-white md:hidden">
          <h2 className="text-[clamp(2.65rem,9vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
            Tailoring Unique
          </h2>

          <div className="mt-2 flex items-center gap-5">
            <h2 className="text-[clamp(2.65rem,9vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
              Solutions
            </h2>

            <ProjectsButton className="h-20 w-20 [&_svg]:h-10 [&_svg]:w-10" />
          </div>

          <h2 className="mt-12 text-[clamp(2.65rem,9vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
            <span className="block">For Your Next</span>
            <span className="mt-3 block">Breakthrough.</span>
          </h2>

          <div className="relative mt-10">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#ffd301]/20 blur-2xl" />

            <img
              src={bizmanImage}
              alt="Business leader viewing a connected city"
              className="relative aspect-[3.1/1] w-full rounded-[1.75rem] object-cover object-center shadow-[0_0_24px_rgba(255,211,1,0.3),0_0_52px_rgba(158,26,15,0.1)] ring-1 ring-[#fff4bf]/15"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">

          {cards.map((card) => (

            <div
              key={card.num}
              className="group flex min-h-[320px] flex-col bg-[#05060a] p-8 transition-all duration-300 hover:bg-[#090b11]"
            >

              <h3 className="text-xl font-bold leading-snug text-white">
                {card.title}
              </h3>

              <p className="mt-5 text-sm leading-7 text-white/60">
                {card.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">

                {card.tags.map((tag) => (

                  <span
                    key={tag}
                    className="rounded-full border border-[#ffd301]/20 bg-[#ffd301]/5 px-3 py-1 text-xs font-medium tracking-wide text-[#ffd301]/80 transition-all duration-300 group-hover:border-[var(--color-neon-teal)]/30 group-hover:bg-[var(--color-neon-teal)]/10 group-hover:text-white"
                  >
                    {tag}
                  </span>

                ))}

              </div>

              <div className="mt-auto flex items-center justify-between pt-12">

                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 group-hover:border-transparent group-hover:bg-[var(--color-neon-teal)] group-hover:text-[#05060a]">
                  ↗
                </span>

                <span className="text-5xl font-extrabold tracking-tight text-white/15 transition-colors duration-300 group-hover:text-[var(--color-neon-teal)]">
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
