import { Settings2 } from "lucide-react";
import type { CompetenceMatrix, Profile } from "../../lib/matrix/types";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

interface LibraryProfileProps {
  profile: Profile;
  matrix: CompetenceMatrix;
}

export const LibraryProfile = ({ profile, matrix }: LibraryProfileProps) => {
  return (
    <Card>
      <Card.Header border>
        <div className="flex justify-between items-start mb-4">
          <div className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
            {profile.stack} Stack
          </div>
          <Settings2 size={18} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{profile.profileName}</h3>
        <p className="text-slate-500 text-sm">{profile.description}</p>
      </Card.Header>
      <Card.Body>
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
          Module Weight Distribution
        </h4>
        <div className="space-y-4">
          {profile.modules
            .filter((m) => Number(m.weight) > 0)
            .map((pm) => {
              const module = matrix.modules.find((m) => m.moduleId === pm.moduleId);
              return (
                <div key={pm.moduleId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {module?.moduleName || pm.moduleId}
                    </span>
                    <span className="font-bold text-slate-900">
                      {pm.weight}%
                    </span>
                  </div>
                  <ProgressBar
                    value={pm.weight}
                    fillClassName="bg-indigo-500"
                  />
                </div>
              );
            })}
        </div>
      </Card.Body>
    </Card>
  );
};
