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

export default function UniqueSolutions() {
  return (
    <section className="relative w-full bg-[#05060a] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-3xl text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-5xl">
          Tailoring Unique Solutions, For Your Next Breakthrough.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
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
