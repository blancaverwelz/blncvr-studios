const brandImage = `${import.meta.env.BASE_URL}images/brand-banner.jpg`

/**
 * Full-width brand strip under the homepage hero — monogram + name.
 * Fades to void black on top/bottom edges to blend with hero above and
 * whatever section follows. Fade is intentionally weaker on small screens
 * so the banner doesn't feel cramped/washed out on mobile.
 */
export default function BrandBanner() {
  return (
    <section
      className="relative h-[200px] w-full overflow-hidden bg-[#05060a] sm:h-[220px] md:h-[250px]"
      aria-label="Welz Blancaver"
    >
      <img
        src={brandImage}
        alt="Welz Blancaver"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="brand-banner-fade brand-banner-fade--top" aria-hidden />
      <div className="brand-banner-fade brand-banner-fade--bottom" aria-hidden />
    </section>
  )
}
