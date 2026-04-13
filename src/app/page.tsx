import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import Contact from "@/components/sections/Contact";
import {
  fetchSettings,
  fetchFeaturedProjects,
  fetchSkills,
  fetchExperience,
  fetchEducation,
  fetchCertifications,
} from "@/lib/supabase-portfolio";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const [settings, projects, skills, experience, education, certifications] =
    await Promise.all([
      fetchSettings(),
      fetchFeaturedProjects(),
      fetchSkills(),
      fetchExperience(),
      fetchEducation(),
      fetchCertifications(),
    ]);

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} />
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Experience experience={experience} />
      <Education education={education} certifications={certifications} />
      <Contact settings={settings} />
    </>
  );
}
