export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-slate-800">404</h1>
      <p className="text-slate-500">Page not found.</p>
      <a href="/" className="text-primary underline underline-offset-4">
        Go back home
      </a>
    </div>
  );
}
