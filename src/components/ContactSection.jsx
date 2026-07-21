import ContactForm from './ContactForm'
import ContactServices from './ContactServices'
import ContactProcess from './ContactProcess'
import ContactAmbient from './ContactAmbient'

export default function ContactSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <ContactAmbient />

      <div className="relative z-[1] mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column */}
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-[var(--color-neon-teal)] uppercase">
            What I Can Help You With
          </p>
          <ContactServices />

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
