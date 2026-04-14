export type TaskStatus =
  | "idea"
  | "planning"
  | "in_progress"
  | "review"
  | "scheduled"
  | "published"
  | "archived";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type Platform =
  | "TikTok"
  | "Instagram"
  | "Facebook"
  | "Threads"
  | "YouTube"
  | "Email"
  | "Website";
export type ContentType =
  | "Awareness"
  | "Authority"
  | "Consideration"
  | "Conversion"
  | "Campaign"
  | "Internal";

export type MarketingTask = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  platform: Platform;
  contentType: ContentType;
  tags: string[];
  assignee: {
    id: string;
    name: string;
    role: string;
  };
};

export type TaskFiltersState = {
  query: string;
  status: TaskStatus | null;
  priority: TaskPriority | null;
  platform: Platform | null;
  contentType: ContentType | null;
};
