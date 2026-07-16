import HeroBanner from '../components/HeroBanner'
import BrandBanner from '../components/BrandBanner'
import ProjectSlider from '../components/ProjectSlider'
import AboutSection from '../components/AboutSection'
import UniqueSolutions from '../components/UniqueSolutions'
import WhyChooseUs from '../components/WhyChooseUs'

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
        <div className="section-fade section-fade--out" aria-hidden />
      </div>

      <div className="section-block">
        <BrandBanner />
      </div>

      <div className="section-block">
        <div className="section-fade section-fade--in" aria-hidden />
        <ProjectSlider />
      </div>

      <AboutSection />
      <UniqueSolutions />
      <WhyChooseUs />

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/30">
        © 2026 BLNCVR Studios
      </footer>
    </main>
  )
}
