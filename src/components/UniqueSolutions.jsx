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

export default function UniqueSolutions() {
  return (
    <section className="relative w-full overflow-hidden bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1600px]">
        <div className="text-white">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-8">
            <h2 className="font-extrabold leading-[0.96] tracking-[-0.055em] text-[clamp(2.75rem,5.15vw,5.25rem)] xl:whitespace-nowrap">
              Tailoring Unique Solutions
            </h2>

            <div className="relative w-full max-w-[25rem] shrink-0 xl:w-[25rem]">
              <div
                className="absolute -inset-3 rounded-[2.25rem] bg-cyan-300/25 blur-2xl"
                aria-hidden
              />
              <img
                src={bizmanImage}
                alt="Business leader viewing a connected city"
                className="relative aspect-[3.1/1] w-full rounded-[2rem] object-cover object-center shadow-[0_0_30px_rgba(0,240,255,0.34),0_0_70px_rgba(255,45,149,0.13)] ring-1 ring-cyan-100/15"
              />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center xl:mt-8 xl:pl-[5.25rem]">
            <Link
              to="/projects"
              aria-label="View all projects"
              className="group flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#58dce5] text-white shadow-[0_0_28px_rgba(0,240,255,0.34),0_0_60px_rgba(0,240,255,0.14)] transition duration-300 hover:scale-105 hover:bg-[#72e7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00f0ff] sm:h-32 sm:w-32"
            >
              <ArrowUpRight
                strokeWidth={3.25}
                className="h-12 w-12 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-14 sm:w-14"
              />
            </Link>

            <h2 className="font-extrabold leading-[0.96] tracking-[-0.055em] text-[clamp(2.75rem,5.15vw,5.25rem)]">
              For Your Next Breakthrough.
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.num}
              className="unique-card group relative bg-[#05060a] p-7 sm:p-8"
            >
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
