import { services } from '../data/services'
import ServicesScene from './ServicesScene'

export default function WhatIDo() {
  return (
    <section className="relative mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="text-center">
        <span className="text-xs font-semibold tracking-[0.3em] text-[var(--color-neon-teal)] uppercase">
          What I Do
        </span>
        <h2 className="mt-5 text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-white">
          Tailoring unique solutions for your next breakthrough.
        </h2>
      </div>

      <div className="mt-14">
        <ServicesScene services={services} />
      </div>
    </section>
  )
}
