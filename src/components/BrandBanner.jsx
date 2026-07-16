const brandImage = `${import.meta.env.BASE_URL}images/brand-banner.jpg`

/**
 * Full-width brand strip under the homepage hero — monogram + name.
 * The source image has generous seamless gradient margins built in above
 * and below the emblem, so the fade below is percentage-based and stays
 * safely inside that margin at every breakpoint without touching the art.
 */
export default function BrandBanner() {
  return (
    <section
      className="relative h-[260px] w-full overflow-hidden bg-[#05060a] sm:h-[300px] md:h-[360px] lg:h-[420px]"
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
