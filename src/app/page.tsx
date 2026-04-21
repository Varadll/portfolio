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
} from "@/lib/supabase-portfolio";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const [settings, projects, experience, education, certifications] =
    await Promise.all([
      fetchSettings(),
      fetchFeaturedProjects(),
      fetchExperience(),
      fetchEducation(),
      fetchCertifications(),
    ]);

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} />
      {settings.home_sections.show_certifications && (
        <Certifications certifications={certifications} />
      )}
      <Projects
        projects={projects}
        heading={settings.projects_section.heading}
        subtitle={settings.projects_section.subtitle}
      />
      <Experience experience={experience} />
      <Education education={education} />
      <Contact settings={settings} />
    </>
  );
}
