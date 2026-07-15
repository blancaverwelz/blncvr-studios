const brandImage = `${import.meta.env.BASE_URL}images/brand-banner.jpg`

/**
 * Full-width brand strip under the homepage hero — monogram + name.
 * Asset is color-graded to the hero cyberpunk cyan/magenta palette.
 */
export default function BrandBanner() {
  return (
    <section
      className="brand-banner relative w-full overflow-hidden"
      aria-label="Welz Blancaver"
    >
      {/* Atmospheric wash matching hero neon (teal + pink) under/around the art */}
      <div className="brand-banner__atmosphere" aria-hidden />

      <div className="relative z-[1] mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12 md:py-14 lg:py-16">
        <img
          src={brandImage}
          alt="Welz Blancaver"
          width={3295}
          height={833}
          className="brand-banner__img mx-auto h-auto w-full max-w-5xl object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  )
}
