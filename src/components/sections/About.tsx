"use client";

import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Badge from "@/components/ui/Badge";
import type { SiteSettings } from "@/types/portfolio";

export default function About({ settings }: { settings: SiteSettings }) {
  const { about } = settings;

  return (
    <AnimatedSection id="about" className="py-20">
      <Container>
        <SectionHeading
          title="About Me"
          subtitle="A little bit about my background and what I do"
        />

        <div className="max-w-3xl mx-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none text-muted leading-relaxed"
            dangerouslySetInnerHTML={{ __html: about.bio_html }}
          />

          {about.specialties.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">
                What I specialize in
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.specialties.map((s) => (
                  <Badge key={s} variant="accent">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </AnimatedSection>
  );
}
