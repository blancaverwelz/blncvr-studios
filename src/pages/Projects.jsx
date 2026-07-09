import HeroBanner from '../components/HeroBanner'
import ProjectGrid from '../components/ProjectGrid'

export default function Projects() {
  return (
    <main>
      <HeroBanner
        image="/images/hero-projects.jpg"
        titleLines={['ALL PROJECTS']}
        subtitle="Home / About"
        animateTitle={false}
        align="center"
      />
      <ProjectGrid />
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} BLNCVR
      </footer>
    </main>
  )
}
