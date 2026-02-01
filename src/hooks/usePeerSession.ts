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
    };

interface UsePeerSessionProps {
  sessionId: string;
  assessorName: string;
  currentAssessment?: AssessmentSessionState;
  currentEvaluations?: AssessorEvaluationState[];
  onSyncReceived: (
    assessment: AssessmentSessionState,
    evaluations: AssessorEvaluationState[],
  ) => void;
  onEvaluationReceived: (evaluation: AssessorEvaluationState) => void;
  onAssessmentUpdateReceived: (update: Partial<AssessmentSessionState>) => void;
}

export const usePeerSession = ({
  sessionId,
  assessorName,
  currentAssessment,
  currentEvaluations,
  onSyncReceived,
  onEvaluationReceived,
  onAssessmentUpdateReceived,
}: UsePeerSessionProps) => {
  const [peerId, setPeerId] = useState<string>("");
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [activePeers, setActivePeers] = useState<
    { id: string; name: string }[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<Peer | null>(null);

  // Use refs for current state to avoid dependency loops in callbacks
  const stateRef = useRef({
    currentAssessment,
    currentEvaluations,
    assessorName,
    onSyncReceived,
    onEvaluationReceived,
    onAssessmentUpdateReceived,
  });

  useEffect(() => {
    stateRef.current = {
      currentAssessment,
      currentEvaluations,
      assessorName,
      onSyncReceived,
      onEvaluationReceived,
      onAssessmentUpdateReceived,
    };
  }, [
    currentAssessment,
    currentEvaluations,
    onSyncReceived,
    onEvaluationReceived,
    onAssessmentUpdateReceived,
    assessorName,
  ]);

  const handleMessage = useCallback(
    (message: PeerMessage, senderConnection: DataConnection) => {
      switch (message.type) {
        case "SYNC_REQUEST":
          if (
            stateRef.current.currentAssessment &&
            stateRef.current.currentEvaluations
          ) {
            senderConnection.send({
              type: "SYNC_RESPONSE",
              payload: {
                assessment: stateRef.current.currentAssessment,
                evaluations: stateRef.current.currentEvaluations,
              },
            });
          }
          break;

        case "SYNC_RESPONSE":
          stateRef.current.onSyncReceived(
            message.payload.assessment,
            message.payload.evaluations,
          );
          break;

        case "UPDATE_EVALUATION":
          stateRef.current.onEvaluationReceived(message.payload);
          break;

        case "UPDATE_ASSESSMENT":
          stateRef.current.onAssessmentUpdateReceived(message.payload);
          break;

        case "HELLO":
          console.log("Peer says HELLO:", message.payload);
          setActivePeers((prev) => {
            const exists = prev.some((p) => p.id === message.payload.peerId);
            if (exists) return prev;
            const newPeers = [
              ...prev,
              { id: message.payload.peerId, name: message.payload.nametag },
            ];
            // Broadcast new peer list to everyone
            // We need to include OURSELVES (Host) in the list we send to others?
            // Actually, we should broadcast the FULL list of "Everyone in session".
            // That is: Me (Host) + All Guests (prev + new).
            // But we can't access 'broadcast' here easily due to closure?
            // 'broadcast' depends on 'connections'. 'connections' is state.
            // We can use 'connections' from ref? No ref for connections.
            // But 'handleMessage' is re-created if deps change? Currently [].

            // We need to trigger broadcast via useEffect or ref.
            // Simplified: Just update state here.
            // Add a useEffect that listens to 'activePeers' changes?
            // If I am Host (how do I know? 'peerId === sessionId' or I have incoming connections?), broadcast.
            // Better: 'handleMessage' can call a helper?
            return newPeers;
          });
          break;

        case "UPDATE_PEERS":
          // I am a guest receiving the full list
          // Filter out myself?
          setActivePeers(
            message.payload.filter((p) => p.id !== peerRef.current?.id),
          );
          break;
      }
    },
    [],
  );

  // Broadcast peers when activePeers changes (only if Host)
  useEffect(() => {
    // Basic check: If we have connections and we are the host (peerId === sessionId or we decided we are host?),
    // Or simpler: If we have any connections, share the knowledge?
    // In Star topology, only Host broadcasts.
    // If we are Guest, we receive UPDATE_PEERS. We shouldn't echo it back?
    // We need to know if we are Host.
    // heuristic: if sessionId provided and we claimed it?
    // Or simply: If I have active peers, I share them with everyone I know?
    // If Guest A knows Host. Guest A sends list to Host? No.
    // Host sends to Guests.

    // Let's assume only Host broadcasts.
    // Host ID matches sessionId.
    if (peerId && sessionId && peerId === sessionId) {
      const fullList = [
        { id: peerId, name: assessorName }, // Me (using prop)
        ...activePeers,
      ];

      connections.forEach((conn) => {
        if (conn.open) {
          conn.send({ type: "UPDATE_PEERS", payload: fullList });
        }
      });
    }
  }, [activePeers, connections, peerId, sessionId, assessorName]);

  const handleConnection = useCallback(
    (connection: DataConnection) => {
      connection.on("open", () => {
        console.log("Connection opened with:", connection.peer);
        setConnections((prev) => [...prev, connection]);
        setIsConnected(true);

        // Say Hello
        connection.send({
          type: "HELLO",
          payload: {
            peerId: peerRef.current?.id || "",
            nametag: stateRef.current.assessorName,
          },
        });
      });

      connection.on("data", (data: unknown) => {
        const message = data as PeerMessage;
        console.log("Received message:", message.type);
        handleMessage(message, connection);
      });

      connection.on("close", () => {
        console.log("Connection closed:", connection.peer);
        setConnections((prev) =>
          prev.filter((c) => c.peer !== connection.peer),
        );
        setActivePeers((prev) => prev.filter((p) => p.id !== connection.peer));
      });
    },
    [handleMessage],
  );

  const connectToHost = useCallback(
    (hostId: string) => {
      if (!peerRef.current) return;

      console.log("Connecting to host:", hostId);
      const connection = peerRef.current.connect(hostId);
      handleConnection(connection);

      // Request initial sync once connected
      connection.on("open", () => {
        connection.send({ type: "SYNC_REQUEST" });
      });
    },
    [handleConnection],
  );

  // Initialize Peer
  useEffect(() => {
    const initializePeer = (forceRandomId: boolean) => {
      // If we already have a peer instance, don't create another unless we are retrying
      if (peerRef.current && !peerRef.current.destroyed && !forceRandomId) {
        return;
      }

      const peerConfig = {
        debug: 2,
        config: {
          iceServers: [
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
        },
      };
      const peer = forceRandomId
        ? new Peer(peerConfig)
        : new Peer(sessionId, peerConfig);

      peerRef.current = peer;

      peer.on("open", (peerId) => {
        console.log("My Peer ID is: " + peerId);
        setPeerId(peerId);

        // If our ID is NOT the session ID, we are a guest. Connect to the session host.
        if (peerId !== sessionId) {
          console.log("I am a GUEST. connecting to Host:", sessionId);
          connectToHost(sessionId);
        } else {
          console.log("I am the HOST (" + peerId + ")");
        }
      });

      peer.on("connection", (connection) => {
        console.log("Incoming connection from:", connection.peer);
        handleConnection(connection);
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
        if (error.type === "unavailable-id") {
          console.log("Session ID taken. Switch to Guest mode.");
          // Destroy invalid peer and retry with random ID
          peer.destroy();
          initializePeer(true);
        }
      });
    };

    // Start initialization (try to be Host first)
    // We strictly use the passed sessionId.
    if (sessionId) {
      initializePeer(false);
    }

    return () => {
      peerRef.current?.destroy();
    };
  }, [sessionId, connectToHost, handleConnection]);

  const broadcast = useCallback(
    (msg: PeerMessage) => {
      connections.forEach((conn) => {
        if (conn.open) {
          conn.send(msg);
        }
      });
    },
    [connections],
  );

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
    isConnected,
    connectionsCount: connections.length,
    activePeers,
    sendUpdateEvaluation,
    sendUpdateAssessment,
  };
};
