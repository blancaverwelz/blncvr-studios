import BrandBanner from '../components/BrandBanner'
import HeroBanner from '../components/HeroBanner'
import ProjectSlider from '../components/ProjectSlider'

const heroImage = `${import.meta.env.BASE_URL}images/hero-home.jpg`

export default function Home() {
  return (
    <main className="home-sections">
      <div className="section-block">
        <HeroBanner
          image={heroImage}
          titleLines={['BLNCVR', 'Studios']}
          animateTitle
          align="mid-left"
          imageFocus="figure-right"
        />
        {/* Soft black blend from hero into brand strip */}
        <div className="section-fade section-fade--out" aria-hidden />
      </div>

      <div className="section-block">
        <div className="section-fade section-fade--in" aria-hidden />
        <BrandBanner />
        <div className="section-fade section-fade--out" aria-hidden />
      </div>

      <div className="section-block">
        <div className="section-fade section-fade--in" aria-hidden />
        <ProjectSlider />
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} BLNCVR
      </footer>
    </main>
  )
}
