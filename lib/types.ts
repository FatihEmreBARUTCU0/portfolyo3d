export type ProjectStatus = "CANLI" | "YAPIM AŞAMASINDA";

export interface Project {
  id: string;
  title: string;
  url: string;
  description: string;
  status?: ProjectStatus;
  screenshotFile: string;
  screenshotSrc?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  school: string;
  period: string;
  location: string;
}
