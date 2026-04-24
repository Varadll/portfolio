import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import GithubIcon from "@/components/ui/GithubIcon";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  fetchProjectBySlug,
  fetchProjects,
  fetchTestimonialsByProject,
} from "@/lib/supabase-portfolio";

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

  const [allProjects, testimonials] = await Promise.all([
    fetchProjects(),
    fetchTestimonialsByProject(project.id),
  ]);
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

        {/* Client testimonials — full, readable stack */}
        {testimonials.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-primary mb-6">
              What clients say
            </h2>
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-6 sm:p-7 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {t.client_logo_url ? (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                        <Image
                          src={t.client_logo_url}
                          alt={`${t.client_name} logo`}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-sm font-semibold text-primary">
                        {t.client_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted">
                        Client
                      </p>
                      <p className="text-base font-semibold text-primary">
                        {t.client_name}
                      </p>
                    </div>
                  </div>

                  <figure className="flex-1 flex flex-col">
                    <Quote
                      size={24}
                      className="text-accent mb-2"
                      aria-hidden="true"
                    />
                    <blockquote className="text-base italic text-primary leading-relaxed flex-1">
                      “{t.quote}”
                    </blockquote>
                    {(t.author || t.author_role) && (
                      <figcaption className="mt-4 text-sm text-muted">
                        {t.author && (
                          <span className="font-medium text-primary">
                            {t.author}
                          </span>
                        )}
                        {t.author && t.author_role && <span> — </span>}
                        {t.author_role && <span>{t.author_role}</span>}
                      </figcaption>
                    )}
                  </figure>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acknowledgement */}
        {project.acknowledgement_html && (
          <div className="mt-8 max-w-3xl">
            <h2 className="text-xl font-semibold text-primary mb-3">
              Acknowledgement
            </h2>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: project.acknowledgement_html,
              }}
            />
          </div>
        )}

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
