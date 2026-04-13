"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import GithubIcon from "@/components/ui/GithubIcon";
import Badge from "@/components/ui/Badge";
import type { Project } from "@/types/portfolio";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-shadow"
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {project.image_url ? (
            <Image
              src={project.image_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              <span className="text-4xl">🚀</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-lg font-semibold text-primary group-hover:text-accent transition-colors">
            {project.title}
          </h3>
        </Link>
        {project.tagline && (
          <p className="mt-1 text-sm text-muted line-clamp-2">
            {project.tagline}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tech_stack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="accent">
              {tech}
            </Badge>
          ))}
          {project.tech_stack.length > 4 && (
            <Badge variant="outline">+{project.tech_stack.length - 4}</Badge>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} /> Live
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <GithubIcon size={14} /> Code
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
