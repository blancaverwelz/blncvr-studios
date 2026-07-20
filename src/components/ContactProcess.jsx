import { useEffect, useRef, useState } from 'react'

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

export default function ContactProcess() {
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Reveal once, the first time the timeline scrolls into view —
    // don't replay on every scroll up/down.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={`process-timeline ${visible ? 'is-visible' : ''}`}>
      <span className="process-line" aria-hidden="true" />
      {steps.map((step, i) => (
        <div
          key={step.num}
          className="process-step"
          style={{ transitionDelay: visible ? `${i * 180}ms` : '0ms' }}
        >
          <span className="process-num">{step.num}</span>
          <div>
            <p className="process-title">{step.title}</p>
            <p className="process-desc">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
