import { Settings2 } from "lucide-react";
import type { ModuleState, ProfileState } from "../../types";

interface LibraryProfileProps {
  profile: ProfileState;
  matrix: ModuleState[];
}

export const LibraryProfile = ({ profile, matrix }: LibraryProfileProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700`}
          >
            {profile.stack} Stack
          </div>
          <Settings2 size={18} className="text-slate-300" />
        </div>

        <h3 className="text-xl font-bold text-slate-800">{profile.title}</h3>
        <p className="text-slate-500 text-sm">{profile.description}</p>
      </div>
      <div className="p-6">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
          Module Weight Distribution
        </h4>
        <div className="space-y-4">
          {Object.entries(profile.weights)
            .filter(([, weight]) => Number(weight) > 0)
            .map(([modId, weight]) => {
              const module = matrix.find((m) => m.id === modId);
              return (
                <div key={modId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {module?.title || modId}
                    </span>
                    <span className="font-bold text-slate-900">
                      {weight as number}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-indigo-500`}
                      style={{ width: `${weight as number}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
