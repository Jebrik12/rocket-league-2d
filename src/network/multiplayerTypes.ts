// --- MULTIPLAYER TYPES & NETWORKING PROTOCOL ---

export type GameMode = "1v1" | "2v2" | "3v3" | "freeplay";
export type Team = "blue" | "orange" | "spectator";
export type BotDifficulty = "rookie" | "pro" | "allstar" | "ssl" | "unfair";

export interface RoomSlot {
  id: string; // "slot_blue_0", "slot_orange_1", etc.
  team: Team;
  slotIndex: number; // 0, 1, 2
  isOccupied: boolean;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  playerName?: string;
  peerId?: string;
  carModel: string;
  isReady: boolean;
  ping: number;
}

export interface RoomSettings {
  mode: GameMode;
  arena: string;
  duration: number; // in seconds (e.g. 180, 300, 99999)
  fillBots: boolean;
  botDifficulty: BotDifficulty;
  physicsMode: "rocket_league" | "legacy";
}

export interface RoomState {
  roomCode: string;
  hostPeerId: string;
  status: "lobby" | "countdown" | "in_game" | "ended";
  countdownSec?: number;
  settings: RoomSettings;
  slots: RoomSlot[];
  spectators: {
    peerId: string;
    playerName: string;
    ping: number;
  }[];
}

export interface PlayerInputPayload {
  steerLeft: boolean;
  steerRight: boolean;
  throttleForward: boolean;
  throttleReverse: boolean;
  pitchUp: boolean;
  pitchDown: boolean;
  airRollLeft: boolean;
  airRollRight: boolean;
  jump: boolean;
  boost: boolean;
  handbrake: boolean;
  mouseAim: boolean;
  mouseTargetAngle?: number;
}

export interface CarSnapshot {
  id: string;
  name: string;
  team: string;
  isBot: boolean;
  carModel: string;
  hitboxClass: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  facing: number;
  airRollInverted: boolean;
  boost: number;
  isBoosting: boolean;
  isSupersonic: boolean;
  isGrounded: boolean;
  isFlipping: boolean;
  isDemoed: boolean;
  score: number;
  goals: number;
  saves: number;
  shots: number;
  demos: number;
}

export interface BallSnapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spin: number;
  touchEffectTimer?: number;
  lastTouchTeam?: string | null;
  lastTouchPlayer?: string | null;
}

export interface MatchSnapshot {
  time: number;
  matchTime: number;
  matchState: "kickoff" | "playing" | "goal_scored" | "goal_replay" | "ended";
  kickoffCountdown: number | null;
  isOvertime: boolean;
  blueScore: number;
  orangeScore: number;
  ball: BallSnapshot;
  cars: CarSnapshot[];
  boostPads: {
    id: number;
    active: boolean;
    cooldownTimer: number;
  }[];
  goalInfo?: {
    scorerName: string;
    scoringTeam: string;
    speedKmh: number;
  } | null;
  activeAlerts?: {
    id: string;
    type: string;
    text: string;
    player: string;
    team: string;
    color: string;
    speedKmh?: number;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  team: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

// Network Message Types between Host and Clients
export type NetMessage =
  | { type: "join_request"; playerName: string; carModel: string }
  | { type: "join_accepted"; roomState: RoomState; yourPeerId: string }
  | { type: "join_rejected"; reason: string }
  | { type: "room_state"; roomState: RoomState }
  | { type: "slot_change_request"; targetTeam: Team; targetSlotIndex: number }
  | { type: "car_change_request"; carModel: string }
  | { type: "name_change_request"; playerName: string }
  | { type: "ready_toggle" }
  | { type: "add_bot"; team: Team; slotIndex: number; difficulty: BotDifficulty }
  | { type: "remove_bot"; slotId: string }
  | { type: "update_settings"; settings: Partial<RoomSettings> }
  | { type: "start_countdown" }
  | { type: "start_game"; roomState: RoomState }
  | { type: "snapshot"; snapshot: MatchSnapshot }
  | { type: "client_input"; input: PlayerInputPayload; seq: number }
  | { type: "chat"; message: ChatMessage }
  | { type: "rematch" }
  | { type: "return_to_lobby" }
  | { type: "ping"; t: number }
  | { type: "pong"; t: number };
