import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  {
    num: '01',
    title: 'Website Design',
    desc: "I design websites that do more than look good—they communicate clearly, build trust, and help turn visitors into customers. Every layout is crafted to balance aesthetics, usability, and your brand's unique story.",
  },
  {
    num: '02',
    title: 'Web Development',
    desc: "I build fast, scalable websites using modern technologies and clean engineering practices. Whether it's a marketing site or a custom web application, every project is optimized for performance, maintainability, and long-term growth.",
  },
  {
    num: '03',
    title: '3D Web Experiences',
    desc: 'I create immersive web experiences that combine real-time 3D, motion, and interaction to make your website unforgettable. From cinematic scroll sequences to interactive product showcases, every experience is designed to engage without compromising performance.',
  },
  {
    num: '04',
    title: 'Motion Design',
    desc: 'I use motion with purpose—not just decoration. Every transition, animation, and micro-interaction is designed to guide attention, improve usability, and make your digital experience feel polished and alive.',
  },
  {
    num: '05',
    title: 'Visual Identity',
    desc: "I craft visual identities that bring consistency to every touchpoint. From typography and color systems to interface styling, every detail works together to create a brand that's distinctive, memorable, and built to last.",
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

function ServiceCard({ card, isActive }) {
  return (
    <div
      data-active={isActive}
      className="group flex min-h-[220px] flex-col bg-[#05060a] p-8 transition-all duration-300 hover:bg-[#090b11] max-md:data-[active=true]:bg-[#090b11]"
    >
      <h3 className="text-xl font-bold leading-snug text-white">
        {card.title}
      </h3>

      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr] max-md:data-[active=true]:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="mt-5 text-sm leading-7 text-white/60">
            {card.desc}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 group-hover:border-transparent group-hover:bg-[var(--color-neon-teal)] group-hover:text-[#05060a] max-md:data-[active=true]:border-transparent max-md:data-[active=true]:bg-[var(--color-neon-teal)] max-md:data-[active=true]:text-[#05060a]">
          ↗
        </span>

        <span className="text-5xl font-extrabold tracking-tight text-white/15 transition-colors duration-300 group-hover:text-[var(--color-neon-teal)] max-md:data-[active=true]:text-[var(--color-neon-teal)]">
          {card.num}
        </span>
      </div>
    </div>
  )
}

export default function UniqueSolutions() {
  const cardRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index)
            setActiveIndex(index)
          }
        })
      },
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
    )

    cardRefs.current.forEach((el) => el && observer.observe(el))

    return () => observer.disconnect()
  }, [])

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
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5">

          {cards.map((card, index) => (
            <div
              key={card.num}
              ref={(el) => (cardRefs.current[index] = el)}
              data-index={index}
            >
              <ServiceCard card={card} isActive={activeIndex === index} />
            </div>
          ))}

        </div>
      </div>
    </section>
  )
}
