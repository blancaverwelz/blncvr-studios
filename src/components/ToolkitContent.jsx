import { useState } from 'react'

const core = [
  { name: 'React', svg: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="2.2" fill="#61dafb"/><g stroke="#61dafb" stroke-width="1.2"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></g></svg>' },
  { name: 'Vite', svg: '<svg viewBox="0 0 24 24"><path d="M21 3L12 22 3 3l9 4z" fill="none" stroke="#bd34fe" stroke-width="1.4" stroke-linejoin="round"/></svg>' },
  { name: 'Tailwind CSS', svg: '<svg viewBox="0 0 24 24" fill="#38bdf8"><path d="M6 12c.8-3 2.4-4.5 5-4.5 3 0 3.6 2 5 3 1 .7 1.8 1 3 1-.8 3-2.4 4.5-5 4.5-3 0-3.6-2-5-3-1-.7-1.8-1-3-1z"/></svg>' },
  { name: 'JavaScript', svg: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="#f7df1e"/><text x="7" y="17" font-size="10" font-weight="700" fill="#111">JS</text></svg>' },
  { name: 'Three.js', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.3"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2v20M3 7l9 5 9-5M3 17l9-5 9 5"/></svg>' },
  { name: 'Blender', svg: '<svg viewBox="0 0 24 24"><path d="M11 4a7 7 0 100 14 7 7 0 006.93-6 5 5 0 01-6.35-7.86A7 7 0 0011 4z" fill="#f5792e"/><circle cx="17.6" cy="6.6" r="2.1" fill="#f5792e"/></svg>' },
]

const ai = [
  { name: 'Claude', desc: 'Primary build partner', svg: '<svg viewBox="0 0 24 24" fill="#ff8a5c"><path d="M12 1l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/></svg>' },
  { name: 'Grok Build', desc: 'Rapid iteration', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg>' },
  { name: 'Gemini', desc: 'Second opinion & QA', svg: '<svg viewBox="0 0 24 24" fill="#8ab4ff"><path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10z"/></svg>' },
  { name: 'Codex', desc: 'Agentic coding tasks', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#74e0a5" stroke-width="1.6"><path d="M8 5L2 12l6 7M16 5l6 7-6 7M14 4l-4 16"/></svg>' },
]

const ship = [
  {
    name: 'StackBlitz',
    svg: '<svg viewBox="0 0 24 24" fill="#1389fd"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    mono: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
    desc: 'Browser-based dev environment used to build and test each project before it ships.',
  },
  {
    name: 'Vercel',
    svg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3l10 18H2z"/></svg>',
    mono: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l10 18H2z"/></svg>',
    desc: 'Primary hosting — instant deploys straight from GitHub on every push.',
  },
  {
    name: 'GitHub',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="8" r="2.4"/><path d="M6 8.4V15.6M6 15c0-4 2-6 6-6h4"/></svg>',
    mono: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="8" r="2.4"/><path d="M6 8.4V15.6M6 15c0-4 2-6 6-6h4"/></svg>',
    desc: 'Version control and source of truth for every repo in the portfolio.',
  },
]

export default function ToolkitContent() {
  const [active, setActive] = useState(0)

  return (
    <section className="tk-wrap">
      <p className="tk-eyebrow">Behind The Build</p>
      <h2 className="tk-heading">The Toolkit Powering Every BLNCVR Studios Project</h2>

      <div className="tk-group">
        <div className="tk-group-label">Core Stack</div>
        <div className="tk-marquee">
          <div className="tk-marquee-track">
            {[...core, ...core].map((t, i) => (
              <div className="tk-logo-chip" key={i}>
                <span dangerouslySetInnerHTML={{ __html: t.svg }} />
                <span>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tk-group">
        <div className="tk-group-label">Backend & Services</div>
        <div className="tk-flow-box">
          <div className="tk-flow-node tk-supabase">
            <div className="tk-ring">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" />
              </svg>
            </div>
            <span>Supabase</span>
          </div>
          <div className="tk-flow-line">
            <div className="tk-flow-dot" />
          </div>
          <div className="tk-flow-node tk-cloudinary">
            <div className="tk-ring">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 18a4 4 0 010-8 5 5 0 019.6-1.5A4.5 4.5 0 0119 18H6z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <span>Cloudinary</span>
          </div>
          <div className="tk-flow-line">
            <div className="tk-flow-dot" />
          </div>
          <div className="tk-flow-node tk-resend">
            <div className="tk-ring">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 6l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <span>Resend</span>
          </div>
        </div>
      </div>

      <div className="tk-group">
        <div className="tk-group-label">AI Collaborators</div>
        <div className="tk-ai-grid">
          {ai.map((a) => (
            <div className="tk-ai-card" key={a.name}>
              <div className="tk-ai-card-border">
                <div className="tk-ai-card-inner">
                  <span dangerouslySetInnerHTML={{ __html: a.svg }} />
                  <span>{a.name}</span>
                  <p>{a.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tk-group">
        <div className="tk-group-label">Develop & Ship</div>
        <div className="tk-tabs">
        {ship.map((s, i) => (
  <button
    key={s.name}
    className={`tk-tab-btn ${active === i ? 'is-active' : ''}`}
    onClick={() => setActive(i)}
  >
    <span dangerouslySetInnerHTML={{ __html: s.mono }} />
    {/* Added "tk-tab-text" class here */}
    <span className="tk-tab-text">{s.name}</span> 
  </button>
))}
        </div>
        {ship.map((s, i) => (
          <div key={s.name} className={`tk-tab-panel ${active === i ? 'is-active' : ''}`}>
            <span dangerouslySetInnerHTML={{ __html: s.svg }} />
            <div>
              <h4>{s.name}</h4>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
