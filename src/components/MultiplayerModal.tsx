import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Users,
  Bot,
  Play,
  LogOut,
  Share2,
  Crown,
  Shield,
  Swords,
  Sparkles,
  MessageSquare,
  Send,
  Loader2,
  Shuffle,
  Car,
  Layers,
  Clock,
  X
} from "lucide-react";
import {
  peerNetwork,
  NetworkRole
} from "../network/peerManager";
import {
  GameMode,
  Team,
  BotDifficulty,
  RoomState,
  ChatMessage
} from "../network/multiplayerTypes";

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: () => void;
  playerCarModel: string;
  onSelectCarModel: (model: string) => void;
  currentMap: string;
  onPlayerNameChange?: (name: string) => void;
}

const CAR_OPTIONS = [
  { id: "octane", name: "Octane", badge: "Gold Standard", color: "text-amber-400" },
  { id: "fennec", name: "Fennec", badge: "Solid Block", color: "text-sky-400" },
  { id: "dominus", name: "Dominus", badge: "Flat Aerofoil", color: "text-rose-400" },
  { id: "breakout", name: "Breakout", badge: "Acrobat Needle", color: "text-emerald-400" },
  { id: "merc", name: "Merc", badge: "Heavy Brawler", color: "text-purple-400" }
];

const MAP_OPTIONS = [
  { id: "standard", name: "DFH Stadium (Standard)", badge: "Classic", color: "text-sky-400" },
  { id: "colossus", name: "Colossus Stadium (Big)", badge: "40% Bigger", color: "text-emerald-400" },
  { id: "gargantuan", name: "Gargantuan Mega-Dome", badge: "80% Huge", color: "text-purple-400" },
  { id: "drop_pit", name: "Core Pit (Floor Net)", badge: "Net In Floor", color: "text-amber-400" },
  { id: "sky_vault", name: "Sky Vault (Ceiling Net)", badge: "Net In Ceil", color: "text-rose-400" },
  { id: "aerial_hoops", name: "Aerial Skyway (Elevated)", badge: "Elevated Nets", color: "text-cyan-400" }
];

const BOT_DIFFICULTIES: { id: BotDifficulty; name: string; badge: string; color: string }[] = [
  { id: "rookie", name: "Rookie", badge: "Easy", color: "text-emerald-400" },
  { id: "pro", name: "Pro", badge: "Medium", color: "text-amber-400" },
  { id: "allstar", name: "All-Star", badge: "Hard", color: "text-purple-400" },
  { id: "ssl", name: "SSL Terminator", badge: "🔥 Insane", color: "text-rose-400" },
  { id: "unfair", name: "Unfair Cheat Bot", badge: "💀 0ms", color: "text-red-400" }
];

function generateRandomRoomCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const nums = "23456789";
  let res = "RL-";
  for (let i = 0; i < 2; i++) res += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 2; i++) res += nums[Math.floor(Math.random() * nums.length)];
  return res;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  playerCarModel,
  onSelectCarModel,
  currentMap,
  onPlayerNameChange
}) => {
  // Local state
  const [activeTab, setActiveTab] = useState<"host" | "join">("host");
  const [playerName, setPlayerName] = useState(() => {
    try {
      return (localStorage.getItem("rl_player_name") || "Player").slice(0, 12);
    } catch (e) {
      return "Player";
    }
  });

  // Host settings state
  const [hostRoomCode, setHostRoomCode] = useState(generateRandomRoomCode);
  const [hostMode, setHostMode] = useState<GameMode>("1v1");
  const [hostArena, setHostArena] = useState(currentMap || "standard");
  const [hostDuration, setHostDuration] = useState(180);
  const [hostFillBots, setHostFillBots] = useState(true);
  const [hostBotDiff, setHostBotDiff] = useState<BotDifficulty>("ssl");
  const [hostPhysicsMode, setHostPhysicsMode] = useState<"rocket_league" | "legacy">(() => {
    try {
      const saved = localStorage.getItem("rl_physics_mode");
      return saved === "legacy" ? "legacy" : "rocket_league";
    } catch (e) {
      return "rocket_league";
    }
  });

  // Join settings state
  const [joinCode, setJoinCode] = useState("");

  // Connection & Room state from network manager
  const [networkRole, setNetworkRole] = useState<NetworkRole>("none");
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // In-lobby chat state
  const [lobbyChat, setLobbyChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Check URL params for room code on mount or when opened
  useEffect(() => {
    if (!isOpen) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room");
      if (roomParam && !roomState) {
        setJoinCode(roomParam.toUpperCase());
        setActiveTab("join");
      }
    } catch (e) {}
  }, [isOpen, roomState]);

  // Sync network state from peerNetwork singleton
  useEffect(() => {
    peerNetwork.onStateChanged = (state) => {
      setRoomState({ ...state });
      setNetworkRole(peerNetwork.role);
      setIsConnecting(false);
      setErrorMessage(null);
    };

    peerNetwork.onGameStart = () => {
      onStartMatch();
    };

    peerNetwork.onChatReceived = (msg) => {
      setLobbyChat((prev) => [...prev.slice(-40), msg]);
    };

    peerNetwork.onReturnToLobby = () => {
      // Room state updated
      if (peerNetwork.roomState) {
        setRoomState({ ...peerNetwork.roomState });
      }
    };

    peerNetwork.onStatusMessage = (msg) => {
      setErrorMessage(msg);
    };
  }, [onStartMatch]);

  // Scroll lobby chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [lobbyChat]);

  // Save player name and sync to network
  const handleNameChange = (newName: string) => {
    const trimmed = newName.slice(0, 12);
    setPlayerName(trimmed);
    try {
      localStorage.setItem("rl_player_name", trimmed);
    } catch (e) {}
    onPlayerNameChange?.(trimmed);
    if (peerNetwork.isConnected) {
      peerNetwork.updatePlayerName(trimmed);
    }
  };

  // Host room action
  const handleCreateHost = async () => {
    if (!hostRoomCode.trim()) return;
    setIsConnecting(true);
    setErrorMessage(null);

    const success = await peerNetwork.initHost(
      hostRoomCode.trim().toUpperCase(),
      playerName,
      playerCarModel,
      {
        mode: hostMode,
        arena: hostArena,
        duration: hostDuration,
        fillBots: hostFillBots,
        botDifficulty: hostBotDiff,
        physicsMode: hostPhysicsMode
      }
    );

    setIsConnecting(false);
    if (success) {
      setNetworkRole("host");
      setRoomState(peerNetwork.roomState);
      // Update browser URL query param seamlessly
      updateUrlParam(hostRoomCode.trim().toUpperCase());
    } else {
      setErrorMessage(peerNetwork.connectionError || "Failed to host room. Please try another code.");
    }
  };

  // Join room action
  const handleJoinRoom = async () => {
    let code = joinCode.trim();
    if (!code) return;

    // If user pasted a full URL, extract the ?room= or #room= parameter
    if (code.includes("room=")) {
      const match = code.match(/room=([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        code = match[1];
      }
    }

    setIsConnecting(true);
    setErrorMessage(null);

    const success = await peerNetwork.initClient(code.toUpperCase(), playerName, playerCarModel);
    setIsConnecting(false);

    if (success) {
      setNetworkRole("client");
      setRoomState(peerNetwork.roomState);
      updateUrlParam(code.toUpperCase());
    } else {
      setErrorMessage(peerNetwork.connectionError || "Could not connect to room. Verify host is active and code is correct.");
    }
  };

  const updateUrlParam = (code: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("room", code);
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  };

  const clearUrlParam = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("room");
      window.history.replaceState({}, "", url.toString());
    } catch (e) {}
  };

  const handleLeaveRoom = () => {
    peerNetwork.disconnect();
    setNetworkRole("none");
    setRoomState(null);
    setErrorMessage(null);
    clearUrlParam();
  };

  const handleCopyCode = () => {
    if (!roomState) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!roomState) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomState.roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !roomState) return;
    const mySlot = roomState.slots.find((s) => s.peerId === peerNetwork.myPeerId);
    const myTeam = mySlot ? mySlot.team : "spectator";
    peerNetwork.sendChat(chatInput.trim(), playerName, myTeam);
    setChatInput("");
  };

  if (!isOpen) return null;

  const isInRoom = !!roomState && networkRole !== "none";
  const isHost = networkRole === "host";
  const mySlot = roomState?.slots.find((s) => s.peerId === peerNetwork.myPeerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in text-slate-100">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-gaming font-black uppercase tracking-wider text-white flex items-center gap-2">
                Online Multiplayer
                {isInRoom && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                    🟢 {isHost ? "HOST" : "CONNECTED"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Peer-to-peer WebRTC car soccer • 1v1, 2v2, 3v3 & AI Bot filling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- MAIN CONTENT BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
          
          {/* Top Player Profile Bar (always visible) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/90">
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <span className="text-xs font-gaming font-bold uppercase text-slate-400">Pilot Name:</span>
              <input
                type="text"
                maxLength={12}
                value={playerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter pilot name..."
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-gaming font-bold text-white focus:outline-none focus:border-sky-400 transition w-44"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-gaming font-bold uppercase text-slate-400 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-amber-400" /> Car:
              </span>
              <div className="flex items-center gap-1">
                {CAR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCarModel(c.id);
                      if (isInRoom) peerNetwork.requestCarChange(c.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-gaming font-bold transition cursor-pointer ${
                      playerCarModel === c.id
                        ? "bg-sky-600 text-white shadow-md shadow-sky-500/25 border border-sky-400"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="px-4 py-3 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-300 text-xs flex items-center justify-between">
              <span>⚠️ {errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-400 hover:text-red-200 ml-2 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 1: NOT IN ROOM (Host or Join screens)               */}
          {/* ========================================================= */}
          {!isInRoom ? (
            <div className="flex flex-col gap-4">
              
              {/* Navigation Tabs */}
              <div className="flex rounded-2xl p-1 bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setActiveTab("host")}
                  className={`flex-1 py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "host"
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  Host a Room
                </button>
                <button
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 py-2.5 rounded-xl font-gaming font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === "join"
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Join with Code / Link
                </button>
              </div>

              {/* TAB 1: HOST SETTINGS */}
              {activeTab === "host" && (
                <div className="flex flex-col gap-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                  
                  {/* Game Mode */}
                  <div>
                    <label className="text-xs font-gaming font-bold uppercase text-slate-400 mb-2 block">
                      Select Match Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "1v1", name: "1 vs 1 Duel", desc: "1 Player Per Team" },
                        { id: "2v2", name: "2 vs 2 Doubles", desc: "2 Players Per Team" },
                        { id: "3v3", name: "3 vs 3 Standard", desc: "3 Players Per Team" }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setHostMode(m.id as GameMode)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            hostMode === m.id
                              ? "bg-sky-950/60 border-sky-400 text-sky-200 shadow-md shadow-sky-500/15"
                              : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <span className="font-gaming font-black text-sm text-white">{m.name}</span>
                          <span className="text-[11px] text-slate-400 mt-1">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Arena Map */}
                  <div>
                    <label className="text-xs font-gaming font-bold uppercase text-slate-400 mb-2 block flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Select Arena Pitch
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MAP_OPTIONS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setHostArena(m.id)}
                          className={`px-3 py-2 rounded-xl border text-left transition cursor-pointer text-xs font-gaming ${
                            hostArena === m.id
                              ? "bg-purple-950/60 border-purple-400 text-purple-200 shadow-sm"
                              : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="font-bold text-white truncate">{m.name}</div>
                          <span className={`text-[10px] ${m.color}`}>{m.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Match Duration & Bot Fill */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Duration */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-gaming font-bold uppercase text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Match Time:
                      </span>
                      <div className="flex gap-1">
                        {[
                          { sec: 180, label: "3m" },
                          { sec: 300, label: "5m" },
                          { sec: 99999, label: "Unlimited" }
                        ].map((d) => (
                          <button
                            key={d.sec}
                            type="button"
                            onClick={() => setHostDuration(d.sec)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-gaming font-bold transition cursor-pointer ${
                              hostDuration === d.sec
                                ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                                : "bg-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-Fill Bots Toggle */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-gaming font-bold uppercase text-slate-300 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-emerald-400" /> Auto-Fill Empty Slots:
                        </span>
                        <span className="text-[10px] text-slate-400">Spawn AI bots for missing players</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={hostFillBots}
                        onChange={(e) => setHostFillBots(e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Bot Difficulty Selector if Fill Bots is checked */}
                  {hostFillBots && (
                    <div>
                      <label className="text-xs font-gaming font-bold uppercase text-slate-400 mb-1.5 block">
                        AI Bot Difficulty (When Filled)
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {BOT_DIFFICULTIES.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setHostBotDiff(d.id)}
                            className={`px-2.5 py-1 rounded-xl border text-xs font-gaming transition cursor-pointer flex items-center gap-1 ${
                              hostBotDiff === d.id
                                ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 font-black shadow-sm"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span>{d.name}</span>
                            <span className="text-[10px] opacity-75">({d.badge})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physics Mode Selector */}
                  <div>
                    <label className="text-xs font-gaming font-bold uppercase text-slate-400 mb-1.5 block flex items-center gap-1.5">
                      Match Physics Preset
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        {
                          id: "rocket_league" as const,
                          name: "Rocket League Pro",
                          badge: "Authentic & Flicks",
                          color: "text-sky-400",
                          desc: "Authentic 720 gravity, ground dribble carry & 45°/Musty flicks"
                        },
                        {
                          id: "legacy" as const,
                          name: "Classic / Arcade",
                          badge: "Arcade & Pinches",
                          color: "text-amber-400",
                          desc: "Original high bounce turf, 1250 boost & extreme bumper pop launches"
                        }
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setHostPhysicsMode(p.id)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            hostPhysicsMode === p.id
                              ? "bg-sky-950/60 border-sky-400 text-sky-200 shadow-sm ring-1 ring-sky-400/30"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-gaming font-black text-xs text-white">{p.name}</span>
                            <span className={`text-[10px] font-mono font-bold ${p.color}`}>{p.badge}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 leading-snug">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Code */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700">
                      <span className="text-xs font-gaming font-bold uppercase text-slate-500">Room Code:</span>
                      <input
                        type="text"
                        maxLength={10}
                        value={hostRoomCode}
                        onChange={(e) => setHostRoomCode(e.target.value.toUpperCase())}
                        className="bg-transparent font-mono font-black text-amber-400 tracking-wider text-base focus:outline-none w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setHostRoomCode(generateRandomRoomCode())}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Randomize Code"
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Host Button */}
                  <button
                    type="button"
                    onClick={handleCreateHost}
                    disabled={isConnecting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-gaming font-black text-sm uppercase tracking-wider shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Host Room...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Create & Host Match Room</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: JOIN WITH CODE */}
              {activeTab === "join" && (
                <div className="flex flex-col gap-4 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                  <div className="text-center py-2">
                    <h3 className="font-gaming font-black text-lg text-white uppercase tracking-wide">
                      Connect to a Friend's Match
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Enter the room code (e.g. <span className="font-mono text-amber-400 font-bold">RL-AB12</span>) or paste the full invite link sent by the host.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                      placeholder="ENTER ROOM CODE OR PASTE LINK..."
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 focus:border-sky-400 text-center font-mono font-black text-lg text-white tracking-widest uppercase focus:outline-none transition shadow-inner"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleJoinRoom}
                    disabled={!joinCode.trim() || isConnecting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-gaming font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting to Host...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4" />
                        <span>Join Match Room</span>
                      </>
                    )}
                  </button>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                    💡 <strong className="text-slate-200">Zero Server Lag:</strong>Rocket League 2D uses direct browser WebRTC channels. You connect straight to the host for instantaneous response and authentic physics.
                  </div>
                </div>
              )}

            </div>
          ) : (
            // =========================================================
            // VIEW 2: ACTIVE ROOM LOBBY
            // =========================================================
            <div className="flex flex-col gap-4">
              
              {/* Room Banner with Shareable Link and Code */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-gaming font-bold uppercase text-slate-400 block tracking-widest">
                      ROOM CODE:
                    </span>
                    <span className="font-mono font-black text-2xl sm:text-3xl text-amber-400 tracking-wider">
                      {roomState.roomCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-gaming font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? "Copied Code!" : "Copy Code"}</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 rounded-xl bg-sky-600/25 hover:bg-sky-600/35 text-sky-300 hover:text-white text-xs font-gaming font-bold flex items-center gap-1.5 transition cursor-pointer border border-sky-500/40 shadow-sm"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Invite Link"}</span>
                  </button>
                </div>
              </div>

              {/* Match Setting Summary Tag Bar */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-gaming">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  Mode: <strong className="text-sky-400">{roomState.settings.mode.toUpperCase()}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  Arena: <strong className="text-purple-400">{roomState.settings.arena}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                  Bots: <strong className={roomState.settings.fillBots ? "text-emerald-400" : "text-slate-500"}>
                    {roomState.settings.fillBots ? `Auto-Fill (${roomState.settings.botDifficulty.toUpperCase()})` : "Off"}
                  </strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold flex items-center gap-1.5">
                  Physics: <strong className="text-amber-400">{roomState.settings.physicsMode === "legacy" ? "Classic" : "Rocket League"}</strong>
                  {isHost && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = roomState.settings.physicsMode === "legacy" ? "rocket_league" : "legacy";
                        peerNetwork.updatePhysicsMode(next);
                      }}
                      className="text-[10px] text-sky-400 hover:text-sky-300 underline font-normal cursor-pointer ml-1"
                      title="Toggle physics mode for this match"
                    >
                      (Change)
                    </button>
                  )}
                </span>
              </div>

              {/* TEAM LINEUPS BOARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* --- BLUE TEAM --- */}
                <div className="flex flex-col rounded-2xl bg-sky-950/20 border border-sky-500/30 overflow-hidden shadow-lg">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between">
                    <span className="font-gaming font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Blue Team
                    </span>
                    <span className="text-xs font-mono font-bold bg-black/30 px-2 py-0.5 rounded">
                      {roomState.slots.filter((s) => s.team === "blue" && s.isOccupied).length} / {roomState.slots.filter((s) => s.team === "blue").length}
                    </span>
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    {roomState.slots
                      .filter((s) => s.team === "blue")
                      .map((slot) => {
                        const isMe = slot.peerId === peerNetwork.myPeerId;
                        return (
                          <div
                            key={slot.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                              slot.isOccupied
                                ? isMe
                                  ? "bg-sky-900/40 border-sky-400/80 shadow-md"
                                  : "bg-slate-900/80 border-slate-700"
                                : "bg-slate-950/40 border-dashed border-slate-800"
                            }`}
                          >
                            {slot.isOccupied ? (
                              <>
                                <div className="flex items-center gap-2 min-w-0">
                                  {slot.isBot ? (
                                    <Bot className="w-4 h-4 text-sky-400 shrink-0" />
                                  ) : (
                                    <Car className="w-4 h-4 text-sky-400 shrink-0" />
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-gaming font-bold text-xs text-white truncate flex items-center gap-1">
                                      {slot.playerName}
                                      {isMe && <span className="text-[10px] text-sky-400 font-normal">(You)</span>}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {slot.isBot
                                        ? `AI Bot • ${slot.botDifficulty?.toUpperCase()}`
                                        : slot.pilotMode === "bot"
                                        ? `🤖 Personal Bot • ${slot.carModel.toUpperCase()}`
                                        : `🎮 Human • ${slot.carModel.toUpperCase()}`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                  {!slot.isBot && (isMe || isHost) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const next = slot.pilotMode === "bot" ? "human" : "bot";
                                        peerNetwork.requestPilotModeChange(next, slot.id);
                                      }}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-gaming font-black uppercase transition cursor-pointer flex items-center gap-1 border ${
                                        slot.pilotMode === "bot"
                                          ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm"
                                          : "bg-sky-500/20 border-sky-500/50 text-sky-300 hover:bg-sky-500/30"
                                      }`}
                                      title="Toggle between playing directly as Human or deploying your personal AI Bot"
                                    >
                                      {slot.pilotMode === "bot" ? (
                                        <>
                                          <Bot className="w-3 h-3 text-amber-400" />
                                          <span>My Bot</span>
                                        </>
                                      ) : (
                                        <>
                                          <Car className="w-3 h-3 text-sky-400" />
                                          <span>Human</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                  {!slot.isBot && slot.ping > 0 && (
                                    <span className="text-[10px] font-mono text-emerald-400">
                                      {slot.ping}ms
                                    </span>
                                  )}
                                  {slot.isReady ? (
                                    <span className="text-[10px] font-gaming font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      READY
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-gaming font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                      WAITING
                                    </span>
                                  )}
                                  {isHost && slot.isBot && (
                                    <button
                                      onClick={() => peerNetwork.removeBot(slot.id)}
                                      className="p-1 rounded hover:bg-rose-950 text-rose-400 text-xs transition cursor-pointer"
                                      title="Remove Bot"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs text-slate-500 italic font-gaming">Open Slot</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => peerNetwork.requestSlotChange("blue", slot.slotIndex)}
                                    className="px-2.5 py-1 rounded-lg bg-sky-600/40 hover:bg-sky-600 text-sky-200 hover:text-white text-xs font-gaming font-bold transition cursor-pointer"
                                  >
                                    Join Blue
                                  </button>
                                  {isHost && (
                                    <button
                                      onClick={() => peerNetwork.addBot("blue", slot.slotIndex, roomState.settings.botDifficulty)}
                                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-gaming flex items-center gap-1 transition cursor-pointer"
                                      title="Fill with Bot"
                                    >
                                      <Bot className="w-3 h-3 text-emerald-400" />
                                      <span>+ Bot</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* --- ORANGE TEAM --- */}
                <div className="flex flex-col rounded-2xl bg-orange-950/20 border border-orange-500/30 overflow-hidden shadow-lg">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white flex items-center justify-between">
                    <span className="font-gaming font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                      <Swords className="w-4 h-4" /> Orange Team
                    </span>
                    <span className="text-xs font-mono font-bold bg-black/30 px-2 py-0.5 rounded">
                      {roomState.slots.filter((s) => s.team === "orange" && s.isOccupied).length} / {roomState.slots.filter((s) => s.team === "orange").length}
                    </span>
                  </div>

                  <div className="p-3 flex flex-col gap-2">
                    {roomState.slots
                      .filter((s) => s.team === "orange")
                      .map((slot) => {
                        const isMe = slot.peerId === peerNetwork.myPeerId;
                        return (
                          <div
                            key={slot.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                              slot.isOccupied
                                ? isMe
                                  ? "bg-orange-900/40 border-orange-400/80 shadow-md"
                                  : "bg-slate-900/80 border-slate-700"
                                : "bg-slate-950/40 border-dashed border-slate-800"
                            }`}
                          >
                            {slot.isOccupied ? (
                              <>
                                <div className="flex items-center gap-2 min-w-0">
                                  {slot.isBot ? (
                                    <Bot className="w-4 h-4 text-orange-400 shrink-0" />
                                  ) : (
                                    <Car className="w-4 h-4 text-orange-400 shrink-0" />
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-gaming font-bold text-xs text-white truncate flex items-center gap-1">
                                      {slot.playerName}
                                      {isMe && <span className="text-[10px] text-orange-400 font-normal">(You)</span>}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {slot.isBot
                                        ? `AI Bot • ${slot.botDifficulty?.toUpperCase()}`
                                        : slot.pilotMode === "bot"
                                        ? `🤖 Personal Bot • ${slot.carModel.toUpperCase()}`
                                        : `🎮 Human • ${slot.carModel.toUpperCase()}`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                  {!slot.isBot && (isMe || isHost) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const next = slot.pilotMode === "bot" ? "human" : "bot";
                                        peerNetwork.requestPilotModeChange(next, slot.id);
                                      }}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-gaming font-black uppercase transition cursor-pointer flex items-center gap-1 border ${
                                        slot.pilotMode === "bot"
                                          ? "bg-amber-500/25 border-amber-500/60 text-amber-300 shadow-sm"
                                          : "bg-orange-500/20 border-orange-500/50 text-orange-300 hover:bg-orange-500/30"
                                      }`}
                                      title="Toggle between playing directly as Human or deploying your personal AI Bot"
                                    >
                                      {slot.pilotMode === "bot" ? (
                                        <>
                                          <Bot className="w-3 h-3 text-amber-400" />
                                          <span>My Bot</span>
                                        </>
                                      ) : (
                                        <>
                                          <Car className="w-3 h-3 text-orange-400" />
                                          <span>Human</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                  {!slot.isBot && slot.ping > 0 && (
                                    <span className="text-[10px] font-mono text-emerald-400">
                                      {slot.ping}ms
                                    </span>
                                  )}
                                  {slot.isReady ? (
                                    <span className="text-[10px] font-gaming font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                      READY
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-gaming font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                      WAITING
                                    </span>
                                  )}
                                  {isHost && slot.isBot && (
                                    <button
                                      onClick={() => peerNetwork.removeBot(slot.id)}
                                      className="p-1 rounded hover:bg-rose-950 text-rose-400 text-xs transition cursor-pointer"
                                      title="Remove Bot"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs text-slate-500 italic font-gaming">Open Slot</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => peerNetwork.requestSlotChange("orange", slot.slotIndex)}
                                    className="px-2.5 py-1 rounded-lg bg-orange-600/40 hover:bg-orange-600 text-orange-200 hover:text-white text-xs font-gaming font-bold transition cursor-pointer"
                                  >
                                    Join Orange
                                  </button>
                                  {isHost && (
                                    <button
                                      onClick={() => peerNetwork.addBot("orange", slot.slotIndex, roomState.settings.botDifficulty)}
                                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-gaming flex items-center gap-1 transition cursor-pointer"
                                      title="Fill with Bot"
                                    >
                                      <Bot className="w-3 h-3 text-emerald-400" />
                                      <span>+ Bot</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>

              {/* IN-LOBBY LIVE CHAT */}
              <div className="flex flex-col rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                <div className="px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] font-gaming font-bold text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-sky-400" />
                  <span>Lobby Chat</span>
                </div>
                <div
                  ref={chatScrollRef}
                  className="h-28 overflow-y-auto p-2.5 flex flex-col gap-1 text-xs font-sans"
                >
                  {lobbyChat.length === 0 ? (
                    <span className="text-slate-600 italic text-[11px]">Chat with other players here before kickoff...</span>
                  ) : (
                    lobbyChat.map((m) => (
                      <div key={m.id} className="flex items-baseline gap-1.5">
                        <span
                          className={`font-gaming font-bold text-[11px] ${
                            m.isSystem
                              ? "text-amber-400"
                              : m.team === "blue"
                              ? "text-sky-400"
                              : m.team === "orange"
                              ? "text-orange-400"
                              : "text-slate-400"
                          }`}
                        >
                          {m.sender}:
                        </span>
                        <span className="text-slate-200">{m.text}</span>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendChat} className="flex border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-1.5 bg-transparent text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-sky-400 hover:text-sky-300 font-bold text-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* BOTTOM LOBBY ACTION BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-gaming font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Leave Room</span>
                </button>

                <div className="flex items-center gap-3">
                  {!isHost && (
                    <button
                      type="button"
                      onClick={() => peerNetwork.toggleReady()}
                      className={`px-5 py-2.5 rounded-xl text-xs font-gaming font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                        mySlot?.isReady
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{mySlot?.isReady ? "Ready!" : "Ready Up"}</span>
                    </button>
                  )}

                  {isHost && (
                    <button
                      type="button"
                      onClick={() => {
                        peerNetwork.startGame();
                        onStartMatch();
                      }}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-gaming font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer animate-pulse-slow"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Match</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
