const brandImage = `${import.meta.env.BASE_URL}images/brand-banner.jpg`

/**
 * Full-width brand strip under the homepage hero — monogram + name.
 * Image is pre-cropped so solid black side panels are removed; page void shows through.
 */
export default function BrandBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#05060a]"
      aria-label="Welz Blancaver"
    >
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-14 md:py-16 lg:py-20">
        <img
          src={brandImage}
          alt="Welz Blancaver"
          width={2870}
          height={666}
          className="mx-auto h-auto w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>
  )
}
