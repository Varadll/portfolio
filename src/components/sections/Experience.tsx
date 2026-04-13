"use client";

import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import TimelineItem from "@/components/shared/TimelineItem";
import type { Experience as ExperienceType } from "@/types/portfolio";

export default function Experience({
  experience,
}: {
  experience: ExperienceType[];
}) {
  if (experience.length === 0) return null;

  return (
    <AnimatedSection id="experience" className="py-20 bg-bg-secondary">
      <Container>
        <SectionHeading
          title="Experience"
          subtitle="My professional journey so far"
        />

        <div className="max-w-3xl mx-auto">
          {experience.map((exp) => (
            <TimelineItem
              key={exp.id}
              title={exp.role}
              subtitle={exp.company}
              location={exp.location}
              startDate={exp.start_date}
              endDate={exp.end_date}
              description={exp.description_html}
              tags={exp.tech_used}
              type={exp.type}
            />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
