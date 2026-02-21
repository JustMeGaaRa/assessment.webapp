interface ProgressBarProps {
  value: number;
  fillClassName?: string;
  color?: string;
  height?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const getHslColor = (value: number): string =>
  `hsl(${Math.round((value * 120) / 100)}, 70%, 50%)`;

export const ProgressBar = ({
  value,
  fillClassName,
  color,
  height = "sm",
  showLabel = false,
  className = "",
}: ProgressBarProps) => {
  const trackHeight = height === "sm" ? "h-1.5" : "h-2";
  const resolvedColor = color ?? (!fillClassName ? getHslColor(value) : undefined);

  return (
    <div className={className}>
      {showLabel && (
        <span
          className={`text-sm font-bold block mb-1 ${value === 0 ? "text-slate-400" : ""}`}
          style={value > 0 ? { color: getHslColor(value) } : undefined}
        >
          {value}%
        </span>
      )}
      <div className={`w-full ${trackHeight} bg-slate-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClassName ?? ""}`}
          style={{
            width: `${value}%`,
            ...(resolvedColor ? { backgroundColor: resolvedColor } : {}),
          }}
        />
      </div>
    </div>
  );
};
