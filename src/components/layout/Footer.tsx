import { Mail } from "lucide-react";
import Container from "@/components/ui/Container";
import GithubIcon from "@/components/ui/GithubIcon";
import LinkedInIcon from "@/components/ui/LinkedInIcon";
import { SITE } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary py-8">
      <Container>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <a
            href="/admin/login"
            className="text-sm text-muted hover:text-muted transition-colors cursor-default"
            title=""
          >
            &copy; {currentYear} {SITE.name}. All rights reserved.
          </a>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedInIcon size={18} />
            </a>
            <a
              href="mailto:hello@example.com"
              className="text-muted hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
