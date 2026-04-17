type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-2 space-y-3 sm:space-y-4">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <div className="space-y-3 sm:space-y-4">
        <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed font-light text-slate-500 sm:text-lg">{description}</p>
      </div>
    </div>
  );
}
