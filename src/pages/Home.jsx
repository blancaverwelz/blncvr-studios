import HeroBanner from '../components/HeroBanner'
import ProjectSlider from '../components/ProjectSlider'

export default function Home() {
  return (
    <main>
      <HeroBanner
        image="/images/hero-home.jpg"
        titleLines={['MNL', 'BLNCVR']}
        animateTitle
        align="mid-left"
      />
      <ProjectSlider />
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} BLNCVR
      </footer>
    </main>
  )
}
