import type { ModuleState } from "../../types";
import { LibraryModuleTopic } from "./LibraryModuleTopic";
import { Card } from "../ui/Card";

interface LibraryModuleProps {
  module: ModuleState;
  activeStack: string;
}

export const LibraryModule = ({ module, activeStack }: LibraryModuleProps) => {
  return (
    <Card>
      <Card.Header border className="px-4 py-3 md:px-6 md:py-4 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{module.title}</h3>
          <p className="text-xs text-slate-500 font-medium">{module.description}</p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
          {module.topics.length} Topics
        </div>
      </Card.Header>
      <Card.Body className="p-0 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-4 py-2 md:px-6 md:py-3 w-1/3">Topic</th>
              <th className="px-4 py-2 md:px-6 md:py-3">
                Current Stack ({activeStack})
              </th>
              <th className="px-4 py-2 md:px-6 md:py-3 text-right hidden md:table-cell">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {module.topics.map((topic) => (
              <LibraryModuleTopic
                key={topic.id}
                topic={topic}
                activeStack={activeStack}
              />
            ))}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};
