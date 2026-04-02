export type TeamRole =
  | "Content Creator"
  | "Copywriter"
  | "Designer"
  | "Video Editor"
  | "Social Media Executive"
  | "Marketing Manager";

export type TeamMember = {
  id: string;
  name: string;
  role: TeamRole | string;
  email?: string;
  avatarUrl?: string;
};
