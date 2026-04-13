"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface TimelineItemProps {
  title: string;
  subtitle: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  tags?: string[];
  type?: string;
}

export default function TimelineItem({
  title,
  subtitle,
  location,
  startDate,
  endDate,
  description,
  tags,
  type,
}: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-8 pb-8 last:pb-0 border-l-2 border-border"
    >
      {/* Dot */}
      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-accent bg-card" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <p className="text-sm text-accent font-medium">
            {subtitle}
            {location && <span className="text-muted"> · {location}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {type && (
            <Badge variant="accent" className="capitalize">
              {type}
            </Badge>
          )}
          <span className="text-xs text-muted whitespace-nowrap">
            {formatDate(startDate)} — {endDate ? formatDate(endDate) : "Present"}
          </span>
        </div>
      </div>

      {description && (
        <div
          className="mt-2 text-sm text-muted prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}
