import { projects } from '../data/projects'
import ProjectCard from './ProjectCard'

/**
 * Responsive grid of all projects — same data source as the Home slider.
 */
export default function ProjectGrid() {
  if (!projects.length) {
    return (
      <p className="py-20 text-center text-white/40">No projects yet.</p>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
