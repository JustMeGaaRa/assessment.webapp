import { useEffect, useRef, useState, useCallback } from "react";
import Peer, { type DataConnection } from "peerjs";
import type { AssessorEvaluationState, AssessmentSessionState } from "../types";

export type PeerMessage =
  | { type: "SYNC_REQUEST" }
  | {
      type: "SYNC_RESPONSE";
      payload: {
        assessment: AssessmentSessionState;
        evaluations: AssessorEvaluationState[];
        matrix: ModuleState[];
        profiles: ProfileState[];
        stacks: Record<string, string>;
      };
    }
  | {
      type: "UPDATE_EVALUATION";
      payload: AssessorEvaluationState;
    }
  | {
      type: "UPDATE_ASSESSMENT";
      payload: Partial<AssessmentSessionState>;
    }
  | {
      type: "HELLO";
      payload: { peerId: string; nametag: string };
    }
  | {
      type: "UPDATE_PEERS";
      payload: { id: string; name: string }[];
    }
  | {
      type: "SESSION_CLOSED";
    };

export type PeerSessionState = ReturnType<typeof usePeerSession>;
import type { ModuleState, ProfileState } from "../types";

interface UsePeerSessionProps {
  assessmentId?: string;
  assessorName: string;
  currentAssessment?: AssessmentSessionState;
  currentEvaluations?: AssessorEvaluationState[];
  currentMatrix?: ModuleState[];
  currentProfiles?: ProfileState[];
  currentStacks?: Record<string, string>;
  onSyncReceived: (
    assessment: AssessmentSessionState,
    evaluations: AssessorEvaluationState[],
    matrix: ModuleState[],
    profiles: ProfileState[],
    stacks: Record<string, string>,
  ) => void;
  onEvaluationReceived: (evaluation: AssessorEvaluationState) => void;
  onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => void;
  onSessionClosed?: () => void;
}

