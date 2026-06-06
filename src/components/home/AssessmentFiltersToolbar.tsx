import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  SlidersHorizontal,
  ChevronDown,
  Check,
} from "lucide-react";
import { FilterChip } from "../ui/FilterChip";

interface UnifiedChipItem {
  type: "profile" | "stack";
  id: string;
  label: string;
  popularity: number;
}

interface AssessmentFiltersToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: "date" | "name";
  setSortBy: (field: "date" | "name") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  unifiedChips: UnifiedChipItem[];
  selectedProfiles: string[];
  selectedStacks: string[];
  toggleProfile: (profileId: string) => void;
  toggleStack: (stack: string) => void;
  getProfileCount: (profileId: string) => number;
  getStackCount: (stack: string) => number;
}

export const AssessmentFiltersToolbar = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  unifiedChips,
  selectedProfiles,
  selectedStacks,
  toggleProfile,
  toggleStack,
  getProfileCount,
  getStackCount,
}: AssessmentFiltersToolbarProps) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sorting dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Search & Sort controls row */}
      <div className="flex flex-row gap-2 sm:gap-4 items-center">
        {/* Name Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search candidate by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            
            {/* Custom styled dropdown menu for sorting */}
            <div className="relative" ref={sortMenuRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer flex items-center justify-center shadow-sm shrink-0 w-10 h-10 sm:w-auto sm:px-4 sm:py-2"
                title="Sort options"
              >
                {/* Mobile View: Icon only */}
                <SlidersHorizontal className="w-5 h-5 sm:hidden" />
                
                {/* Desktop View: Label and current selection */}
                <div className="hidden sm:flex items-center gap-1.5 text-sm">
                  <span className="text-slate-500 font-medium">Sort by:</span>
                  <span className="font-bold text-slate-700">{sortBy === "date" ? "Date Added" : "Candidate Name"}</span>
                  <ChevronDown size={16} className={`text-slate-500 transition-transform duration-250 ${showSortMenu ? "rotate-180" : ""}`} />
                </div>
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setSortBy("date");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      sortBy === "date"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Date Added</span>
                    {sortBy === "date" && <Check size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                      sortBy === "name"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Candidate Name</span>
                    {sortBy === "name" && <Check size={16} />}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              title={sortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
              className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer flex items-center justify-center shadow-sm shrink-0"
            >
              {sortOrder === "asc" ? (
                <ArrowUpNarrowWide className="w-5 h-5" />
              ) : (
                <ArrowDownNarrowWide className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Unified scrollable Tag Chips (Profiles & Tech Stacks) */}
      <div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-none">
        {unifiedChips.map((chip) => {
          const isProfile = chip.type === "profile";
          const isSelected = isProfile
            ? selectedProfiles.includes(chip.id)
            : selectedStacks.includes(chip.id);

          const count = isProfile
            ? getProfileCount(chip.id)
            : getStackCount(chip.id);

          return (
            <FilterChip
              key={`${chip.type}-${chip.id}`}
              label={chip.label}
              isSelected={isSelected}
              onClick={() =>
                isProfile ? toggleProfile(chip.id) : toggleStack(chip.id)
              }
              count={count}
            />
          );
        })}
      </div>
    </div>
  );
};
