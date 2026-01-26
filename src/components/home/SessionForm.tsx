import { User, ArrowRight, Layers, Users } from "lucide-react";
import type { Profile } from "../../types";

interface SessionFormProps {
  name: string;
  setName: (name: string) => void;
  selectedStackKey: string;
  setSelectedStackKey: (key: string) => void;
  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;
  currentStacks: string[];
  currentProfiles: Profile[];
  handleStart: (e: React.FormEvent) => void;
  isFormValid: boolean;
}

export const SessionForm = ({
  name,
  setName,
  selectedStackKey,
  setSelectedStackKey,
  selectedProfileId,
  setSelectedProfileId,
  currentStacks,
  currentProfiles,
  handleStart,
  isFormValid,
}: SessionFormProps) => {
  return (
    <form
      onSubmit={handleStart}
      className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-300"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            Candidate Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Layers size={16} className="text-slate-400" />
              Technology Stack <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStackKey}
              onChange={(e) => setSelectedStackKey(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {currentStacks.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              Role Profile <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {currentProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        <span>Start Assessment</span>
        <ArrowRight size={20} />
      </button>
    </form>
  );
};
