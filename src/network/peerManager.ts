import { Peer, DataConnection } from "peerjs";
import {
  GameMode,
  Team,
  BotDifficulty,
  RoomSlot,
  RoomSettings,
  RoomState,
  PlayerInputPayload,
  MatchSnapshot,
  ChatMessage,
  NetMessage
} from "./multiplayerTypes";

const PEER_ID_PREFIX = "rl2d-v1-";

const BOT_MEME_NAMES = [
  "🤖 Boomer",
  "🤖 Apex",
  "🤖 Turbo",
  "🤖 Matrix",
  "🤖 Viper",
  "🤖 Phantom",
  "🤖 Sonic",
  "🤖 Dynamo",
  "🤖 Nitro",
  "🤖 Sparky"
];

function sanitizeCode(code: string): string {
  return code.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
}

function createSlotsForMode(mode: GameMode, botDifficulty: BotDifficulty = "ssl"): RoomSlot[] {
  const slots: RoomSlot[] = [];
  const perTeam = mode === "1v1" ? 1 : mode === "2v2" ? 2 : 3;

  for (let i = 0; i < perTeam; i++) {
    slots.push({
      id: `slot_blue_${i}`,
      team: "blue",
      slotIndex: i,
      isOccupied: false,
      isBot: false,
      botDifficulty,
      playerName: undefined,
      peerId: undefined,
      carModel: "octane",
      isReady: false,
      ping: 0
    });
  }

  for (let i = 0; i < perTeam; i++) {
    slots.push({
      id: `slot_orange_${i}`,
      team: "orange",
      slotIndex: i,
      isOccupied: false,
      isBot: false,
      botDifficulty,
      playerName: undefined,
      peerId: undefined,
      carModel: "octane",
      pilotMode: "human",
      isReady: false,
      ping: 0
    });
  }

  return slots;
}

export type NetworkRole = "none" | "host" | "client";

export class PeerNetworkManager {
  public role: NetworkRole = "none";
  public myPeerId: string | null = null;
  public roomState: RoomState | null = null;
  public isConnected: boolean = false;
  public connectionError: string | null = null;
  public localPing: number = 0;

  private peer: Peer | null = null;
  private hostConn: DataConnection | null = null;
  private clientConns: Map<string, DataConnection> = new Map();
  private pingInterval: any = null;
  private lastPingSentTime: number = 0;
  private inputSeq: number = 0;

  // Callbacks
  public onStateChanged?: (state: RoomState) => void;
  public onGameStart?: (state: RoomState) => void;
  public onSnapshotReceived?: (snapshot: MatchSnapshot) => void;
  public onChatReceived?: (chat: ChatMessage) => void;
  public onRemoteInput?: (peerId: string, input: PlayerInputPayload) => void;
  public onReturnToLobby?: () => void;
  public onRematch?: () => void;
  public onStatusMessage?: (msg: string) => void;

