import { ArrowUpRight } from 'lucide-react'

/**
 * Project card used by both the Home slider and All Projects grid.
 * Title + arrow sit on the same baseline at the bottom of the card meta area.
 */
export default function ProjectCard({ project, className = '', imageClassName = '' }) {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`project-card group block overflow-hidden rounded-lg bg-[#0d0f16] ring-1 ring-white/5 ${className}`}
    >
      <div className={`relative aspect-[4/3] overflow-hidden ${imageClassName}`}>
        <img
          src={project.thumbnail}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
      </div>

      <div className="flex items-end justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <div className="min-w-0">
          {project.category && (
            <p className="mb-1 text-[10px] font-medium tracking-wide text-white/45 uppercase sm:text-[11px]">
              {project.category}
            </p>
          )}
          <h3 className="truncate text-sm font-semibold tracking-wide text-white uppercase sm:text-base">
            {project.title}
          </h3>
        </div>

        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors group-hover:border-[#ffd301]/50 group-hover:text-[#ffd301]"
          aria-hidden
        >
          <ArrowUpRight size={16} strokeWidth={2} />
        </span>
      </div>
    </a>
  )
}
