import React from "react";

interface AvatarGroupProps {
  users: {
    name: string;
    color?: string; // Tailwind bg color class, e.g. "bg-indigo-500"
  }[];
  limit?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  limit = 5,
}) => {
  const visibleUsers = users.slice(0, limit);
  const remainingCheck = users.length - limit;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a consistent color from string if not provided
  const getColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex -space-x-2 overflow-hidden items-center">
      {visibleUsers.map((user, index) => (
        <div
          key={index}
          className="relative inline-block group"
          title={user.name}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm ring-1 ring-slate-100 ${
              user.color || getColor(user.name)
            }`}
          >
            {getInitials(user.name)}
          </div>

          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {user.name}
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      ))}

      {remainingCheck > 0 && (
        <div className="relative inline-block">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-100 border-2 border-white shadow-sm ring-1 ring-slate-100">
            +{remainingCheck}
          </div>
        </div>
      )}
    </div>
  );
};
