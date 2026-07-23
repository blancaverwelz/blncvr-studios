import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import SolutionsCenterpiece from './SolutionsCenterpiece'

// Four chapters — one dominant capability at a time, each its own full-
// viewport sticky panel with an immersive particle background.
const CHAPTERS = [
  {
    num: '01',
    title: 'Design & Development',
    desc: 'Interfaces built to communicate clearly and perform flawlessly — considered design paired with clean, scalable engineering.',
  },
  {
    num: '02',
    title: '3D Web Experiences',
    desc: 'Real-time 3D and interaction woven into the browser, turning a website into something worth remembering.',
  },
  {
    num: '03',
    title: 'Motion Design',
    desc: 'Motion with intent. Every transition guides attention and gives the interface a sense of life.',
  },
  {
    num: '04',
    title: 'Visual Identity',
    desc: 'A consistent visual language — typography, color, and detail working together as one distinctive voice.',
  },
]

function ProjectsButton({ className = '' }) {
  return (
    <Link
      to="/projects"
      aria-label="View all projects"
      className={`group flex shrink-0 items-center justify-center rounded-full bg-[var(--color-neon-teal)] text-[#05060a] shadow-[0_0_24px_rgba(255,211,1,0.28),0_0_52px_rgba(255,211,1,0.12)] transition duration-300 hover:scale-105 hover:bg-[#ffe05a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-neon-teal)] ${className}`}
    >
      <ArrowUpRight
        strokeWidth={3.25}
        className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
      />
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* One sticky, full-viewport panel per chapter. Each mounts its own    */
/* particle engine instance (index -> preset) and reveals its text via */
/* its own IntersectionObserver — no shared/imperative state between   */
/* panels.                                                             */
/* ------------------------------------------------------------------ */

function ChapterPanel({ chapter, index }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="sticky top-0 h-screen w-full overflow-hidden bg-[#05060a]"
    >
      <div className="absolute inset-0 -z-0 bg-gradient-to-b from-[#05060a] via-transparent to-[#05060a]" aria-hidden />
      <SolutionsCenterpiece index={index} />

      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-5 text-center sm:px-8">
        <span
          className="text-sm font-extrabold tracking-[0.2em] text-[var(--color-neon-teal)] transition-all duration-700 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          {chapter.num}
        </span>
        <h3
          className="mt-3 text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] font-extrabold tracking-tight text-white transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '80ms',
          }}
        >
          {chapter.title}
        </h3>
        <p
          className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 transition-all duration-700 ease-out sm:text-base"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '160ms',
          }}
        >
          {chapter.desc}
        </p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Reduced-motion fallback — same narrative, no sticky panels, no      */
/* WebGL mounted at all.                                               */
/* ------------------------------------------------------------------ */

function Reveal({ show, delayMs = 0, className = '', children }) {
  return (
    <div
      className={`transition-all duration-[800ms] ease-out ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ transitionDelay: show ? `${delayMs}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

function StaticExperience() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
      <Reveal show={visible}>
        <span className="text-xs font-semibold tracking-[0.3em] text-[var(--color-neon-teal)] uppercase">
          What I Do
        </span>
        <h2 className="mt-5 text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-white">
          Tailoring unique solutions for your next breakthrough.
        </h2>
      </Reveal>

      <div className="mt-14 flex flex-col gap-14">
        {CHAPTERS.map((chapter, i) => (
          <Reveal key={chapter.num} show={visible} delayMs={150 + i * 90}>
            <span className="text-sm font-extrabold tracking-[0.2em] text-[var(--color-neon-teal)]">
              {chapter.num}
            </span>
            <h3 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight text-white sm:text-3xl">
              {chapter.title}
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              {chapter.desc}
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal show={visible} delayMs={150 + CHAPTERS.length * 90} className="mt-16 border-t border-white/10 pt-10">
        <p className="text-2xl leading-tight font-medium text-white/90 sm:text-3xl">
          Every interaction.
          <br />
          Every frame.
          <br />
          Every experience.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-sm text-white/50">View the work</span>
          <ProjectsButton className="h-14 w-14 [&_svg]:h-6 [&_svg]:w-6" />
        </div>
      </Reveal>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cinematic experience — intro heading, 4 stacked sticky panels,      */
/* closing CTA. Each panel owns its own scroll trigger; nothing here   */
/* drives child state imperatively.                                    */
/* ------------------------------------------------------------------ */

function CinematicExperience() {
  return (
    <>
      <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <span className="text-xs font-semibold tracking-[0.3em] text-[var(--color-neon-teal)] uppercase">
          What I Do
        </span>
        <h2 className="mt-5 text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-white">
          Tailoring unique solutions for your next breakthrough.
        </h2>
      </div>

      {CHAPTERS.map((chapter, index) => (
        <ChapterPanel key={chapter.num} chapter={chapter} index={index} />
      ))}

      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <p className="text-2xl leading-tight font-medium text-white/90 sm:text-3xl">
          Every interaction.
          <br />
          Every frame.
          <br />
          Every experience.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-sm text-white/50">View the work</span>
          <ProjectsButton className="h-14 w-14 [&_svg]:h-6 [&_svg]:w-6" />
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */

export default function UniqueSolutions() {
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  return (
    <section className="relative w-full overflow-hidden bg-[#05060a]">
      {reducedMotion ? <StaticExperience /> : <CinematicExperience />}
    </section>
  )
}
