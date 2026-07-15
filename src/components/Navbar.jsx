import { Link, useLocation } from 'react-router-dom'

const logoSrc = `${import.meta.env.BASE_URL}images/logo.jpg`

export default function Navbar() {
  const { pathname } = useLocation()
  const onProjects = pathname === '/projects'

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          aria-label="BLNCVR home"
          className="group inline-flex shrink-0 rounded-full transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          <img
            src={logoSrc}
            alt="BLNCVR"
            width={44}
            height={44}
            className="h-10 w-10 rounded-full object-cover ring-1 ring-white/25 shadow-md shadow-black/40 sm:h-11 sm:w-11"
          />
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
