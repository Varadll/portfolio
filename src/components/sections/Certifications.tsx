"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import Image from "next/image";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Certification } from "@/types/portfolio";

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

export default function Certifications({
  certifications,
}: {
  certifications: Certification[];
}) {
  if (certifications.length === 0) return null;

  return (
    <AnimatedSection id="certifications" className="py-20">
      <Container>
        <SectionHeading
          title="Certifications"
          subtitle="Professional credentials and achievements"
        />

        <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-2">
          {certifications.map((cert) => (
            <CertificationCard key={cert.id} cert={cert} />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
