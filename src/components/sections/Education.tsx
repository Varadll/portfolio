"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, ExternalLink } from "lucide-react";
import Image from "next/image";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type {
  Education as EducationType,
  Certification,
} from "@/types/portfolio";

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

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        {cert.badge_image_url ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={cert.badge_image_url}
              alt={cert.name}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Award size={22} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary">{cert.name}</h3>
          <p className="text-sm text-muted">{cert.issuer}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {cert.issue_date && (
              <p className="text-xs text-muted">
                Issued{" "}
                {new Date(cert.issue_date).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                View Credential <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Education({
  education,
  certifications,
}: {
  education: EducationType[];
  certifications: Certification[];
}) {
  if (education.length === 0 && certifications.length === 0) return null;

  return (
    <AnimatedSection id="education" className="py-20">
      <Container>
        <SectionHeading
          title="Education & Certifications"
          subtitle="My academic background and credentials"
        />

        <div className="max-w-3xl mx-auto space-y-10">
          {education.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
                Education
              </h3>
              <div className="grid gap-4">
                {education.map((edu) => (
                  <EducationCard key={edu.id} edu={edu} />
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
                Certifications
              </h3>
              <div className="grid gap-4">
                {certifications.map((cert) => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </AnimatedSection>
  );
}
