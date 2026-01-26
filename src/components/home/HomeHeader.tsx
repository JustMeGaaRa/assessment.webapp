import { FileText } from "lucide-react";

export const HomeHeader = () => {
  return (
    <header className="mb-12 md:mb-16 text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="p-3 bg-indigo-50 rounded-xl">
          <FileText className="text-indigo-600 w-8 h-8" />
        </div>
      </div>
      <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">
        Technical Assessment Portal
      </h1>
      <p className="text-lg text-slate-500 font-medium leading-relaxed">
        Streamlined assessment process for engineering candidates. Configure
        your matrix and start a new session.
      </p>
    </header>
  );
};
