"use client";

import { useState } from "react";
import {
  FolderKanban,
  Briefcase,
  GraduationCap,
  Award,
  Wrench,
  Settings,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import ProjectManager from "@/components/admin/ProjectManager";
import ExperienceManager from "@/components/admin/ExperienceManager";
import EducationManager from "@/components/admin/EducationManager";
import CertificationManager from "@/components/admin/CertificationManager";
import SkillsManager from "@/components/admin/SkillsManager";
import SettingsManager from "@/components/admin/SettingsManager";
import MessagesManager from "@/components/admin/MessagesManager";

const TABS = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certs", icon: Award },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "messages", label: "Messages", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("projects");
  const { signOut } = useAuth();

  const revalidate = async () => {
    await fetch("/api/revalidate?path=/", { method: "POST" });
    await fetch("/api/revalidate?path=/projects", { method: "POST" });
  };

  return (
    <div className="py-8">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Portfolio Admin
          </h1>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-border mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-primary hover:border-border"
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "projects" && (
          <ProjectManager onMutate={revalidate} />
        )}
        {activeTab === "experience" && (
          <ExperienceManager onMutate={revalidate} />
        )}
        {activeTab === "education" && (
          <EducationManager onMutate={revalidate} />
        )}
        {activeTab === "certifications" && (
          <CertificationManager onMutate={revalidate} />
        )}
        {activeTab === "skills" && (
          <SkillsManager onMutate={revalidate} />
        )}
        {activeTab === "settings" && (
          <SettingsManager onMutate={revalidate} />
        )}
        {activeTab === "messages" && <MessagesManager />}
      </Container>
    </div>
  );
}