export const usePeerSession = ({
  assessorName,
  currentAssessment,
  currentEvaluations,
  currentMatrix,
  currentProfiles,
  currentStacks,
  onSyncReceived,
  onEvaluationReceived,
  onAssessmentUpdateReceived,
  onSessionClosed,
}: UsePeerSessionProps) => {
  const [peerId, setPeerId] = useState<string>("");
  const [hostId, setHostId] = useState<string | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [activePeers, setActivePeers] = useState<
    { id: string; name: string }[]
  >([]);

  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  const stateRef = useRef({
    currentAssessment,
    currentEvaluations,
    currentMatrix,
    currentProfiles,
    currentStacks,
    assessorName,
    onSyncReceived,
    onEvaluationReceived,
    onAssessmentUpdateReceived,
    onSessionClosed,
  });

  useEffect(() => {
    stateRef.current = {
      currentAssessment,
      currentEvaluations,
      currentMatrix,
      currentProfiles,
      currentStacks,
      assessorName,
      onSyncReceived,
      onEvaluationReceived,
      onAssessmentUpdateReceived,
      onSessionClosed,
    };
  }, [
    currentAssessment,
    currentEvaluations,
    currentMatrix,
    currentProfiles,
    currentStacks,
    onSyncReceived,
    onEvaluationReceived,
    onAssessmentUpdateReceived,
    onSessionClosed,
    assessorName,
  ]);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      console.log(`[Peer] Nuke everything for ${peerRef.current.id}`);
      connectionsRef.current.forEach((conn) => {
        conn.close();
      });
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setConnections([]);
    setActivePeers([]);
    setPeerId("");
    setStatus("disconnected");
  }, []);

  const handleMessage = useCallback(
    (message: PeerMessage, senderConnection: DataConnection) => {
      const broadcastToOthers = (msg: PeerMessage) => {
        if (!hostId) {
          connectionsRef.current.forEach((conn) => {
            if (conn.open && conn.peer !== senderConnection.peer) {
              console.log("[Host] Echoing", msg.type, "to", conn.peer);
              conn.send(msg);
            }
          });
        }
      };

      switch (message.type) {
        case "SYNC_REQUEST":
          if (
            stateRef.current.currentAssessment &&
            stateRef.current.currentEvaluations &&
            stateRef.current.currentMatrix &&
            stateRef.current.currentProfiles &&
            stateRef.current.currentStacks
          ) {
            senderConnection.send({
              type: "SYNC_RESPONSE",
              payload: {
                assessment: stateRef.current.currentAssessment,
                evaluations: stateRef.current.currentEvaluations,
                matrix: stateRef.current.currentMatrix,
                profiles: stateRef.current.currentProfiles,
                stacks: stateRef.current.currentStacks,
              },
            });
          }
          break;

        case "SYNC_RESPONSE":
          stateRef.current.onSyncReceived(
            message.payload.assessment,
            message.payload.evaluations,
            message.payload.matrix,
            message.payload.profiles,
            message.payload.stacks,
          );
          break;

        case "UPDATE_EVALUATION":
          stateRef.current.onEvaluationReceived(message.payload);
          broadcastToOthers(message);
          break;

        case "UPDATE_ASSESSMENT":
          stateRef.current.onAssessmentUpdateReceived(message.payload);
          broadcastToOthers(message);
          break;

        case "HELLO":
          console.log(
            "[Peer] HELLO from:",
            message.payload.nametag,
            message.payload.peerId,
          );
          setActivePeers((prev) => {
            const exists = prev.some((p) => p.id === message.payload.peerId);
            if (exists) return prev;
            return [
              ...prev,
              { id: message.payload.peerId, name: message.payload.nametag },
            ];
          });
          break;

        case "UPDATE_PEERS":
          // I am a guest receiving the full list from Host
          setActivePeers(
            message.payload.filter((p) => p.id !== peerRef.current?.id), // Remove myself from list
          );
          break;

        case "SESSION_CLOSED":
          console.log("[Peer] Session closed by Host.");
          if (stateRef.current.onSessionClosed) {
            stateRef.current.onSessionClosed();
          }
          destroyPeer();
          setError("The session was closed by the host.");
          setStatus("disconnected");
          break;
      }
    },
    [hostId, destroyPeer],
  );

  // HOST: Broadcast active peers list whenever it changes
  useEffect(() => {
    // Only Host does this
    if (!hostId && peerId && connections.length > 0) {
      const fullList = [
        { id: peerId, name: assessorName }, // Me (Host)
        ...activePeers,
      ];

      connections.forEach((conn) => {
        if (conn.open) {
          conn.send({ type: "UPDATE_PEERS", payload: fullList });
        }
      });
    }
  }, [activePeers, connections, peerId, hostId, assessorName]);

  const handleConnection = useCallback(
    (connection: DataConnection) => {
      const registerEvents = () => {
        console.log("[Peer] Connection opened:", connection.peer);
        setConnections((prev) => {
          if (prev.some((c) => c.peer === connection.peer)) return prev;
          return [...prev, connection];
        });

        // If we were connecting to a host, and this is THAT connection, we are now connected
        // Checks logic: If I initiated connection, connection.peer is the remote.

        // Send HELLO
        connection.send({
          type: "HELLO",
          payload: {
            peerId: peerRef.current?.id || "",
            nametag: stateRef.current.assessorName,
          },
        });
      };

      if (connection.open) {
        registerEvents();
      } else {
        connection.on("open", registerEvents);
      }

      connection.on("data", (data: unknown) => {
        const message = data as PeerMessage;
        handleMessage(message, connection);
      });

      connection.on("close", () => {
        console.log("[Peer] Connection closed:", connection.peer);
        setConnections((prev) =>
          prev.filter((c) => c.peer !== connection.peer),
        );
        setActivePeers((prev) => prev.filter((p) => p.id !== connection.peer));
        // If this was our host, we are disconnected
        setHostId((currentHostId) => {
          if (currentHostId === connection.peer) {
            // We lost the host
            setStatus("disconnected");
            // Optional: trigger session closed?
          }
          return currentHostId;
        });
      });

      connection.on("error", (err) => {
        console.error("[Peer] Connection error:", err);
        setConnections((prev) =>
          prev.filter((c) => c.peer !== connection.peer),
        );
      });
    },
    [handleMessage],
  );

  // Initialize Peer Object with retries
  const initializePeer = useCallback(
    async (idToUse?: string): Promise<Peer> => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 3;

        const tryInit = () => {
          attempts++;
          console.log(`[Peer] Initializing... Attempt ${attempts}`);

          const peerConfig = {
            debug: 0,
            config: {
              iceServers: [
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
              ],
            },
          };

          // If idToUse is provided, try to use it (Host wants a specific ID? Not really, mostly we use random IDs now,
          // UNLESS we want to restore an ID. But for this requirement, Host creates a NEW session => New Peer ID.
          // So idToUse might only be relevant if we wanted custom IDs.
          // Wait, requirement says: "host sessions is created with a unique session identifier".
          // It's easiest if Peer ID == Session ID.
          // So if I am Host, I might want to pass nothing (get random ID) and that becomes Session ID.

          const peer = idToUse
            ? new Peer(idToUse, peerConfig)
            : new Peer(peerConfig);

          peer.on("open", (id) => {
            console.log(`[Peer] Opened with ID: ${id}`);
            resolve(peer);
          });

          peer.on("error", (err) => {
            console.log(`[Peer] Error: ${err.type}`, err);
            if (
              err.type === "unavailable-id" ||
              err.type === "server-error" ||
              err.type === "socket-error" ||
              err.type === "browser-incompatible"
            ) {
              if (attempts < maxAttempts) {
                console.log("Retrying...");
                setTimeout(tryInit, 1000);
              } else {
                reject(err);
              }
            } else {
              // Fatal errors or un-retryable
              reject(err);
            }
          });
        };

        tryInit();
      });
    },
    [],
  );

  const startSession = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    setHostId(null); // I am Host

    try {
      const peer = await initializePeer(); // Get random ID
      peerRef.current = peer;
      setPeerId(peer.id);
      setStatus("connected");

      peer.on("connection", (conn) => {
        console.log("[Host] Incoming connection from", conn.peer);
        handleConnection(conn);
      });
    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Failed to create session. Please try again.");
      setStatus("error");
    }
  }, [initializePeer, handleConnection]);

  const joinSession = useCallback(
    async (targetHostId: string) => {
      setStatus("connecting");
      setError(null);
      setHostId(targetHostId);

      try {
        const peer = await initializePeer(); // Get random ID for myself
        peerRef.current = peer;
        setPeerId(peer.id);

        // Connect to Host
        console.log("[Guest] Connecting to Host:", targetHostId);
        const conn = peer.connect(targetHostId);

        conn.on("open", () => {
          console.log("[Guest] Connected to Host!");
          setStatus("connected");
          handleConnection(conn);

          // Immediate Sync Request
          conn.send({ type: "SYNC_REQUEST" });
        });

        // Handling connection immediate errors/close in handleConnection but need to be sure
      } catch (err) {
        console.error("Failed to join session:", err);
        setError(
          "Failed to join session. It may have ended or does not exist.",
        );
        setStatus("error");
      }
    },
    [initializePeer, handleConnection],
  );

  const stopSession = useCallback(() => {
    // If Host, broadcast termination then destroy
    if (!hostId && connectionsRef.current.length > 0) {
      connectionsRef.current.forEach((conn) => {
        if (conn.open) conn.send({ type: "SESSION_CLOSED" });
      });
    }
    destroyPeer();
  }, [hostId, destroyPeer]);

  const leaveSession = useCallback(() => {
    destroyPeer(); // Just kill my own peer, updates will propagate via close events
  }, [destroyPeer]);

  const broadcast = useCallback((msg: PeerMessage) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }, []);

  const sendUpdateEvaluation = useCallback(
    (evaluation: AssessorEvaluationState) => {
      broadcast({ type: "UPDATE_EVALUATION", payload: evaluation });
    },
    [broadcast],
  );

  const sendUpdateAssessment = useCallback(
    (assessment: Partial<AssessmentSessionState>) => {
      broadcast({ type: "UPDATE_ASSESSMENT", payload: assessment });
    },
    [broadcast],
  );

  return {
    peerId,
    status, // connected, disconnected, connecting, error
    error,
    isHost: !hostId && status === "connected",
    activePeers,
    startSession,
    joinSession,
    stopSession,
    leaveSession,
    sendUpdateEvaluation,
    sendUpdateAssessment,
  };
};