  // --- HOST INITIALIZATION ---
  public async initHost(
    roomCode: string,
    playerName: string,
    carModel: string = "octane",
    initialSettings?: Partial<RoomSettings>
  ): Promise<boolean> {
    this.disconnect();
    this.role = "host";
    const cleanCode = sanitizeCode(roomCode);
    const targetPeerId = `${PEER_ID_PREFIX}${cleanCode}`;

    const settings: RoomSettings = {
      mode: initialSettings?.mode || "1v1",
      arena: initialSettings?.arena || "standard",
      duration: initialSettings?.duration || 180,
      fillBots: initialSettings?.fillBots ?? true,
      botDifficulty: initialSettings?.botDifficulty || "ssl",
      physicsMode: initialSettings?.physicsMode || "legacy"
    };

    const slots = createSlotsForMode(settings.mode, settings.botDifficulty);
    // Assign host to Blue Slot 0
    slots[0].isOccupied = true;
    slots[0].playerName = playerName || "Host";
    slots[0].peerId = targetPeerId;
    slots[0].carModel = carModel || "octane";
    slots[0].pilotMode = "human";
    slots[0].isReady = true;

    this.roomState = {
      roomCode: roomCode.toUpperCase(),
      hostPeerId: targetPeerId,
      status: "lobby",
      settings,
      slots,
      spectators: []
    };

    return new Promise((resolve) => {
      try {
        const p = new Peer(targetPeerId, {
          debug: 1,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              { urls: "stun:stun2.l.google.com:19302" }
            ]
          }
        });

        p.on("open", (id) => {
          this.peer = p;
          this.myPeerId = id;
          this.isConnected = true;
          this.connectionError = null;
          this.startHostPingLoop();
          if (this.onStateChanged && this.roomState) {
            this.onStateChanged(this.roomState);
          }
          resolve(true);
        });

        p.on("connection", (conn) => {
          this.handleIncomingClientConnection(conn);
        });

        p.on("error", (err) => {
          console.warn("[PeerHost Error]", err);
          if (err.type === "unavailable-id") {
            this.connectionError = `Room "${roomCode.toUpperCase()}" is already in use or active. Please try another code!`;
          } else {
            this.connectionError = err.message || "Network error occurred.";
          }
          resolve(false);
        });
      } catch (err: any) {
        this.connectionError = err.message || "Failed to initialize host.";
        resolve(false);
      }
    });
  }

  // --- CLIENT INITIALIZATION ---
  public async initClient(
    roomCode: string,
    playerName: string,
    carModel: string = "octane"
  ): Promise<boolean> {
    this.disconnect();
    this.role = "client";
    const cleanCode = sanitizeCode(roomCode);
    const targetHostPeerId = `${PEER_ID_PREFIX}${cleanCode}`;

    return new Promise((resolve) => {
      try {
        const p = new Peer({
          debug: 1,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" }
            ]
          }
        });

        p.on("open", (myId) => {
          this.peer = p;
          this.myPeerId = myId;

          const conn = p.connect(targetHostPeerId, {
            reliable: true
          });

          conn.on("open", () => {
            this.hostConn = conn;
            this.isConnected = true;
            this.connectionError = null;

            // Send join request
            const joinMsg: NetMessage = {
              type: "join_request",
              playerName: playerName || "Player",
              carModel: carModel || "octane"
            };
            conn.send(joinMsg);

            this.setupClientConnListeners(conn);
            resolve(true);
          });

          conn.on("error", (err) => {
            console.warn("[PeerClient Conn Error]", err);
            this.connectionError = "Unable to connect to host room. Ensure code is correct and host is active.";
            resolve(false);
          });

          conn.on("close", () => {
            this.isConnected = false;
            this.connectionError = "Disconnected from host.";
            if (this.onStatusMessage) {
              this.onStatusMessage("Host closed the room or lost connection.");
            }
          });
        });

        p.on("error", (err) => {
          console.warn("[PeerClient Error]", err);
          this.connectionError = "Could not reach signaling server: " + (err.message || err.type);
          resolve(false);
        });
      } catch (err: any) {
        this.connectionError = err.message || "Failed to initialize client.";
        resolve(false);
      }
    });
  }

  // --- HOST CLIENT CONNECTION HANDLER ---
  private handleIncomingClientConnection(conn: DataConnection) {
    const peerId = conn.peer;

    conn.on("open", () => {
      this.clientConns.set(peerId, conn);
    });

    conn.on("data", (data: any) => {
      this.handleMessageFromClient(peerId, data as NetMessage);
    });

    conn.on("close", () => {
      this.handleClientDisconnect(peerId);
    });

    conn.on("error", () => {
      this.handleClientDisconnect(peerId);
    });
  }

  private handleMessageFromClient(peerId: string, msg: NetMessage) {
    if (!this.roomState) return;

    switch (msg.type) {
      case "join_request": {
        // Find an open slot for client (prefer Orange first to balance teams, then Blue)
        const orangeSlots = this.roomState.slots.filter((s) => s.team === "orange");
        const blueSlots = this.roomState.slots.filter((s) => s.team === "blue");

        let targetSlot = orangeSlots.find((s) => !s.isOccupied && !s.isBot);
        if (!targetSlot) {
          targetSlot = blueSlots.find((s) => !s.isOccupied && !s.isBot);
        }

        if (targetSlot) {
          targetSlot.isOccupied = true;
          targetSlot.isBot = false;
          targetSlot.peerId = peerId;
          targetSlot.playerName = msg.playerName || "Challenger";
          targetSlot.carModel = msg.carModel || "octane";
          targetSlot.isReady = false;
        } else {
          // Add as spectator
          this.roomState.spectators.push({
            peerId,
            playerName: msg.playerName || "Spectator",
            ping: 0
          });
        }

        const acceptMsg: NetMessage = {
          type: "join_accepted",
          roomState: this.roomState,
          yourPeerId: peerId
        };
        const conn = this.clientConns.get(peerId);
        if (conn && conn.open) {
          conn.send(acceptMsg);
        }

        // Broadcast updated room state to everyone
        this.broadcastRoomState();

        this.broadcastChat({
          id: `sys_${Date.now()}`,
          sender: "SYSTEM",
          team: "system",
          text: `👋 ${msg.playerName || "A player"} joined the room!`,
          timestamp: Date.now(),
          isSystem: true
        });
        break;
      }

      case "slot_change_request": {
        const currentSlot = this.roomState.slots.find((s) => s.peerId === peerId);
        const targetSlot = this.roomState.slots.find(
          (s) => s.team === msg.targetTeam && s.slotIndex === msg.targetSlotIndex
        );

        if (targetSlot && !targetSlot.isOccupied && !targetSlot.isBot) {
          if (currentSlot) {
            currentSlot.isOccupied = false;
            currentSlot.peerId = undefined;
            currentSlot.playerName = undefined;
            currentSlot.isReady = false;
          }

          targetSlot.isOccupied = true;
          targetSlot.isBot = false;
          targetSlot.peerId = peerId;
          targetSlot.playerName = currentSlot?.playerName || "Player";
          targetSlot.carModel = currentSlot?.carModel || "octane";
          targetSlot.isReady = false;

          // Remove from spectator if was one
          this.roomState.spectators = this.roomState.spectators.filter((sp) => sp.peerId !== peerId);

          this.broadcastRoomState();
        }
        break;
      }

      case "car_change_request": {
        const slot = this.roomState.slots.find((s) => s.peerId === peerId);
        if (slot) {
          slot.carModel = msg.carModel;
          this.broadcastRoomState();
        }
        break;
      }

      case "pilot_mode_request": {
        const slot = this.roomState.slots.find((s) => s.peerId === peerId);
        if (slot) {
          slot.pilotMode = msg.pilotMode;
          this.broadcastRoomState();
        }
        break;
      }

      case "name_change_request": {
        const slot = this.roomState.slots.find((s) => s.peerId === peerId);
        if (slot) {
          slot.playerName = msg.playerName.trim().slice(0, 16) || "Player";
          this.broadcastRoomState();
        } else {
          const spec = this.roomState.spectators.find((s) => s.peerId === peerId);
          if (spec) {
            spec.playerName = msg.playerName.trim().slice(0, 16) || "Player";
            this.broadcastRoomState();
          }
        }
        break;
      }

      case "ready_toggle": {
        const slot = this.roomState.slots.find((s) => s.peerId === peerId);
        if (slot) {
          slot.isReady = !slot.isReady;
          this.broadcastRoomState();
        }
        break;
      }

      case "client_input": {
        if (this.onRemoteInput) {
          this.onRemoteInput(peerId, msg.input);
        }
        break;
      }

      case "chat": {
        this.broadcastChat(msg.message);
        break;
      }

      case "pong": {
        const slot = this.roomState.slots.find((s) => s.peerId === peerId);
        if (slot) {
          slot.ping = Math.max(1, Math.round((Date.now() - msg.t) / 2));
        } else {
          const spec = this.roomState.spectators.find((s) => s.peerId === peerId);
          if (spec) spec.ping = Math.max(1, Math.round((Date.now() - msg.t) / 2));
        }
        break;
      }
    }
  }

  private handleClientDisconnect(peerId: string) {
    this.clientConns.delete(peerId);
    if (!this.roomState) return;

    const slot = this.roomState.slots.find((s) => s.peerId === peerId);
    const leftPlayerName = slot?.playerName || "A player";

    if (slot) {
      if (this.roomState.status === "in_game" && this.roomState.settings.fillBots) {
        // Substitute disconnected human with AI bot during in-progress match
        slot.isOccupied = true;
        slot.isBot = true;
        slot.peerId = undefined;
        slot.playerName = `${BOT_MEME_NAMES[Math.floor(Math.random() * BOT_MEME_NAMES.length)]} (Sub)`;
        slot.botDifficulty = this.roomState.settings.botDifficulty;
      } else {
        slot.isOccupied = false;
        slot.isBot = false;
        slot.peerId = undefined;
        slot.playerName = undefined;
        slot.isReady = false;
      }
    }

    this.roomState.spectators = this.roomState.spectators.filter((s) => s.peerId !== peerId);
    this.broadcastRoomState();

    this.broadcastChat({
      id: `sys_${Date.now()}`,
      sender: "SYSTEM",
      team: "system",
      text: `💨 ${leftPlayerName} left the room.`,
      timestamp: Date.now(),
      isSystem: true
    });
  }

  // --- CLIENT MESSAGE HANDLER ---
  private setupClientConnListeners(conn: DataConnection) {
    conn.on("data", (data: any) => {
      const msg = data as NetMessage;
      switch (msg.type) {
        case "join_accepted": {
          this.roomState = msg.roomState;
          if (this.onStateChanged) this.onStateChanged(this.roomState);
          break;
        }

        case "room_state": {
          this.roomState = msg.roomState;
          if (this.onStateChanged) this.onStateChanged(this.roomState);
          break;
        }

        case "start_game": {
          this.roomState = msg.roomState;
          if (this.onGameStart) this.onGameStart(this.roomState);
          break;
        }

        case "snapshot": {
          if (this.onSnapshotReceived) {
            this.onSnapshotReceived(msg.snapshot);
          }
          break;
        }

        case "chat": {
          if (this.onChatReceived) {
            this.onChatReceived(msg.message);
          }
          break;
        }

        case "return_to_lobby": {
          if (this.roomState) {
            this.roomState.status = "lobby";
            if (this.onStateChanged) this.onStateChanged(this.roomState);
          }
          if (this.onReturnToLobby) {
            this.onReturnToLobby();
          }
          break;
        }

        case "rematch": {
          if (this.onRematch) {
            this.onRematch();
          }
          break;
        }

        case "ping": {
          // Echo back pong
          const pongMsg: NetMessage = { type: "pong", t: msg.t };
          conn.send(pongMsg);
          this.localPing = Math.max(1, Math.round((Date.now() - msg.t) / 2));
          break;
        }
      }
    });
  }

  // --- HOST CONTROLS ---
  public updateSettings(newSettings: Partial<RoomSettings>) {
    if (this.role !== "host" || !this.roomState) return;

    const modeChanged = newSettings.mode && newSettings.mode !== this.roomState.settings.mode;
    this.roomState.settings = { ...this.roomState.settings, ...newSettings };

    if (modeChanged) {
      // Re-create slots preserving existing players
      const oldSlots = [...this.roomState.slots];
      const newSlots = createSlotsForMode(this.roomState.settings.mode, this.roomState.settings.botDifficulty);

      // Preserve host in blue 0
      newSlots[0].isOccupied = true;
      newSlots[0].playerName = oldSlots[0]?.playerName || "Host";
      newSlots[0].peerId = this.myPeerId || undefined;
      newSlots[0].carModel = oldSlots[0]?.carModel || "octane";
      newSlots[0].isReady = true;

      // Transfer other players where possible
      const otherPlayers = oldSlots.filter((s) => s.isOccupied && !s.isBot && s.peerId !== this.myPeerId);
      for (const p of otherPlayers) {
        const availableSlot = newSlots.find((s) => !s.isOccupied && s.team === p.team) ||
          newSlots.find((s) => !s.isOccupied);
        if (availableSlot) {
          availableSlot.isOccupied = true;
          availableSlot.peerId = p.peerId;
          availableSlot.playerName = p.playerName;
          availableSlot.carModel = p.carModel;
          availableSlot.isReady = p.isReady;
        } else if (p.peerId) {
          this.roomState.spectators.push({
            peerId: p.peerId,
            playerName: p.playerName || "Spectator",
            ping: p.ping || 0
          });
        }
      }

      this.roomState.slots = newSlots;
    }

    this.broadcastRoomState();
  }

  public addBot(team: Team, slotIndex: number, difficulty?: BotDifficulty) {
    if (this.role !== "host" || !this.roomState) return;
    const slot = this.roomState.slots.find((s) => s.team === team && s.slotIndex === slotIndex);
    if (slot && !slot.isOccupied) {
      slot.isOccupied = true;
      slot.isBot = true;
      slot.botDifficulty = difficulty || this.roomState.settings.botDifficulty;
      slot.playerName = BOT_MEME_NAMES[Math.floor(Math.random() * BOT_MEME_NAMES.length)];
      slot.carModel = "octane";
      slot.isReady = true;
      this.broadcastRoomState();
    }
  }

  public removeBot(slotId: string) {
    if (this.role !== "host" || !this.roomState) return;
    const slot = this.roomState.slots.find((s) => s.id === slotId);
    if (slot && slot.isBot) {
      slot.isOccupied = false;
      slot.isBot = false;
      slot.playerName = undefined;
      slot.isReady = false;
      this.broadcastRoomState();
    }
  }

  public toggleFillBots() {
    if (this.role !== "host" || !this.roomState) return;
    this.roomState.settings.fillBots = !this.roomState.settings.fillBots;
    this.broadcastRoomState();
  }

  public startGame() {
    if (this.role !== "host" || !this.roomState) return;

    // If fillBots is enabled, automatically populate any open slots with bots!
    if (this.roomState.settings.fillBots) {
      let botIndex = 0;
      for (const slot of this.roomState.slots) {
        if (!slot.isOccupied) {
          slot.isOccupied = true;
          slot.isBot = true;
          slot.botDifficulty = this.roomState.settings.botDifficulty;
          slot.playerName = BOT_MEME_NAMES[botIndex % BOT_MEME_NAMES.length];
          slot.carModel = "octane";
          slot.isReady = true;
          botIndex++;
        }
      }
    }

    this.roomState.status = "in_game";
    const startMsg: NetMessage = {
      type: "start_game",
      roomState: this.roomState
    };
    this.broadcast(startMsg);

    if (this.onGameStart) {
      this.onGameStart(this.roomState);
    }
  }

  public returnToLobby() {
    if (this.role !== "host" || !this.roomState) return;
    this.roomState.status = "lobby";
    const msg: NetMessage = { type: "return_to_lobby" };
    this.broadcast(msg);
    this.broadcastRoomState();

    if (this.onReturnToLobby) {
      this.onReturnToLobby();
    }
  }

  public rematch() {
    if (this.role !== "host" || !this.roomState) return;
    const msg: NetMessage = { type: "rematch" };
    this.broadcast(msg);
    if (this.onRematch) {
      this.onRematch();
    }
  }

  // --- CLIENT ACTIONS ---
  public requestSlotChange(targetTeam: Team, targetSlotIndex: number) {
    if (this.role === "host") {
      // Host can move directly
      if (!this.roomState) return;
      const hostSlot = this.roomState.slots.find((s) => s.peerId === this.myPeerId);
      const target = this.roomState.slots.find(
        (s) => s.team === targetTeam && s.slotIndex === targetSlotIndex
      );
      if (target && !target.isOccupied) {
        if (hostSlot) {
          hostSlot.isOccupied = false;
          hostSlot.peerId = undefined;
          hostSlot.playerName = undefined;
          hostSlot.isReady = false;
        }
        target.isOccupied = true;
        target.isBot = false;
        target.peerId = this.myPeerId || undefined;
        target.playerName = hostSlot?.playerName || "Host";
        target.carModel = hostSlot?.carModel || "octane";
        target.isReady = true;
        this.broadcastRoomState();
      }
      return;
    }

    if (this.hostConn && this.hostConn.open) {
      const msg: NetMessage = {
        type: "slot_change_request",
        targetTeam,
        targetSlotIndex
      };
      this.hostConn.send(msg);
    }
  }

  public requestCarChange(carModel: string) {
    if (this.role === "host" && this.roomState) {
      const slot = this.roomState.slots.find((s) => s.peerId === this.myPeerId);
      if (slot) {
        slot.carModel = carModel;
        this.broadcastRoomState();
      }
      return;
    }

    if (this.hostConn && this.hostConn.open) {
      const msg: NetMessage = { type: "car_change_request", carModel };
      this.hostConn.send(msg);
    }
  }

  public requestPilotModeChange(pilotMode: "human" | "bot", targetSlotId?: string) {
    if (this.role === "host" && this.roomState) {
      const slot = targetSlotId
        ? this.roomState.slots.find(s => s.id === targetSlotId)
        : this.roomState.slots.find(s => s.peerId === this.myPeerId);
      if (slot) {
        slot.pilotMode = pilotMode;
        this.broadcastRoomState();
      }
      return;
    }

    if (this.hostConn && this.hostConn.open) {
      const msg: NetMessage = { type: "pilot_mode_request", pilotMode };
      this.hostConn.send(msg);
    }
  }

  public updatePlayerName(newName: string) {
    const trimmed = newName.trim().slice(0, 16) || "Player";
    if (this.role === "host" && this.roomState) {
      const slot = this.roomState.slots.find((s) => s.peerId === this.myPeerId);
      if (slot) {
        slot.playerName = trimmed;
        this.broadcastRoomState();
      }
    } else if (this.role === "client" && this.hostConn && this.hostConn.open) {
      const msg: NetMessage = { type: "name_change_request", playerName: trimmed };
      this.hostConn.send(msg);
    }
  }

  public updatePhysicsMode(physicsMode: "rocket_league" | "legacy") {
    if (this.role !== "host" || !this.roomState) return;
    this.roomState.settings.physicsMode = physicsMode;
    this.broadcastRoomState();
  }

  public toggleReady() {
    if (this.role === "host") return; // Host is always ready
    if (this.hostConn && this.hostConn.open) {
      const msg: NetMessage = { type: "ready_toggle" };
      this.hostConn.send(msg);
    }
  }

  public sendInput(input: PlayerInputPayload) {
    if (this.role !== "client" || !this.hostConn || !this.hostConn.open) return;
    const msg: NetMessage = {
      type: "client_input",
      input,
      seq: ++this.inputSeq
    };
    this.hostConn.send(msg);
  }

  public sendChat(text: string, senderName: string, team: string) {
    const chatMsg: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: senderName,
      team,
      text,
      timestamp: Date.now()
    };

    if (this.role === "host") {
      this.broadcastChat(chatMsg);
    } else if (this.hostConn && this.hostConn.open) {
      const msg: NetMessage = { type: "chat", message: chatMsg };
      this.hostConn.send(msg);
    }
  }

  // --- BROADCASTING HELPERS ---
  public broadcastSnapshot(snapshot: MatchSnapshot) {
    if (this.role !== "host" || this.clientConns.size === 0) return;
    const msg: NetMessage = { type: "snapshot", snapshot };
    this.broadcast(msg);
  }

  public broadcastRoomState() {
    if (this.role !== "host" || !this.roomState) return;
    const msg: NetMessage = { type: "room_state", roomState: this.roomState };
    this.broadcast(msg);
    if (this.onStateChanged) {
      this.onStateChanged(this.roomState);
    }
  }

  public broadcastChat(message: ChatMessage) {
    const msg: NetMessage = { type: "chat", message };
    this.broadcast(msg);
    if (this.onChatReceived) {
      this.onChatReceived(message);
    }
  }

  private broadcast(msg: NetMessage) {
    for (const [_, conn] of this.clientConns) {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch (e) {}
      }
    }
  }

  private startHostPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.role !== "host" || this.clientConns.size === 0) return;
      const now = Date.now();
      const pingMsg: NetMessage = { type: "ping", t: now };
      this.broadcast(pingMsg);
    }, 2500);
  }

  // --- CLEANUP ---
  public disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    for (const [_, conn] of this.clientConns) {
      try {
        conn.close();
      } catch (e) {}
    }
    this.clientConns.clear();

    if (this.hostConn) {
      try {
        this.hostConn.close();
      } catch (e) {}
      this.hostConn = null;
    }

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
      this.peer = null;
    }

    this.role = "none";
    this.myPeerId = null;
    this.roomState = null;
    this.isConnected = false;
    this.connectionError = null;
    this.localPing = 0;
  }
}

export const peerNetwork = new PeerNetworkManager();
