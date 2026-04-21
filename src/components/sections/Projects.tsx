"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/shared/ProjectCard";
import type { Project } from "@/types/portfolio";

export default function Projects({
  projects,
  showViewAll = true,
  heading = "Featured Projects",
  subtitle = "A selection of projects I've successfully delivered to clients.",
}: {
  projects: Project[];
  showViewAll?: boolean;
  heading?: string;
  subtitle?: string;
}) {
  if (projects.length === 0) return null;

  return (
    <AnimatedSection id="projects" className="py-20">
      <Container>
        <SectionHeading title={heading} subtitle={subtitle} />

        <div className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {showViewAll && (
          <div className="mt-10 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              View All Projects <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </Container>
    </AnimatedSection>
  );
}
