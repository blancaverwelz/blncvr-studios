import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()
  const onProjects = pathname === '/projects'

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="text-lg font-bold tracking-[0.2em] text-white transition-opacity hover:opacity-80 sm:text-xl"
        >
          BLNCVR
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
