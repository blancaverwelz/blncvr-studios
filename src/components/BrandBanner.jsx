const brandImage = `${import.meta.env.BASE_URL}images/brand-banner.jpg`

/**
 * Full-width brand strip under the homepage hero — monogram + name.
 * Section fades are applied via the shared `section-fade` wrappers on Home.
 */
export default function BrandBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#05060a]" aria-label="Welz Blancaver">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14 md:py-16 lg:py-20">
        <img
          src={brandImage}
          alt="Welz Blancaver"
          width={2000}
          height={333}
          className="mx-auto h-auto w-full max-w-4xl object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  )
}
