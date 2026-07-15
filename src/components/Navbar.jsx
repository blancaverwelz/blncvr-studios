import { Link, useLocation } from 'react-router-dom'

const logoSrc = `${import.meta.env.BASE_URL}images/logo.jpg`

export default function Navbar() {
  const { pathname } = useLocation()
  const onProjects = pathname === '/projects'

  return (
    <header className="nav-glass">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 sm:py-3.5">
        <Link
          to="/"
          aria-label="BLNCVR Studios home"
          className="group inline-flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          <img
            src={logoSrc}
            alt=""
            width={44}
            height={44}
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/25 shadow-md shadow-black/40 sm:h-10 sm:w-10"
          />
          <span className="whitespace-nowrap text-sm font-semibold tracking-[0.14em] text-white sm:text-base">
            BLNCVR Studios
          </span>
        </Link>

        <Link
          to="/projects"
          className={`nav-link text-sm font-medium tracking-wide text-white/90 sm:text-base ${
            onProjects ? 'is-active' : ''
          }`}
        >
          All Projects
        </Link>
      </nav>
    </header>
  )
}
