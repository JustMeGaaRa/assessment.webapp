import { useState, useRef, useEffect } from "react";
import {
  Link as LinkIcon,
  Check,
  Play,
  Square,
  AlertTriangle,
  Wifi,
  WifiOff,
  Copy,
} from "lucide-react";
import { AvatarGroup } from "../ui/AvatarGroup";
import type { PeerSessionState } from "../../hooks/usePeerSession";

interface SessionConnectionBarProps {
  assessmentId?: string;
  assessorName: string;
  activePeers: { id: string; name: string }[];
  sessionStatus: PeerSessionState["status"];
  sessionError: string | null;
  isHost: boolean;
  hostPeerId?: string;
  onStartSession: () => void;
  onEndSession: () => void;
  onJoinSession: () => void;
  onLeaveSession: () => void;
}

const COLORS = [
  {
    color: "bg-indigo-500",
    text: "text-indigo-600",
    light: "bg-indigo-50",
  },
  {
    color: "bg-emerald-500",
    text: "text-emerald-600",
    light: "bg-emerald-50",
  },
  {
    color: "bg-amber-500",
    text: "text-amber-600",
    light: "bg-amber-50",
  },
  {
    color: "bg-pink-500",
    text: "text-pink-600",
    light: "bg-pink-50",
  },
  {
    color: "bg-blue-500",
    text: "text-blue-600",
    light: "bg-blue-50",
  },
];

export const SessionConnectionBar = ({
  assessmentId,
  assessorName,
  activePeers,
  sessionStatus,
  sessionError,
  isHost,
  hostPeerId,
  onStartSession,
  onEndSession,
  onJoinSession,
  onLeaveSession,
}: SessionConnectionBarProps) => {
  const [copied, setCopied] = useState(false);
  const [showSharePopover, setShowSharePopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowSharePopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-open Share Popover when session starts
  useEffect(() => {
    if (sessionStatus === "connected" && isHost) {
      const timer = setTimeout(() => {
        setShowSharePopover(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sessionStatus, isHost]);

  const handleCopyLink = () => {
    if (!hostPeerId) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/assessment/${assessmentId}?s=${hostPeerId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onlineUsers = [
    { name: assessorName, id: "me" },
    ...activePeers.filter(
      (p) => p.name !== assessorName && p.id !== "me" && p.id !== hostPeerId
    ),
  ].map((p, idx) => {
    const style = COLORS[idx % COLORS.length];
    return {
      id: p.id,
      name: p.name,
      color: style.color,
      text: style.text,
      light: style.light,
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <AvatarGroup users={onlineUsers} />

      <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>

      {isHost ? (
        // HOST Controls
        <div className="relative" ref={popoverRef}>
          {sessionStatus === "connected" ? (
            <button
              onClick={() => setShowSharePopover(!showSharePopover)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-bold transition-all shadow-sm text-sm cursor-pointer ${
                showSharePopover
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <Wifi size={18} className="text-emerald-500" />
              <span className="hidden sm:inline">Share Session</span>
            </button>
          ) : (
            <button
              onClick={onStartSession}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-55 rounded-xl font-bold transition-all shadow-sm text-sm cursor-pointer"
              disabled={sessionStatus === "connecting"}
            >
              {sessionStatus === "connecting" ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={18} />
              )}
              <span className="hidden sm:inline">Start Session</span>
            </button>
          )}

          {/* Popover */}
          {showSharePopover && sessionStatus === "connected" && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm">
                  Share Session
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Online
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Share this link with peers to let them join this
                assessment session.
              </p>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all group mb-4 cursor-pointer"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <LinkIcon
                    size={16}
                    className="text-slate-400 group-hover:text-indigo-500"
                  />
                  <span className="truncate max-w-[180px]">
                    {typeof window !== "undefined" ? window.location.origin : ""}/assessment/{assessmentId}...
                  </span>
                </div>
                {copied ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Copy
                    size={16}
                    className="text-slate-400 group-hover:text-indigo-500"
                  />
                )}
              </button>

              <div className="h-px bg-slate-100 my-2" />

              <button
                onClick={() => {
                  onEndSession();
                  setShowSharePopover(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                <Square size={16} />
                Stop Session
              </button>
            </div>
          )}
        </div>
      ) : (
        // GUEST / PEER Controls
        <>
          {sessionStatus === "connected" ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold">
                <Wifi size={16} />
                <span className="hidden sm:inline">Connected</span>
              </div>
              <button
                onClick={onLeaveSession}
                className="flex items-center gap-2 px-3 py-2 bg-white text-slate-500 border border-slate-200 hover:text-red-600 hover:border-red-200 rounded-xl font-bold transition-all shadow-sm text-sm cursor-pointer"
              >
                <Square size={16} />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </div>
          ) : sessionStatus === "connecting" ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl font-bold shadow-sm text-sm">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Joining...</span>
            </div>
          ) : hostPeerId && !isHost ? (
            <button
              onClick={onJoinSession}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-sm text-sm animate-pulse cursor-pointer"
            >
              <LinkIcon size={18} />
              <span className="hidden sm:inline">
                {sessionStatus === "error" ? "Retry Join" : "Join Session"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium px-2">
              <WifiOff size={16} />
              Offline
            </div>
          )}
        </>
      )}

      {/* Connection Lost Alert */}
      {sessionStatus === "error" && !isHost && (
        <div className="relative group">
          <div className="p-2 text-red-500 bg-white border border-red-100 rounded-lg shadow-sm cursor-help animate-pulse">
            <AlertTriangle size={20} />
          </div>
          <div className="absolute right-0 top-full mt-2 w-72 bg-white p-4 rounded-xl border border-slate-200 shadow-xl z-30 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
            <h4 className="font-bold text-slate-800 mb-1 text-sm">
              Connection Lost
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              {sessionError || "Connection interrupted."}
            </p>
            <button
              onClick={onLeaveSession}
              className="w-full px-3 py-2 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Continue Locally
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
