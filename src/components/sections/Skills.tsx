"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Skill } from "@/types/portfolio";

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Database",
  tools: "Tools & DevOps",
  languages: "Languages",
  other: "Other",
};

function SkillBar({ skill, index }: { skill: Skill; index: number }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-primary">{skill.name}</span>
        <span className="text-xs text-muted">{skill.proficiency * 20}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${skill.proficiency * 20}%` }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover"
        />
      </div>
    </div>
  );
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const grouped = skills.reduce(
    (acc, skill) => {
      const cat = skill.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  const categories = Object.keys(grouped);

  if (categories.length === 0) return null;

  return (
    <AnimatedSection id="skills" className="py-20 bg-bg-secondary">
      <Container>
        <SectionHeading
          title="Skills"
          subtitle="Technologies and tools I work with"
        />

        <div className="grid gap-10 md:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div className="space-y-3">
                {grouped[cat].map((skill, i) => (
                  <SkillBar key={skill.id} skill={skill} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
