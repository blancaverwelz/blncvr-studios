import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SolutionsCenterpiece from './SolutionsCenterpiece'

const cards = [
  {
    num: '01',
    title: 'Website Design',
    desc: "I design websites that do more than look good—they communicate clearly, build trust, and help turn visitors into customers. Every layout is crafted to balance aesthetics, usability, and your brand's unique story.",
    highlights: ['Layout & hierarchy', 'Brand-led UI', 'Conversion-focused'],
  },
  {
    num: '02',
    title: 'Web Development',
    desc: "I build fast, scalable websites using modern technologies and clean engineering practices. Whether it's a marketing site or a custom web application, every project is optimized for performance, maintainability, and long-term growth.",
    highlights: ['Modern stack', 'Built to scale', 'Clean codebase'],
  },
  {
    num: '03',
    title: '3D Web Experiences',
    desc: 'I create immersive web experiences that combine real-time 3D, motion, and interaction to make your website unforgettable. From cinematic scroll sequences to interactive product showcases, every experience is designed to engage without compromising performance.',
    highlights: ['Real-time 3D', 'Scroll storytelling', 'Interactive builds'],
  },
  {
    num: '04',
    title: 'Motion Design',
    desc: 'I use motion with purpose—not just decoration. Every transition, animation, and micro-interaction is designed to guide attention, improve usability, and make your digital experience feel polished and alive.',
    highlights: ['Purposeful motion', 'Micro-interactions', 'Guided attention'],
  },
  {
    num: '05',
    title: 'Visual Identity',
    desc: "I craft visual identities that bring consistency to every touchpoint. From typography and color systems to interface styling, every detail works together to create a brand that's distinctive, memorable, and built to last.",
    highlights: ['Type & color systems', 'Consistent identity', 'Built to last'],
  },
]

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

function Reveal({ show, delayMs = 0, className = '', children }) {
  return (
    <div
      className={`transition-all duration-[800ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        show ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-[2px]'
      } ${className}`}
      style={{ transitionDelay: show ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function ServiceRow({ card, index, isActive, onActivate }) {
  return (
    <div
      data-index={index}
      onMouseEnter={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onClick={() => onActivate(index)}
      className="group cursor-pointer border-b border-white/10 py-6 first:pt-0 last:border-b-0 md:py-7"
    >
      <div className="flex items-start gap-5 md:gap-8">
        <span
          className={`shrink-0 text-4xl font-extrabold tracking-tight transition-colors duration-500 md:text-6xl ${
            isActive ? 'text-[#ffd301]' : 'text-white/15'
          }`}
        >
          {card.num}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-2xl font-extrabold leading-tight transition-colors duration-500 sm:text-3xl md:text-4xl ${
              isActive ? 'text-white' : 'text-white/50'
            }`}
          >
            {card.title}
          </h3>

          <div
            className={`grid transition-[grid-template-rows] duration-500 ease-out ${
              isActive ? 'grid-rows-[1fr] pt-4' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{card.desc}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {card.highlights.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <Link
                to="/projects"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#ffd301] transition-colors duration-300 hover:text-[#ffe05a]"
              >
                See it in practice
                <ArrowUpRight
                  size={16}
                  strokeWidth={3}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </div>

        <span
          className={`hidden shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:flex ${
            isActive
              ? 'h-10 w-10 -rotate-0 border-transparent bg-[#ffd301] text-[#05060a]'
              : 'h-10 w-10 rotate-45 border-white/20 text-white/40'
          }`}
        >
          <ArrowUpRight size={16} strokeWidth={3} />
        </span>
      </div>
    </div>
  )
}

export default function UniqueSolutions() {
  const sectionRef = useRef(null)
  const rowRefs = useRef([])
  const centerpieceRef = useRef(null)
  const parallaxRef = useRef(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [stage, setStage] = useState(0) // 0 none, 1 headline, 2 centerpiece, 3 strip, 4 closing

  const handleActivate = (index) => {
    setActiveIndex(index)
    centerpieceRef.current?.setActive(index)
  }

  useEffect(() => {
    centerpieceRef.current?.setActive(activeIndex)
  }, [activeIndex])

  // Progressive reveal sequence, once, as the section enters view.
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      setStage(4)
      return
    }

    const el = sectionRef.current
    if (!el) return

    let timers = []
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        setStage(1)
        timers = [
          setTimeout(() => setStage(2), 250),
          setTimeout(() => setStage(3), 550),
          setTimeout(() => setStage(4), 900),
        ]
        observer.disconnect()
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [])

  // Mobile: whichever row is nearest the viewport center becomes active.
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleActivate(Number(entry.target.dataset.index))
          }
        })
      },
      { threshold: 0, rootMargin: '-45% 0px -45% 0px' }
    )

    rowRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gentle cursor parallax on the centerpiece (desktop only).
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (reducedMotion || isMobile) return

    const el = parallaxRef.current
    if (!el) return

    function handleMove(e) {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `translate3d(${x * 14}px, ${y * 14}px, 0)`
    }
    function handleLeave() {
      el.style.transform = 'translate3d(0, 0, 0)'
    }

    window.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#05060a] px-5 py-20 sm:px-8 sm:py-28"
    >
      {/* Ambient backdrop that shifts subtly with the active service. */}
      <div
        className="pointer-events-none absolute inset-0 -z-0 opacity-60 transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 78% 20%, rgba(255,211,1,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Eyebrow + headline */}
        <Reveal show={stage >= 1}>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ffd301]">
            What I Do
          </span>
        </Reveal>

        <div className="mt-5 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <Reveal show={stage >= 1} delayMs={80}>
            <h2 className="text-[clamp(2.75rem,6.5vw,5.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-white">
              Tailoring unique
              <br />
              solutions for your
              <br />
              next breakthrough.
            </h2>
          </Reveal>

          <Reveal show={stage >= 2} className="order-first lg:order-none">
            <div
              ref={parallaxRef}
              className="mx-auto max-w-sm transition-transform duration-300 ease-out lg:max-w-none"
            >
              <SolutionsCenterpiece ref={centerpieceRef} />
            </div>
          </Reveal>
        </div>

        {/* Interactive strip */}
        <Reveal show={stage >= 3} delayMs={100} className="mt-16 lg:mt-20">
          <div>
            {cards.map((card, index) => (
              <div key={card.num} ref={(el) => (rowRefs.current[index] = el)}>
                <ServiceRow
                  card={card}
                  index={index}
                  isActive={activeIndex === index}
                  onActivate={handleActivate}
                />
              </div>
            ))}
          </div>
        </Reveal>

        {/* Closing statement */}
        <Reveal show={stage >= 4} delayMs={150} className="mt-16 border-t border-white/10 pt-10 lg:mt-20">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <p className="max-w-xl text-xl font-medium leading-snug text-white/80 sm:text-2xl">
              Five disciplines, one studio, built around your breakthrough.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/50">View the work</span>
              <ProjectsButton className="h-14 w-14 [&_svg]:h-6 [&_svg]:w-6" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
