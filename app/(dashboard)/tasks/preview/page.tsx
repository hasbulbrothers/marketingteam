import { PageHeader } from "@/components/layout/page-header";
import { TaskTableNotion, TaskWithSubtasks } from "@/components/tasks/task-table-notion";

const previewTasks: TaskWithSubtasks[] = [
  {
    id: "1",
    title: "Raya campaign hero video concept",
    description: "Pitch deck and storyboard for 60s hero film",
    status: "idea",
    priority: "high",
    dueDate: "2026-04-22",
    platform: "TikTok",
    contentType: "Campaign",
    tags: ["raya", "video"],
    assignee: { id: "u1", name: "Aisyah Rahman", role: "Creative Lead" },
  },
  {
    id: "2",
    title: "Weekly Threads content calendar",
    description: "5 posts covering product tips and team stories",
    status: "idea",
    priority: "low",
    dueDate: "2026-04-19",
    platform: "Threads",
    contentType: "Authority",
    tags: ["threads"],
    assignee: { id: "u2", name: "Danial Hakim", role: "Content Writer" },
  },
  {
    id: "3",
    title: "Landing page copy revision",
    description: "Rewrite hero and FAQ section for conversion",
    status: "planning",
    priority: "medium",
    dueDate: "2026-04-20",
    platform: "Website",
    contentType: "Conversion",
    tags: ["copy", "cro"],
    assignee: { id: "u3", name: "Nurul Izzah", role: "Copywriter" },
  },
  {
    id: "4",
    title: "3 video ads: Raya promo series",
    description: "Hasilkan 3 video ads pendek untuk campaign Raya — format 9:16 untuk Reels & TikTok.",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-04-18",
    platform: "Instagram",
    contentType: "Campaign",
    tags: ["reel", "ads", "raya"],
    assignee: { id: "u4", name: "Faris Mat", role: "Video Editor" },
    subtasks: [
      { id: "4-1", title: "Tulis 3 skrip pendek (15s setiap satu)", isCompleted: true },
      { id: "4-2", title: "Siapkan mood board & shot list", isCompleted: true },
      { id: "4-3", title: "Shoot footage di studio", isCompleted: false },
      { id: "4-4", title: "Edit Video Ad 1 — produk utama", isCompleted: false },
      { id: "4-5", title: "Edit Video Ad 2 — testimoni pelanggan", isCompleted: false },
      { id: "4-6", title: "Edit Video Ad 3 — CTA penutup", isCompleted: false },
      { id: "4-7", title: "Review dengan team marketing", isCompleted: false },
      { id: "4-8", title: "Export dan hantar untuk approval", isCompleted: false },
    ],
  },
  {
    id: "5",
    title: "Email newsletter April edition",
    description: "Product updates, team spotlight, CTA",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-04-21",
    platform: "Email",
    contentType: "Authority",
    tags: ["newsletter"],
    assignee: { id: "u2", name: "Danial Hakim", role: "Content Writer" },
  },
  {
    id: "6",
    title: "TikTok trend hijack: duet format",
    description: "React to trending sound with product angle",
    status: "review",
    priority: "urgent",
    dueDate: "2026-04-17",
    platform: "TikTok",
    contentType: "Awareness",
    tags: ["trend"],
    assignee: { id: "u1", name: "Aisyah Rahman", role: "Creative Lead" },
  },
  {
    id: "7",
    title: "YouTube long-form walkthrough",
    description: "8 min tutorial on new feature release",
    status: "review",
    priority: "medium",
    dueDate: "2026-04-23",
    platform: "YouTube",
    contentType: "Consideration",
    tags: ["tutorial"],
    assignee: { id: "u4", name: "Faris Mat", role: "Video Editor" },
    subtasks: [
      { id: "7-1", title: "Draf outline dan timestamps", isCompleted: true },
      { id: "7-2", title: "Rakam voiceover", isCompleted: true },
      { id: "7-3", title: "Edit & colour grade", isCompleted: true },
      { id: "7-4", title: "Tambah subtitle Bahasa Melayu", isCompleted: false },
      { id: "7-5", title: "Thumbnail design", isCompleted: false },
    ],
  },
  {
    id: "8",
    title: "Facebook carousel: client testimonials",
    description: "5 slides, quote + photo layout",
    status: "scheduled",
    priority: "low",
    dueDate: "2026-04-19",
    platform: "Facebook",
    contentType: "Authority",
    tags: ["testimonial"],
    assignee: { id: "u3", name: "Nurul Izzah", role: "Copywriter" },
  },
  {
    id: "9",
    title: "Raya greeting static post",
    description: "Festive design with company logo and tagline",
    status: "published",
    priority: "low",
    dueDate: "2026-04-15",
    platform: "Instagram",
    contentType: "Awareness",
    tags: ["raya"],
    assignee: { id: "u1", name: "Aisyah Rahman", role: "Creative Lead" },
  },
];

export default function TasksPreviewPage() {
  return (
    <div className="page-frame gap-6 py-8">
      <PageHeader
        eyebrow="Tasks · Preview"
        title="Notion-style task list"
        description="Preview kemas kini reka bentuk untuk halaman task. Data di bawah adalah contoh — belum disambungkan ke Convex."
      />
      <TaskTableNotion tasks={previewTasks} />
    </div>
  );
}
