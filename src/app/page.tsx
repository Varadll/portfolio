import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Certifications from "@/components/sections/Certifications";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";
import {
  fetchSettings,
  fetchFeaturedProjects,
  fetchExperience,
  fetchEducation,
  fetchCertifications,
  fetchAllTestimonials,
} from "@/lib/supabase-portfolio";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const [settings, projects, experience, education, certifications, testimonials] =
    await Promise.all([
      fetchSettings(),
      fetchFeaturedProjects(),
      fetchExperience(),
      fetchEducation(),
      fetchCertifications(),
      fetchAllTestimonials(),
    ]);

  const reviewCounts = new Map<string, number>();
  for (const t of testimonials) {
    reviewCounts.set(t.project_id, (reviewCounts.get(t.project_id) ?? 0) + 1);
  }

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} />
      {settings.home_sections.show_certifications && (
        <Certifications certifications={certifications} />
      )}
      <Projects
        projects={projects}
        reviewCounts={reviewCounts}
        heading={settings.projects_section.heading}
        subtitle={settings.projects_section.subtitle}
      />
      <Experience experience={experience} />
      <Education education={education} />
      <Contact settings={settings} />
    </>
  );
}
