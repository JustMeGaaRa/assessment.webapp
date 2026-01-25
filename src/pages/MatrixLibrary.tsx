import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ArrowLeft, Box, Settings2 } from "lucide-react";
import { ASSESSMENT_MATRIX, PROFILES, STACKS } from "../data";

export const MatrixLibrary = () => {
  const navigate = useNavigate();
  const [activeStack, setActiveStack] = useState(STACKS.DOTNET);
  const [activeTab, setActiveTab] = useState<"modules" | "profiles">("modules");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 font-semibold"
          >
            <ArrowLeft size={18} />
            <span>Back to Assessment</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="p-3 bg-indigo-50 rounded-xl w-fit mb-4">
                <Box className="text-indigo-600 w-8 h-8" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                Assessment Matrix Library
              </h1>
              <p className="text-slate-500 font-medium">
                Standardized library of technical competencies
              </p>
            </div>

            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              {Object.values(STACKS).map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveStack(s)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeStack === s ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab("modules")}
            className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === "modules" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className="flex items-center gap-2">
              <Box size={18} /> Modules & Mappings
            </div>
            {activeTab === "modules" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("profiles")}
            className={`pb-4 px-2 text-sm font-bold transition-colors relative ${activeTab === "profiles" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <div className="flex items-center gap-2">
              <Users size={18} /> Role Profiles
            </div>
            {activeTab === "profiles" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content Area */}
        {activeTab === "modules" ? (
          <div className="grid grid-cols-1 gap-6">
            {ASSESSMENT_MATRIX.map((module) => (
              <div
                key={module.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {module.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {module.description}
                    </p>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
                    {module.topics.length} Topics
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-6 py-3 w-1/3">Topic</th>
                        <th className="px-6 py-3 text-indigo-600">
                          Current Stack ({activeStack})
                        </th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {module.topics.map((topic) => (
                        <tr
                          key={topic.id}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            {topic.name}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            {topic.mappings[activeStack]}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-xs font-bold text-indigo-500 hover:underline">
                              Edit Mapping
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROFILES.filter((p) => p.stack === activeStack).map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700`}
                    >
                      {profile.stack} Stack
                    </div>
                    <Settings2 size={18} className="text-slate-300" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800">
                    {profile.title}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {profile.description}
                  </p>
                </div>
                <div className="p-6">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
                    Module Weight Distribution
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(profile.weights).map(([modId, weight]) => {
                      const module = ASSESSMENT_MATRIX.find(
                        (m) => m.id === modId,
                      );
                      return (
                        <div key={modId}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700">
                              {module?.title || modId}
                            </span>
                            <span className="font-bold text-slate-900">
                              {weight}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-indigo-500`}
                              style={{ width: `${weight}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
