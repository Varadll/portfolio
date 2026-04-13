"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Education as EducationType } from "@/types/portfolio";

function EducationCard({ edu }: { edu: EducationType }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <GraduationCap size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-primary">{edu.degree}</h3>
          {edu.field && <p className="text-sm text-accent">{edu.field}</p>}
          <p className="text-sm text-muted">{edu.institution}</p>
          <p className="text-xs text-muted mt-1">
            {edu.start_year} — {edu.end_year || "Present"}
          </p>
          {edu.description && (
            <p className="text-sm text-muted mt-2">{edu.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Education({
  education,
}: {
  education: EducationType[];
}) {
  if (education.length === 0) return null;

  return (
    <AnimatedSection id="education" className="py-20">
      <Container>
        <SectionHeading
          title="Education"
          subtitle="My academic background"
        />

        <div className="max-w-3xl mx-auto grid gap-4">
          {education.map((edu) => (
            <EducationCard key={edu.id} edu={edu} />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
