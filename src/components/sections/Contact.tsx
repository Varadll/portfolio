"use client";

import { useState, type FormEvent } from "react";
import { Send, Loader2, CheckCircle, Mail } from "lucide-react";
import GithubIcon from "@/components/ui/GithubIcon";
import LinkedInIcon from "@/components/ui/LinkedInIcon";
import AnimatedSection from "@/components/shared/AnimatedSection";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { submitContactMessage } from "@/lib/supabase-portfolio";
import type { SiteSettings } from "@/types/portfolio";

export default function Contact({ settings }: { settings: SiteSettings }) {
  const { social_links } = settings;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await submitContactMessage({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        subject: (formData.get("subject") as string) || null,
        message: formData.get("message") as string,
      });
      setIsSuccess(true);
      form.reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection id="contact" className="py-20 bg-bg-secondary">
      <Container>
        <SectionHeading
          title="Get in Touch"
          subtitle="Have a project in mind or want to collaborate? Let's talk."
        />

        <div className="max-w-4xl mx-auto grid gap-10 md:grid-cols-5">
          {/* Contact form */}
          <div className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-primary mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-primary placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-primary mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-primary placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-primary mb-1.5"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-primary placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-primary mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-primary placeholder:text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle size={16} />
                  Message sent successfully! I&apos;ll get back to you soon.
                </div>
              )}

              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Social links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
              Connect with me
            </h3>
            <div className="space-y-3">
              {social_links.email && (
                <a
                  href={`mailto:${social_links.email}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm text-muted hover:text-primary hover:border-accent/30 transition-colors"
                >
                  <Mail size={18} className="text-accent" />
                  {social_links.email}
                </a>
              )}
              {social_links.github && (
                <a
                  href={social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm text-muted hover:text-primary hover:border-accent/30 transition-colors"
                >
                  <GithubIcon size={18} className="text-accent" />
                  GitHub
                </a>
              )}
              {social_links.linkedin && (
                <a
                  href={social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm text-muted hover:text-primary hover:border-accent/30 transition-colors"
                >
                  <LinkedInIcon size={18} className="text-accent" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </Container>
    </AnimatedSection>
  );
}
