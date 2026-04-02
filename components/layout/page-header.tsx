type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-2 space-y-4">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <div className="space-y-4">
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="max-w-2xl text-lg leading-relaxed font-light text-slate-500">{description}</p>
      </div>
    </div>
  );
}
