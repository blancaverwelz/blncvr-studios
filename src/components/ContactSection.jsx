import { Monitor, Code2, Fingerprint, Clapperboard, Sparkles } from 'lucide-react'
import ContactForm from './ContactForm'

const services = [
  {
    icon: Monitor,
    title: 'Website Design',
    desc: 'Beautiful, functional, and user-focused websites.',
  },
  {
    icon: Code2,
    title: 'Web Development',
    desc: 'Fast, modern, and scalable front-end experiences.',
  },
  {
    icon: Fingerprint,
    title: 'Brand Identity',
    desc: 'Logos, visual systems, and brand guidelines.',
  },
  {
    icon: Clapperboard,
    title: 'Motion Design',
    desc: 'Animations and videos that bring ideas to life.',
  },
  {
    icon: Sparkles,
    title: 'Interactive Experiences',
    desc: '3D, WebGL, and immersive digital interactions.',
  },
]

const steps = [
  {
    num: '01',
    title: 'You tell me about your idea.',
    desc: 'Share your goals, challenges, and what success looks like.',
  },
  {
    num: '02',
    title: "We'll align on the details.",
    desc: "We'll discuss timeline, budget, and the best solution for you.",
  },
  {
    num: '03',
    title: 'I craft a solution that works.',
    desc: 'Thoughtful design, clean code, and a smooth collaborative process.',
  },
]

export default function ContactSection() {
  return (
    <section className="relative w-full bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column — real content, not a fake terminal */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[var(--color-neon-teal)] uppercase">
            <span className="h-px w-8 bg-[var(--color-neon-teal)]" aria-hidden />
            Start a conversation.
          </p>
          <h2 className="text-2xl leading-tight font-extrabold text-white sm:text-3xl">
            Every great project starts with a simple message.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">
            Whether you already have a complete vision or you&rsquo;re still figuring things
            out, I&rsquo;m happy to help shape the next step.
          </p>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase">
              What I Can Help You With
            </p>
            <ul className="space-y-5">
              {services.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70">
                    <Icon size={17} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white sm:text-base">{title}</p>
                    <p className="text-sm leading-relaxed text-white/45">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase">
              How We Work Together
            </p>
            <ol className="space-y-6">
              {steps.map((step, i) => (
                <li key={step.num} className="relative flex gap-4 pl-1">
                  {i < steps.length - 1 && (
                    <span
                      className="absolute top-7 left-[15px] h-[calc(100%-8px)] w-px bg-white/10"
                      aria-hidden
                    />
                  )}
                  <span className="relative z-10 shrink-0 text-lg font-extrabold text-[var(--color-neon-pink)]">
                    {step.num}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white sm:text-base">{step.title}</p>
                    <p className="text-sm leading-relaxed text-white/45">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right column — the form */}
        <ContactForm />
      </div>
    </section>
  )
}
