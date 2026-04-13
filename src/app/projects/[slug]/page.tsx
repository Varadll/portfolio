import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import GithubIcon from "@/components/ui/GithubIcon";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { fetchProjectBySlug, fetchProjects } from "@/lib/supabase-portfolio";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await fetchProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.tagline,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await fetchProjects();
  const currentIndex = allProjects.findIndex((p) => p.slug === slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1]
      : null;

  return (
    <div className="py-12">
      <Container>
        {/* Back link */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to projects
        </Link>

        {/* Hero image */}
        {project.image_url && (
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border mb-8">
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Title & meta */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            {project.title}
          </h1>
          {project.tagline && (
            <p className="mt-2 text-lg text-muted">{project.tagline}</p>
          )}

          {/* Tech stack */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <Badge key={tech} variant="accent">
                {tech}
              </Badge>
            ))}
          </div>

          {/* Links */}
          <div className="mt-6 flex gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="md">
                  <ExternalLink size={16} /> Live Demo
                </Button>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md">
                  <GithubIcon size={16} /> Source Code
                </Button>
              </a>
            )}
          </div>

          {/* Description */}
          <div
            className="mt-8 prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: project.description_html }}
          />
        </div>

        {/* Gallery */}
        {project.gallery_urls && project.gallery_urls.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-primary mb-4">
              Screenshots
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {project.gallery_urls.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-video overflow-hidden rounded-xl border border-border"
                >
                  <Image
                    src={url}
                    alt={`${project.title} screenshot ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next */}
        <div className="mt-16 flex justify-between border-t border-border pt-8">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="group flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
            >
              <ChevronLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {prevProject.title}
            </Link>
          ) : (
            <div />
          )}
          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
            >
              {nextProject.title}
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </Container>
    </div>
  );
}
