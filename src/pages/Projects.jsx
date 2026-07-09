import HeroBanner from '../components/HeroBanner'
import ProjectGrid from '../components/ProjectGrid'

const heroImage = `${import.meta.env.BASE_URL}images/hero-projects.jpg`

export default function Projects() {
  return (
    <main>
      <HeroBanner
        image={heroImage}
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
