import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/shared/ProjectCard";
import { fetchProjects } from "@/lib/supabase-portfolio";

export const revalidate = 3600;

export const metadata = {
  title: "All Projects",
  description: "Every published project.",
};

export default async function ProjectsListPage() {
  const projects = await fetchProjects();

  return (
    <div className="py-20">
      <Container>
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back home
        </Link>

        <SectionHeading
          title="All Projects"
          subtitle="Everything I've shipped publicly."
        />

        {projects.length === 0 ? (
          <p className="text-center py-12 text-muted">No projects yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
