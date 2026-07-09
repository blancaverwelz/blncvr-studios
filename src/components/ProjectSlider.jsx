import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'

/**
 * Infinite horizontal marquee of project cards.
 * Duplicates the list so the loop is seamless; works for any projects.length >= 1.
 */
export default function ProjectSlider() {
  if (!projects.length) return null

  // Duplicate enough times that the track is always wider than the viewport
  // even when there are only a few items.
  const minCopies = Math.max(2, Math.ceil(6 / projects.length))
  const sequence = Array.from({ length: minCopies }, () => projects).flat()
  // Two identical halves for -50% translate loop
  const track = [...sequence, ...sequence]

  return (
    <section className="relative py-12 sm:py-16">
      <div className="mx-auto mb-8 max-w-7xl px-5 sm:px-8">
        <h2 className="text-sm font-semibold tracking-[0.2em] text-white/50 uppercase">
          Featured Projects
        </h2>
      </div>

      <div className="relative overflow-hidden">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#05060a] to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#05060a] to-transparent sm:w-20" />

        <div className="slider-track gap-4 px-2 sm:gap-6">
          {track.map((project, i) => (
            <div
              key={`${project.id}-${i}`}
              className="w-[260px] shrink-0 sm:w-[300px] md:w-[340px]"
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
