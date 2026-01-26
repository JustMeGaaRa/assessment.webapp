interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const PageHeader = ({ title, description, icon }: PageHeaderProps) => {
  return (
    <header className="mb-10">
      <div className="flex justify-between items-start mb-8"></div>

      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-indigo-50 rounded-2xl shrink-0">{icon}</div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none mb-1.5">
            {title}
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base leading-tight">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
};
