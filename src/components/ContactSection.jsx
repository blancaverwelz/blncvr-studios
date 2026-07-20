import ContactForm from './ContactForm'
import ContactServices from './ContactServices'
import ContactProcess from './ContactProcess'

export default function ContactSection() {
  return (
    <section className="relative w-full bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[var(--color-neon-teal)] uppercase">
            <span className="h-px w-8 bg-[var(--color-neon-teal)]" aria-hidden />
            Start a conversation.
          </p>
          <h2 className="text-2xl leading-tight font-extrabold text-white sm:text-3xl">
            Every great project starts with a simple message.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">
            Have a complete vision, or just an idea you're still shaping? Either way, I'm happy
            to help figure out the next step.
          </p>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase">
              What I Can Help You With
            </p>
            <ContactServices />
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase">
              How We Work Together
            </p>
            <ContactProcess />
          </div>
        </div>

        {/* Right column — the form */}
        <ContactForm />
      </div>
    </section>
  )
}
