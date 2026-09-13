import React, * as st from "react";
import * as d from "react/jsx-runtime";
import {
  ArrowDown as dg,
  ArrowLeft as mg,
  ArrowRight as vg,
  ArrowUp as pg,
  Check as Wh,
  CircleArrowUp as bg,
  CircleHelp as Ng,
  Eye as Eg,
  Flame as $s,
  Keyboard as zg,
  MessageSquare as jg,
  MoveUp as Rg,
  Pause as wg,
  Play as Hg,
  RefreshCw as Bg,
  RotateCcw as im,
  Send as Xg,
  Settings as cm,
  ShieldAlert as Qg,
  Shield as fm,
  Sparkles as sm,
  Target as om,
  Trophy as Is,
  Users as Wg,
  Volume2 as Ig,
  VolumeX as t2,
  X as rm,
  Zap as Ru,
  Video,
  SkipForward,
  Clock,
  Rewind,
  FastForward,
  Maximize,
  Minimize
} from "lucide-react";


// --- GAME ENGINE & PHYSICS CONFIGURATIONS ---
const Kt=2e3,hl=1100,k=950,Qt=120,At=120,Mt=1880,F=160,$h=380,Ih=680,zn=14,le={x:At,yMin:$h,yMax:Ih,depth:130},ae={x:Mt,yMin:$h,yMax:Ih,depth:130},Cu=30,zv=68,ks=28;

const LEGACY_PHYSICS = {
  pv: 1050, Ph: 850, Dh: .998, wh: .985, Uh: .995,
  xv: 650, Tv: 840, bv: 1250, Hh: 1400, ju: 1000,
  Sv: 1600, Nv: 2600, Mv: 33.3, cc: 520, Gh: 400,
  Ev: .2, Bh: 600, qh: .45, _v: 1.35, Av: 6.2,
  reverseDriveSpeed: 1400, wavedashMinSpeed: 1280
};

const RL_PHYSICS = {
  pv: 720, Ph: 720, Dh: .998, wh: .985, Uh: .995,
  xv: 460, Tv: 725, bv: 750, Hh: 1300, ju: 720,
  Sv: 1100, Nv: 1350, Mv: 33.3, cc: 400, Gh: 320,
  Ev: .2, Bh: 440, qh: .45, _v: 1.35, Av: 6.0,
  reverseDriveSpeed: 500, wavedashMinSpeed: 720
};

let activePhysicsMode = "rocket_league";

// Dynamic physics constants (synced with activePhysicsMode)
let pv=720,Ph=720,Dh=.998,wh=.985,Uh=.995,xv=460,Tv=725,bv=750,Hh=1300,ju=720,Sv=1100,Nv=1350,Mv=33.3,cc=400,Gh=320,Ev=.2,Bh=440,qh=.45,_v=1.35,Av=6.0;

function syncPhysicsGlobals(mode: string) {
  activePhysicsMode = mode || "rocket_league";
  const c = activePhysicsMode === "legacy" ? LEGACY_PHYSICS : RL_PHYSICS;
  pv = c.pv; Ph = c.Ph; Dh = c.Dh; wh = c.wh; Uh = c.Uh;
  xv = c.xv; Tv = c.Tv; bv = c.bv; Hh = c.Hh; ju = c.ju;
  Sv = c.Sv; Nv = c.Nv; Mv = c.Mv; cc = c.cc; Gh = c.Gh;
  Ev = c.Ev; Bh = c.Bh; qh = c.qh; _v = c._v; Av = c.Av;
}
const MEME_BOT_NAMES = [
  "pudge_hook_mid", "AirDribbleGod", "KuxirPinch_Bot", "Supersonic_99",
  "FlipResetKing", "Calculated_AI", "BallChaser_69", "CeilingShuffler",
  "WhiffMaster_3000", "Kronovi_Fan", "SpeedyOctane", "MustyFlicker",
  "DoubleTap_Dan", "Toxic_QuickChat", "DemoDemon", "SquishyMuffinz_Fan",
  "Zen_Prodigy", "NoBoost_NoProblem", "WallPinch_Sniper", "skibidi_slayer"
];
function getRandomMemeName(prefix="") {
  const base = MEME_BOT_NAMES[Math.floor(Math.random() * MEME_BOT_NAMES.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return prefix ? (prefix + " " + base) : (base + " " + num);
}function Yh(){return[{id:"big_bl",x:260,y:k-40,type:"big",active:!0,cooldownTimer:0,respawnTime:10},{id:"big_br",x:1740,y:k-40,type:"big",active:!0,cooldownTimer:0,respawnTime:10},{id:"big_tl",x:260,y:Qt+120,type:"big",active:!0,cooldownTimer:0,respawnTime:10},{id:"big_tr",x:1740,y:Qt+120,type:"big",active:!0,cooldownTimer:0,respawnTime:10},{id:"big_mid_bot",x:1e3,y:k-40,type:"big",active:!0,cooldownTimer:0,respawnTime:10},{id:"big_mid_top",x:1e3,y:Qt+100,type:"big",active:!0,cooldownTimer:0,respawnTime:10},{id:"small_1",x:600,y:k-20,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_2",x:800,y:k-20,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_3",x:1200,y:k-20,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_4",x:1400,y:k-20,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_5",x:450,y:700,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_6",x:1550,y:700,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_7",x:800,y:550,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_8",x:1200,y:550,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_9",x:1e3,y:550,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_10",x:600,y:400,type:"small",active:!0,cooldownTimer:0,respawnTime:4},{id:"small_11",x:1400,y:400,type:"small",active:!0,cooldownTimer:0,respawnTime:4}]}class Ov{ctx:any=null;masterGain:any=null;isMuted:boolean=!1;volume:number=.5;engineOsc:any=null;engineGain:any=null;boostSource:any=null;boostGain:any=null;constructor(){this.ctx=null,this.masterGain=null,this.isMuted=!1,this.volume=.5,this.engineOsc=null,this.engineGain=null,this.boostSource=null,this.boostGain=null}initContext(){if(!this.ctx){const f=window.AudioContext||(window as any).webkitAudioContext;this.ctx=new f,this.masterGain=this.ctx.createGain(),this.masterGain.gain.setValueAtTime(this.isMuted?0:this.volume,this.ctx.currentTime),this.masterGain.connect(this.ctx.destination)}this.ctx.state==="suspended"&&this.ctx.resume()}setMuted(f){this.isMuted=f,this.masterGain&&this.ctx&&this.masterGain.gain.setTargetAtTime(f?0:this.volume,this.ctx.currentTime,.05)}setVolume(f){this.volume=Math.max(0,Math.min(1,f)),this.masterGain&&this.ctx&&!this.isMuted&&this.masterGain.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.05)}playJump(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.createOscillator(),r=this.ctx.createGain(),s=this.ctx.currentTime;f.type="triangle",f.frequency.setValueAtTime(140,s),f.frequency.exponentialRampToValueAtTime(380,s+.12),r.gain.setValueAtTime(.25,s),r.gain.exponentialRampToValueAtTime(.01,s+.15),f.connect(r),r.connect(this.masterGain),f.start(s),f.stop(s+.16)}playDodgeFlip(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="sawtooth",r.frequency.setValueAtTime(280,f),r.frequency.exponentialRampToValueAtTime(90,f+.15),s.gain.setValueAtTime(.35,f),s.gain.exponentialRampToValueAtTime(.01,f+.18),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.2)}playBallHit(f=1){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const r=this.ctx.currentTime,s=Math.min(2.5,Math.max(.4,f)),y=this.ctx.createOscillator(),m=this.ctx.createGain();if(y.type="sine",y.frequency.setValueAtTime(160*s,r),y.frequency.exponentialRampToValueAtTime(40,r+.18),m.gain.setValueAtTime(.5*s,r),m.gain.exponentialRampToValueAtTime(.01,r+.2),y.connect(m),m.connect(this.masterGain),y.start(r),y.stop(r+.22),f>1.3){const g=this.ctx.createOscillator(),p=this.ctx.createGain();g.type="triangle",g.frequency.setValueAtTime(450,r),g.frequency.exponentialRampToValueAtTime(100,r+.08),p.gain.setValueAtTime(.3,r),p.gain.exponentialRampToValueAtTime(.01,r+.1),g.connect(p),p.connect(this.masterGain),g.start(r),g.stop(r+.11)}}playCrossbar(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime;[880,1320,2200].forEach((r,s)=>{if(!this.ctx||!this.masterGain)return;const y=this.ctx.createOscillator(),m=this.ctx.createGain();y.type="sine",y.frequency.setValueAtTime(r,f),m.gain.setValueAtTime(.25/(s+1),f),m.gain.exponentialRampToValueAtTime(.001,f+.5),y.connect(m),m.connect(this.masterGain),y.start(f),y.stop(f+.55)})}playSupersonicBoom(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="sawtooth",r.frequency.setValueAtTime(120,f),r.frequency.exponentialRampToValueAtTime(30,f+.25),s.gain.setValueAtTime(.6,f),s.gain.exponentialRampToValueAtTime(.01,f+.3),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.32)}playDemolition(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.sampleRate*.4,s=this.ctx.createBuffer(1,r,this.ctx.sampleRate),y=s.getChannelData(0);for(let A=0;A<r;A++)y[A]=Math.random()*2-1;const m=this.ctx.createBufferSource();m.buffer=s;const g=this.ctx.createBiquadFilter();g.type="lowpass",g.frequency.setValueAtTime(800,f),g.frequency.linearRampToValueAtTime(80,f+.35);const p=this.ctx.createGain();p.gain.setValueAtTime(.7,f),p.gain.exponentialRampToValueAtTime(.01,f+.4),m.connect(g),g.connect(p),p.connect(this.masterGain),m.start(f),m.stop(f+.42)}playGoalExplosion(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="sine",r.frequency.setValueAtTime(90,f),r.frequency.exponentialRampToValueAtTime(25,f+.8),s.gain.setValueAtTime(.8,f),s.gain.exponentialRampToValueAtTime(.01,f+.9),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.95),[440,554,659].forEach(y=>{if(!this.ctx||!this.masterGain)return;const m=this.ctx.createOscillator(),g=this.ctx.createGain();m.type="sawtooth",m.frequency.setValueAtTime(y,f+.1),g.gain.setValueAtTime(.01,f),g.gain.setValueAtTime(.2,f+.12),g.gain.exponentialRampToValueAtTime(.01,f+1.2),m.connect(g),g.connect(this.masterGain),m.start(f+.1),m.stop(f+1.25)})}playCountdown(f=!1){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const r=this.ctx.currentTime,s=this.ctx.createOscillator(),y=this.ctx.createGain();s.type="sine",s.frequency.setValueAtTime(f?880:440,r),y.gain.setValueAtTime(.35,r),y.gain.exponentialRampToValueAtTime(.01,r+(f?.35:.15)),s.connect(y),y.connect(this.masterGain),s.start(r),s.stop(r+(f?.4:.2))}playBoostPadPickup(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="triangle",r.frequency.setValueAtTime(520,f),r.frequency.exponentialRampToValueAtTime(840,f+.12),s.gain.setValueAtTime(.2,f),s.gain.exponentialRampToValueAtTime(.01,f+.15),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.16)}playPinch(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="sawtooth",r.frequency.setValueAtTime(340,f),r.frequency.exponentialRampToValueAtTime(40,f+.35),s.gain.setValueAtTime(.7,f),s.gain.exponentialRampToValueAtTime(.01,f+.38),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.4);const y=this.ctx.createOscillator(),m=this.ctx.createGain();y.type="sine",y.frequency.setValueAtTime(550,f),y.frequency.exponentialRampToValueAtTime(2400,f+.25),m.gain.setValueAtTime(.35,f),m.gain.exponentialRampToValueAtTime(.01,f+.28),y.connect(m),m.connect(this.masterGain),y.start(f),y.stop(f+.3)}playFlipReset(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime;[880,1320].forEach((r,s)=>{const y=this.ctx.createOscillator(),m=this.ctx.createGain();y.type="sine",y.frequency.setValueAtTime(r,f+s*.04),y.frequency.exponentialRampToValueAtTime(r*1.5,f+s*.04+.18),m.gain.setValueAtTime(.3,f+s*.04),m.gain.exponentialRampToValueAtTime(.01,f+s*.04+.22),y.connect(m),m.connect(this.masterGain),y.start(f+s*.04),y.stop(f+s*.04+.25)})}playMustyFlick(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="triangle",r.frequency.setValueAtTime(180,f),r.frequency.exponentialRampToValueAtTime(620,f+.08),r.frequency.exponentialRampToValueAtTime(80,f+.22),s.gain.setValueAtTime(.5,f),s.gain.exponentialRampToValueAtTime(.01,f+.25),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.26)}playDoubleTap(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime;[587,880,1174].forEach((r,s)=>{const y=this.ctx.createOscillator(),m=this.ctx.createGain();y.type="triangle",y.frequency.setValueAtTime(r,f+s*.08),m.gain.setValueAtTime(.35,f+s*.08),m.gain.exponentialRampToValueAtTime(.01,f+s*.08+.25),y.connect(m),m.connect(this.masterGain),y.start(f+s*.08),y.stop(f+s*.08+.28)})}playPsycho(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="sawtooth",r.frequency.setValueAtTime(140,f),r.frequency.exponentialRampToValueAtTime(45,f+.5),s.gain.setValueAtTime(.8,f),s.gain.exponentialRampToValueAtTime(.01,f+.55),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.6)}playAirRoll(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="sine",r.frequency.setValueAtTime(360,f),r.frequency.exponentialRampToValueAtTime(180,f+.08),s.gain.setValueAtTime(.2,f),s.gain.exponentialRampToValueAtTime(.01,f+.1),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.11)}playWavedash(){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="triangle",r.frequency.setValueAtTime(220,f),r.frequency.exponentialRampToValueAtTime(60,f+.12),s.gain.setValueAtTime(.4,f),s.gain.exponentialRampToValueAtTime(.01,f+.14),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.15)}playSave(isEpic=!1){if(this.initContext(),!this.ctx||!this.masterGain||this.isMuted)return;const f=this.ctx.currentTime,r=this.ctx.createOscillator(),s=this.ctx.createGain();r.type="triangle",r.frequency.setValueAtTime(isEpic?480:360,f),r.frequency.exponentialRampToValueAtTime(isEpic?960:600,f+.22),s.gain.setValueAtTime(.55,f),s.gain.exponentialRampToValueAtTime(.01,f+.28),r.connect(s),s.connect(this.masterGain),r.start(f),r.stop(f+.3)}}const Me=new Ov;let On=0;

function emitMechanicEvent(s: any, car: any, event: { type: string, text: string, color: string, speedKmh?: number }) {
  const now = Date.now();
  car.mechanicCooldowns = car.mechanicCooldowns || {};
  const lastTime = car.mechanicCooldowns[event.type] || 0;
  if (now - lastTime < 1200) {
    return false;
  }
  car.mechanicCooldowns[event.type] = now;
  
  const ev = {
    id: ++On,
    type: event.type,
    text: event.text,
    player: car.name,
    team: car.team,
    color: event.color,
    speedKmh: event.speedKmh
  };
  if (s) {
    s.mechanicEvents = s.mechanicEvents || [];
    s.mechanicEvents.push(ev);
  }
  
  car.activeMechanicAlert = {
    text: event.text,
    color: event.color,
    startTime: now,
    duration: 1800
  };
  return true;
}
// ==========================================
// --- EXACT LEGACY PHYSICS IMPLEMENTATION ---
// ==========================================
function fc_legacy(u: any, f: any, r: any) {
  const s = u.x - f, y = u.y - r, m = Math.hypot(s, y), g = zn + u.height / 2;
  if (m < g && m > 0) {
    const p = s / m, A = y / m;
    u.x = f + p * g, u.y = r + A * g;
    const C = u.vx * p + u.vy * A;
    C < 0 && (u.vx -= 1.3 * C * p, u.vy -= 1.3 * C * A, Me.playCrossbar());
  }
}

function Rv_legacy(u: any) {
  const f = u.height / 2, r = u.width / 2;
  let s = !1, y = { x: 0, y: -1 }, m = "air";
  if (u.y + f >= k) { u.y = k - f, u.vy > 0 && (u.vy = 0), s = !0, y = { x: 0, y: -1 }, m = "floor"; }
  if (u.y - f <= Qt) { u.y = Qt + f, u.vy < 0 && (u.vy = 0), Math.abs(u.vx) > 300 && u.input.throttleForward && (s = !0, y = { x: 0, y: 1 }, m = "ceiling"); }
  const inBM = u.y > le.yMin && u.y < le.yMax, inOM = u.y > ae.yMin && u.y < ae.yMax;
  if (u.x >= At && u.x <= Mt) {
    if (u.x - r <= At && !inBM) { u.x = At + r, u.vx < 0 && (u.vx = 0), (Math.abs(u.vy) > 120 || u.input.throttleForward || u.input.steerLeft) && (s = !0, y = { x: 1, y: 0 }, m = "left_wall"); }
    if (u.x + r >= Mt && !inOM) { u.x = Mt - r, u.vx > 0 && (u.vx = 0), (Math.abs(u.vy) > 120 || u.input.throttleForward || u.input.steerRight) && (s = !0, y = { x: -1, y: 0 }, m = "right_wall"); }
    const A = At + F, C = k - F;
    if (u.x < A && u.y > C) { const U = u.x - A, Tt = u.y - C, at = Math.hypot(U, Tt); if (at > F - f && at > 0) { const Ht = -U / at, ot = -Tt / at; u.x = A - Ht * (F - f), u.y = C - ot * (F - f), s = !0, y = { x: Ht, y: ot }, m = "curve"; } }
    const z = Mt - F, N = k - F;
    if (u.x > z && u.y > N) { const U = u.x - z, Tt = u.y - N, at = Math.hypot(U, Tt); if (at > F - f && at > 0) { const Ht = -U / at, ot = -Tt / at; u.x = z - Ht * (F - f), u.y = N - ot * (F - f), s = !0, y = { x: Ht, y: ot }, m = "curve"; } }
    const D = At + F, X = Qt + F;
    if (u.x < D && u.y < X) { const U = u.x - D, Tt = u.y - X, at = Math.hypot(U, Tt); if (at > F - f && at > 0) { const Ht = -U / at, ot = -Tt / at; u.x = D - Ht * (F - f), u.y = X - ot * (F - f), s = !0, y = { x: Ht, y: ot }, m = "curve"; } }
    const tt = Mt - F, I = Qt + F;
    if (u.x > tt && u.y < I) { const U = u.x - tt, Tt = u.y - I, at = Math.hypot(U, Tt); if (at > F - f && at > 0) { const Ht = -U / at, ot = -Tt / at; u.x = tt - Ht * (F - f), u.y = I - ot * (F - f), s = !0, y = { x: Ht, y: ot }, m = "curve"; } }
  } else if (u.x < At) {
    if (u.x - r <= At - le.depth) { u.x = At - le.depth + r, u.vx < 0 && (u.vx = 0), s = !0, y = { x: 1, y: 0 }, m = "left_wall"; }
    if (u.y - f <= le.yMin) { u.y = le.yMin + f, u.vy < 0 && (u.vy = 0), s = !0, y = { x: 0, y: 1 }, m = "ceiling"; }
    if (u.y + f >= le.yMax) { u.y = le.yMax - f, u.vy > 0 && (u.vy = 0), s = !0, y = { x: 0, y: -1 }, m = "floor"; }
    if (u.x + r >= At && !inBM) { u.x = At - r, u.vx > 0 && (u.vx = 0); }
  } else if (u.x > Mt) {
    if (u.x + r >= Mt + ae.depth) { u.x = Mt + ae.depth - r, u.vx > 0 && (u.vx = 0), s = !0, y = { x: -1, y: 0 }, m = "right_wall"; }
    if (u.y - f <= ae.yMin) { u.y = ae.yMin + f, u.vy < 0 && (u.vy = 0), s = !0, y = { x: 0, y: 1 }, m = "ceiling"; }
    if (u.y + f >= ae.yMax) { u.y = ae.yMax - f, u.vy > 0 && (u.vy = 0), s = !0, y = { x: 0, y: -1 }, m = "floor"; }
    if (u.x - r <= Mt && !inOM) { u.x = Mt + r, u.vx < 0 && (u.vx = 0); }
  }
  fc_legacy(u, At, le.yMin), fc_legacy(u, At, le.yMax), fc_legacy(u, Mt, ae.yMin), fc_legacy(u, Mt, ae.yMax);
  u.isGrounded = s, u.surfaceNormal = y, u.surfaceType = m;
}

function Cv_legacy(u: any, f: number, r: any) {
  const qh = LEGACY_PHYSICS.qh,
        ju = LEGACY_PHYSICS.ju,
        wh = LEGACY_PHYSICS.wh,
        cc = LEGACY_PHYSICS.cc,
        pv = LEGACY_PHYSICS.pv,
        Dh = LEGACY_PHYSICS.Dh,
        Av = LEGACY_PHYSICS.Av,
        Ev = LEGACY_PHYSICS.Ev,
        Gh = LEGACY_PHYSICS.Gh,
        _v = LEGACY_PHYSICS._v,
        Bh = LEGACY_PHYSICS.Bh,
        Mv = LEGACY_PHYSICS.Mv,
        Nv = LEGACY_PHYSICS.Nv,
        Sv = LEGACY_PHYSICS.Sv,
        bv = LEGACY_PHYSICS.bv,
        xv = LEGACY_PHYSICS.xv,
        Tv = LEGACY_PHYSICS.Tv;

  if (u.isFlipping && (u.flipTimer += f, u.angle += (u.flipDirection.x >= 0 ? 1 : -1) * (Math.PI * 2 / qh) * f, u.flipTimer >= qh && (u.isFlipping = !1, u.flipTimer = 0)), u.jumpCount === 1 && !u.isGrounded && !u.hasFlipReset && (u.flipWindowTimer += f), Rv_legacy(u), u.isGrounded) {
    if (u.isFlipping && u.flipTimer < .3) {
      u.isFlipping = !1, u.flipTimer = 0, u.angle = 0;
      const _dashDir = u.flipDirection.x >= 0 ? 1 : -1;
      u.vx = _dashDir * Math.max(Math.abs(u.vx), 1280), u.isSupersonic = !0, u.supersonicTimer = 1.2, Me.playWavedash(), emitMechanicEvent(r, u, { type: "wavedash", text: "⚡ WAVEDASH", color: "#38bdf8" });
      for (let _k = 0; _k < 8; _k++)r.newParticles.push({ id: ++On, x: u.x + (Math.random() - .5) * u.width, y: u.y + u.height / 2, vx: -_dashDir * 200 + (Math.random() - .5) * 80, vy: -50 - Math.random() * 80, life: .25, maxLife: .25, color: "#fbbf24", size: 3, type: "spark" });
    }
    u.jumpCount = 0, u.flipWindowTimer = 0, u.isFlipping = !1, u.hasFlipReset = !1;
    const g = u.surfaceNormal, p = { x: -g.y, y: g.x }, A = { x: g.y, y: -g.x }, C = p.x > .01 || Math.abs(p.x) <= .01 && p.y < 0 ? p : A, z = { x: -C.x, y: -C.y }, N = { x: Math.cos(u.angle), y: Math.sin(u.angle) };
    let X = N.x * C.x + N.y * C.y >= 0, tt = null, I = 0;
    if (u.input.steerRight && !u.input.steerLeft ? (X = !0, tt = C, I = ju) : u.input.steerLeft && !u.input.steerRight ? (X = !1, tt = z, I = ju) : (u.surfaceType === "left_wall" || u.surfaceType === "right_wall") && (u.input.throttleForward || u.input.pitchUp ? (tt = C, X = !0, I = ju) : (u.input.throttleReverse || u.input.pitchDown) && (tt = z, X = !1, I = ju)), !tt) {
      const U = X ? C : z;
      u.input.throttleForward ? (tt = U, I = ju) : u.input.throttleReverse && (tt = U, I = -1400);
    }
    if (tt && I !== 0) {
      u.vx += tt.x * I * f, u.vy += tt.y * I * f;
      const U = Math.atan2(tt.y, tt.x);
      u.angle = Lh(u.angle, U, 22 * f);
    } else {
      const U = X ? C : z, Tt = Math.atan2(U.y, U.x);
      u.angle = Lh(u.angle, Tt, 16 * f), u.vx *= Math.pow(wh, f * 60), u.vy *= Math.pow(wh, f * 60);
    }
    u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    u.airRollInverted = false;
    u.input.jump && u.canJump && (u.canJump = !1, u.isGrounded = !1, u.jumpCount = 1, u.jumpHoldTimer = 0, u.surfaceType = "air", u.vx += u.surfaceNormal.x * cc, u.vy += u.surfaceNormal.y * cc, u.facing = Math.cos(u.angle) >= 0 ? 1 : -1, u.airRollInverted = false, Me.playJump());
  } else {
    u.vy += pv * f, u.vx *= Math.pow(Dh, f * 60), u.vy *= Math.pow(Dh, f * 60);
    let g = 0;
    (u.input.steerLeft || u.input.pitchUp) && (g -= 1), (u.input.steerRight || u.input.pitchDown) && (g += 1), u.isFlipping || (u.angle += g * Av * f);
    if ((u.input.airRollLeft && !u._prevAirRollLeft) || (u.input.airRollRight && !u._prevAirRollRight)) {
      u.airRollInverted = !u.airRollInverted;
      Me.playAirRoll && Me.playAirRoll();
    }
    u._prevAirRollLeft = !!u.input.airRollLeft;
    u._prevAirRollRight = !!u.input.airRollRight;
    if (u.input.jump && u.jumpCount === 1 && u.jumpHoldTimer < Ev) {
      u.jumpHoldTimer += f;
      const p = { x: Math.sin(u.angle), y: -Math.cos(u.angle) };
      u.vx += p.x * Gh * f, u.vy += p.y * Gh * f;
    }
    if (u.input.jump && u.canJump && (u.jumpCount === 1 || u.jumpCount === 0) && (u.flipWindowTimer < _v || u.jumpCount === 0)) {
      u.canJump = !1, u.jumpCount = 2;
      let A = 0, C = 0;
      if ((u.input.steerRight || u.input.throttleForward) && (A += 1), (u.input.steerLeft || u.input.throttleReverse) && (A -= 1), u.input.pitchUp && (C -= 1), u.input.pitchDown && (C += 1), A !== 0 || C !== 0) {
        const z = Math.hypot(A, C) || 1, N = A / z, D = C / z;
        u.vy *= .15, u.vx += N * Bh, u.vy += D * (Bh * .7), u.isFlipping = !0, u.flipTimer = 0, u.flipDirection = { x: N, y: D }, Me.playDodgeFlip();
        for (let X = 0; X < 8; X++)r.newParticles.push({ id: ++On, x: u.x, y: u.y, vx: -N * 300 + (Math.random() - .5) * 150, vy: -D * 300 + (Math.random() - .5) * 150, life: .35, maxLife: .35, color: "#38bdf8", size: 4 + Math.random() * 3, type: "spark" });
      } else u.vy = Math.min(u.vy - cc * 1.05, -cc * 1.15), Me.playJump();
    }
  }
  if (u.input.jump || (u.canJump = !0), u.isBoosting = !1, u.input.boost && u.boost > 0) {
    u.isBoosting = !0, u.boost = Math.max(0, u.boost - Mv * f);
    const g = { x: Math.cos(u.angle), y: Math.sin(u.angle) }, p = !u.isGrounded, A = p ? Nv : Sv;
    u.vx += g.x * A * f, u.vy += g.y * A * f;
    const C = u.x - g.x * (u.width / 2), z = u.y - g.y * (u.width / 2), N = p ? 3 : 2;
    for (let D = 0; D < N; D++)r.newParticles.push({ id: ++On, x: C + (Math.random() - .5) * 6, y: z + (Math.random() - .5) * 6, vx: -g.x * (450 + Math.random() * 350) + (Math.random() - .5) * 90, vy: -g.y * (450 + Math.random() * 350) + (Math.random() - .5) * 90, life: p ? .3 : .25, maxLife: p ? .3 : .25, color: u.team === "blue" ? Math.random() > .4 ? "#38bdf8" : "#60a5fa" : Math.random() > .4 ? "#f97316" : "#fbbf24", size: (p ? 6 : 5) + Math.random() * 4, type: "boost" });
  }
  const s = Math.hypot(u.vx, u.vy), y = u.isBoosting ? bv : xv;
  if (s > y) {
    const g = y / s;
    u.vx *= g, u.vy *= g;
  }
  Math.hypot(u.vx, u.vy) >= Tv ? (u.isSupersonic || Me.playSupersonicBoom(), u.isSupersonic = !0, u.supersonicTimer += f, Math.random() < .6 && r.newParticles.push({ id: ++On, x: u.x - Math.cos(u.angle) * 20, y: u.y - Math.sin(u.angle) * 20, vx: u.vx * .1, vy: u.vy * .1, life: .28, maxLife: .28, color: "#ffffff", size: 3.5, type: "supersonic" })) : (u.isSupersonic = !1, u.supersonicTimer = 0);
  u.x += u.vx * f, u.y += u.vy * f;
}

function wv_legacy(u: any) {
  const f = zn + u.radius;
  if (u.x < At + zn && u.y < Qt + zn) {
    const r = u.x - (At + zn), s = u.y - (Qt + zn), y = Math.hypot(r, s);
    if (y < f && y > 0) {
      const m = r / y, g = s / y;
      u.x = At + zn + m * f, u.y = Qt + zn + g * f;
      const p = u.vx * m + u.vy * g;
      p < 0 && (u.vx -= 1.7 * p * m, u.vy -= 1.7 * p * g);
    }
  }
  if (u.x > Mt - zn && u.y < Qt + zn) {
    const r = u.x - (Mt - zn), s = u.y - (Qt + zn), y = Math.hypot(r, s);
    if (y < f && y > 0) {
      const m = r / y, g = s / y;
      u.x = Mt - zn + m * f, u.y = Qt + zn + g * f;
      const p = u.vx * m + u.vy * g;
      p < 0 && (u.vx -= 1.7 * p * m, u.vy -= 1.7 * p * g);
    }
  }
  if (u.x < At + zn && u.y > k - zn) {
    const r = u.x - (At + zn), s = u.y - (k - zn), y = Math.hypot(r, s);
    if (y < f && y > 0) {
      const m = r / y, g = s / y;
      u.x = At + zn + m * f, u.y = k - zn + g * f;
      const p = u.vx * m + u.vy * g;
      p < 0 && (u.vx -= 1.7 * p * m, u.vy -= 1.7 * p * g);
    }
  }
  if (u.x > Mt - zn && u.y > k - zn) {
    const r = u.x - (Mt - zn), s = u.y - (k - zn), y = Math.hypot(r, s);
    if (y < f && y > 0) {
      const m = r / y, g = s / y;
      u.x = Mt - zn + m * f, u.y = k - zn + g * f;
      const p = u.vx * m + u.vy * g;
      p < 0 && (u.vx -= 1.7 * p * m, u.vy -= 1.7 * p * g);
    }
  }
}

function sc_legacy(u: any, f: any, r: any, s: any) {
  const y = u.x - f, m = u.y - r, g = Math.hypot(y, m), p = zn + u.radius;
  if (g < p && g > 0) {
    const A = y / g, C = m / g;
    u.x = f + A * p, u.y = r + C * p;
    const z = u.vx * A + u.vy * C;
    z < 0 && (u.vx -= 1.8 * z * A, u.vy -= 1.8 * z * C, Me.playCrossbar(), s.newParticles = s.newParticles || [], s.newParticles.push({ id: ++On, x: u.x, y: u.y, vx: -A * 150, vy: -C * 150, life: .25, maxLife: .25, color: "#fbbf24", size: 4, type: "spark" }));
  }
}

function Dv_legacy(u: any, f: any, r: any) {
  const Ph = LEGACY_PHYSICS.Ph, Uh = LEGACY_PHYSICS.Uh, Hh = LEGACY_PHYSICS.Hh;
  u.vy += Ph * f, u.vx *= Math.pow(Uh, f * 60), u.vy *= Math.pow(Uh, f * 60), u.x += u.vx * f, u.y += u.vy * f, u.spin += u.vx / u.radius * f, u.touchEffectTimer > 0 && (u.touchEffectTimer -= f), u.trail = u.trail || [], u.trail.push({ x: u.x, y: u.y, vx: u.vx, vy: u.vy, time: Date.now() });
  const _maxTr = Math.hypot(u.vx, u.vy) > 1100 ? 30 : 20;
  u.trail.length > _maxTr && u.trail.splice(0, u.trail.length - _maxTr);
  if (u.y + u.radius >= k) { u.y = k - u.radius, u.vy = -u.vy * .76, u.vx *= .94; }
  if (u.y - u.radius <= Qt) { u.y = Qt + u.radius, u.vy = -u.vy * .76; }
  const inBM = u.y > le.yMin && u.y < le.yMax, inOM = u.y > ae.yMin && u.y < ae.yMax;
  if (u.x >= At && u.x <= Mt) {
    if (u.x - u.radius <= At && !inBM) {
      u.x = At + u.radius, u.vx = -u.vx * .8;
      if (u.y < le.yMin) { u.backboardRebound = { time: Date.now(), targetTeam: "blue", player: u.lastTouchPlayer }; }
      if (u.lastTouchPlayer) { u.psychoCandidate = { time: Date.now(), player: u.lastTouchPlayer, sourceWall: "blue" }; }
    }
    if (u.x + u.radius >= Mt && !inOM) {
      u.x = Mt - u.radius, u.vx = -u.vx * .8;
      if (u.y < ae.yMin) { u.backboardRebound = { time: Date.now(), targetTeam: "orange", player: u.lastTouchPlayer }; }
      if (u.lastTouchPlayer) { u.psychoCandidate = { time: Date.now(), player: u.lastTouchPlayer, sourceWall: "orange" }; }
    }
    wv_legacy(u);
  } else if (u.x < At) {
    if (u.x - u.radius <= At - le.depth) { u.x = At - le.depth + u.radius, u.vx = -u.vx * .35; }
    if (u.y - u.radius <= le.yMin) { u.y = le.yMin + u.radius, u.vy = Math.abs(u.vy) * .35; }
    if (u.y + u.radius >= le.yMax) { u.y = le.yMax - u.radius, u.vy = -Math.abs(u.vy) * .35; }
    if (u.x + u.radius >= At && !inBM) { u.x = At - u.radius, u.vx = -Math.abs(u.vx) * .5; }
  } else if (u.x > Mt) {
    if (u.x + u.radius >= Mt + ae.depth) { u.x = Mt + ae.depth - u.radius, u.vx = -u.vx * .35; }
    if (u.y - u.radius <= ae.yMin) { u.y = ae.yMin + u.radius, u.vy = Math.abs(u.vy) * .35; }
    if (u.y + u.radius >= ae.yMax) { u.y = ae.yMax - u.radius, u.vy = -Math.abs(u.vy) * .35; }
    if (u.x - u.radius <= Mt && !inOM) { u.x = Mt + u.radius, u.vx = Math.abs(u.vx) * .5; }
  }
  sc_legacy(u, At, le.yMin, r), sc_legacy(u, At, le.yMax, r), sc_legacy(u, Mt, ae.yMin, r), sc_legacy(u, Mt, ae.yMax, r);
  const m = Math.hypot(u.vx, u.vy);
  if (m > Hh) { const g = Hh / m; u.vx *= g, u.vy *= g; }
}

function Uv_legacy(u: any, f: any, r: number, s: any) {
  const y = Math.cos(u.angle), m = Math.sin(u.angle), g = f.x - u.x, p = f.y - u.y, A = g * y + p * m, C = -g * m + p * y, z = u.width / 2, N = u.height / 2, D = Math.max(-z, Math.min(z, A)), X = Math.max(-N, Math.min(N, C)), tt = A - D, I = C - X, U = Math.hypot(tt, I);
  if (U < f.radius) {
    const Tt = f.radius - (U || .001);
    let at = tt / (U || 1), Ht = I / (U || 1);
    U === 0 && (at = 0, Ht = -1);
    const ot = at * y - Ht * m, Lt = at * m + Ht * y;
    f.x += ot * Tt, f.y += Lt * Tt;
    const Ft = A > z * .5, J = C > N * .35 && Math.abs(A) < z * .85, dt = C < -N * .3;
    let Gt = 1.25;
    Ft ? Gt = 1.6 : J ? (Gt = .85, u.jumpCount = 0, u.flipWindowTimer = 0, u.canJump = !0, !u.isGrounded && (u.hasFlipReset = !0, Me.playFlipReset(), emitMechanicEvent(s, u, { type: "flip_reset", text: "⚡ FLIP RESET", color: "#f59e0b" }), (() => { for (let _i = 0; _i < 12; _i++)s.newParticles.push({ id: ++On, x: u.x + (Math.random() - .5) * u.width, y: u.y + (Math.random() - .5) * u.height, vx: (Math.random() - .5) * 180, vy: (Math.random() - .5) * 180, life: .35, maxLife: .35, color: "#fbbf24", size: 4, type: "spark" }); })())) : dt && (Gt = 1.05);
    const ht = f.vx - u.vx, ne = f.vy - u.vy, Yt = ht * ot + ne * Lt;
    if (Yt < 0) {
      const Te = -(1 + Gt) * Yt;
      f.vx += ot * Te, f.vy += Lt * Te;
      const re = u.vx * y + u.vy * m;
      if (re > 150 && Ft && (f.vx += y * (re * .45), f.vy += m * (re * .45)), Ft && f.y > k - 110) {
        const bt = Math.max(0, re), ut = Math.min(680, Math.max(280, bt * .52 + Math.abs(Yt) * .38));
        f.vy = Math.min(f.vy, -ut);
      }
      const Xt = Math.abs(f.x - Kt / 2) < 220, B = f.y > k - 90;
      Xt && B && (Math.abs(f.vx) > 700 && (f.vx = Math.sign(f.vx) * 700), f.vy > -180 && (f.vy = -Math.min(480, Math.abs(Yt) * .7 + 220)));
      const _isMusty = (Math.cos(u.angle) < -.15 && Math.abs(Math.sin(u.angle)) > .25 || Math.abs(u.angle) > 1.75) && u.isFlipping && !u.isGrounded && f.y < u.y + 15;
      if (_isMusty) {
        const _flDir = u.team === "blue" ? 1 : -1;
        f.vx = _flDir * Math.max(Math.abs(f.vx) + 650, 1150), f.vy = -Math.max(Math.abs(f.vy) + 450, 600), f.spin += _flDir * 25, Me.playMustyFlick(), emitMechanicEvent(s, u, { type: "musty", text: "⚡ MUSTY FLICK", color: "#a855f7" });
        for (let _i = 0; _i < 14; _i++)s.newParticles.push({ id: ++On, x: f.x, y: f.y, vx: _flDir * 300 + (Math.random() - .5) * 200, vy: -280 + (Math.random() - .5) * 200, life: .38, maxLife: .38, color: "#c084fc", size: 5, type: "spark" });
      }
      const _dLeft = f.x - At - f.radius, _dRight = Mt - f.x - f.radius, _dFloor = k - f.y - f.radius, _dCeil = f.y - Qt - f.radius, _carSpd = Math.hypot(u.vx, u.vy), _isPinchImpact = _carSpd > 300 || Math.abs(Yt) > 260;
      let _pType: string | null = null, _pVx = 0, _pVy = 0;
      if (_dLeft < 44 && u.vx < -140 && _isPinchImpact) {
        _pType = "wall";
        const _sp = Math.min(2650, Math.max(1450, (_carSpd + Math.abs(Yt)) * 1.85));
        _pVx = _sp * .92, _pVy = (f.y > hl / 2 ? -1 : 1) * _sp * .38;
      } else if (_dRight < 44 && u.vx > 140 && _isPinchImpact) {
        _pType = "wall";
        const _sp = Math.min(2650, Math.max(1450, (_carSpd + Math.abs(Yt)) * 1.85));
        _pVx = -_sp * .92, _pVy = (f.y > hl / 2 ? -1 : 1) * _sp * .38;
      } else if (_dFloor < 45 && u.vy > 190 && _isPinchImpact) {
        _pType = "ground";
        const _sp = Math.min(2500, Math.max(1400, (_carSpd + Math.abs(Yt)) * 1.75));
        _pVx = (u.vx >= 0 ? 1 : -1) * _sp * .92, _pVy = -_sp * .35;
      } else if (_dCeil < 45 && u.vy < -170 && _isPinchImpact) {
        _pType = "ceiling";
        const _sp = Math.min(2500, Math.max(1400, (_carSpd + Math.abs(Yt)) * 1.75));
        _pVx = (u.vx >= 0 ? 1 : -1) * _sp * .92, _pVy = _sp * .38;
      }
      if (_pType) {
        f.vx = _pVx, f.vy = _pVy, f.touchEffectTimer = .4;
        const _kmh = Math.round(Math.hypot(_pVx, _pVy) / 10 * 1.6);
        Me.playPinch(), emitMechanicEvent(s, u, { type: "pinch", text: "💥 " + (_pType === "wall" ? "KUXIR PINCH" : _pType === "ground" ? "GROUND PINCH" : "CEILING PINCH") + " (" + _kmh + " KM/H)", color: "#f43f5e", speedKmh: _kmh });
        for (let _i = 0; _i < 24; _i++) {
          const _ang = Math.random() * Math.PI * 2, _sp = 200 + Math.random() * 380;
          s.newParticles.push({ id: ++On, x: f.x, y: f.y, vx: Math.cos(_ang) * _sp, vy: Math.sin(_ang) * _sp, life: .42, maxLife: .42, color: _i % 2 === 0 ? "#f43f5e" : "#fb7185", size: 5, type: "spark" });
        }
      }
      if (!u.isGrounded && f.y < k - 120) {
        const _now = Date.now();
        _now - (u.lastAirTouchTime || 0) < 1600 ? (u.airTouches = (u.airTouches || 0) + 1, (u.airTouches === 3 || u.airTouches === 5) && emitMechanicEvent(s, u, { type: "air_dribble", text: "🌀 AIR DRIBBLE (" + u.airTouches + "x)", color: "#06b6d4" })) : u.airTouches = 1, u.lastAirTouchTime = _now;
        if (f.backboardRebound && _now - f.backboardRebound.time < 2800 && (f.backboardRebound.player === u.name || f.backboardRebound.targetTeam !== u.team)) {
          Me.playDoubleTap(), emitMechanicEvent(s, u, { type: "double_tap", text: "🎯 DOUBLE TAP", color: "#22c55e" }), f.backboardRebound = null;
        }
        if (f.psychoCandidate && _now - f.psychoCandidate.time < 4500 && (f.psychoCandidate.player === u.name || !u.isBot || Math.random() < .65)) {
          Me.playPsycho(), emitMechanicEvent(s, u, { type: "psycho", text: "🔮 PSYCHO REDIRECT (" + (Math.round(Math.hypot(f.vx, f.vy) / 10 * 1.6) || 95) + " KM/H)", color: "#ec4899" }), f.psychoCandidate = null;
        }
      } else u.isGrounded && (u.airTouches = 0);
      u.vx -= ot * Te * .15, u.vy -= Lt * Te * .15, f.lastTouchTeam = u.team, f.lastTouchPlayer = u.name, f.lastTouchTime = Date.now(), f.touchEffectTimer = .2, u.shots++;
      const W = Math.hypot(f.vx, f.vy) / 500;
      Me.playBallHit(W);
      const $ = u.team === "blue" ? "#38bdf8" : "#f97316";
      for (let bt = 0; bt < 10; bt++)s.newParticles.push({ id: ++On, x: f.x - ot * f.radius * .8, y: f.y - Lt * f.radius * .8, vx: ot * 200 + (Math.random() - .5) * 160, vy: Lt * 200 + (Math.random() - .5) * 160, life: .3, maxLife: .3, color: $, size: 4 + Math.random() * 4, type: "spark" });
    }
  }
}

function jv(u: any, f: any, r: any, s: any, y = !1, physicsMode = "rocket_league") {
  const m = { goalScored: null, demoEvents: [], newParticles: [], mechanicEvents: [] };
  if (y || s <= 0) return m;
  const isLegacy = (physicsMode || activePhysicsMode) === "legacy";
  if (physicsMode && physicsMode !== activePhysicsMode) {
    syncPhysicsGlobals(physicsMode);
  }
  const g = Math.min(s, .033);
  for (const p of r) p.active || (p.cooldownTimer -= g, p.cooldownTimer <= 0 && (p.active = !0, p.cooldownTimer = 0));
  for (const p of u) {
    if (p.isDemoed) {
      p.demoRespawnTimer -= g, p.demoRespawnTimer <= 0 && Gv(p);
      continue;
    }
    if (isLegacy) {
      Cv_legacy(p, g, m);
    } else {
      Cv(p, g, m);
    }
    Bv(p, r);
  }
  if (isLegacy) {
    Dv_legacy(f, g, m);
  } else {
    Dv(f, g, m);
  }
  for (const p of u) {
    if (!p.isDemoed) {
      if (isLegacy) {
        Uv_legacy(p, f, g, m);
      } else {
        Uv(p, f, g, m);
      }
    }
  }
  for (let p = 0; p < u.length; p++) {
    for (let A = p + 1; A < u.length; A++) {
      const C = u[p], z = u[A];
      !C.isDemoed && !z.isDemoed && Hv(C, z, m);
    }
  }
  return qv(f, m), m;
}
function Cv(u: any, f: number, r: any) {
  // 1. Dodge Flip tumble
  if (u.isFlipping) {
    u.flipTimer += f;
    const flipDir = u.flipDirection.x >= 0 ? 1 : -1;
    u.angle += flipDir * (Math.PI * 2 / qh) * f;
    if (u.flipTimer >= qh) {
      u.isFlipping = false;
      u.flipTimer = 0;
    }
  }

  if (u.jumpCount === 1 && !u.isGrounded && !u.hasFlipReset) {
    u.flipWindowTimer += f;
  }

  // Track ceiling drive duration & natural gravity detach when idle
  if (u.surfaceType === "ceiling") {
    u.ceilingTimer = (u.ceilingTimer || 0) + f;
    const isThrottle = u.input.throttleForward || u.input.throttleReverse || u.input.steerLeft || u.input.steerRight || u.input.boost;
    const spd = Math.abs(u.vx);
    if (!isThrottle && spd < 100) {
      u.ceilingIdleTimer = (u.ceilingIdleTimer || 0) + f;
      if (u.ceilingIdleTimer > 0.4) {
        // Naturally fall off ceiling by gravity if stopped / idle!
        u.isGrounded = false;
        u.surfaceType = "air";
        u.vy += 150;
        u.ceilingIdleTimer = 0;
      }
    } else {
      u.ceilingIdleTimer = 0;
    }
  } else {
    u.ceilingTimer = 0;
    u.ceilingIdleTimer = 0;
  }

  // Update surface collision
  Rv(u);

  if (u.isGrounded) {
    // Wavedash detection on landing
    if (u.isFlipping && u.flipTimer < 0.3) {
      u.isFlipping = false;
      u.flipTimer = 0;
      const dashDir = u.flipDirection.x >= 0 ? 1 : -1;
      u.vx = dashDir * Math.max(Math.abs(u.vx), 720);
      u.isSupersonic = true;
      u.supersonicTimer = 1.2;
      Me.playWavedash();
      emitMechanicEvent(r, u, {
        type: "wavedash",
        text: "💨 WAVEDASH",
        color: "#38bdf8"
      });
      for (let k = 0; k < 8; k++) {
        r.newParticles.push({
          id: ++On,
          x: u.x + (Math.random() - 0.5) * u.width,
          y: u.y + u.height / 2,
          vx: -dashDir * 200 + (Math.random() - 0.5) * 80,
          vy: -50 - Math.random() * 80,
          life: 0.25,
          maxLife: 0.25,
          color: "#fbbf24",
          size: 3,
          type: "spark"
        });
      }
    }

    u.jumpCount = 0;
    u.flipWindowTimer = 0;
    u.isFlipping = false;
    u.hasFlipReset = false;
    u.airRollInverted = false;

    // Normal pointing INTO the field
    const N = u.surfaceNormal;
    // Consistent surface tangents everywhere around the entire arena perimeter:
    // T_ccw moves counter-clockwise along boundary: (-N.y, N.x)
    // T_cw moves clockwise along boundary: (N.y, -N.x)
    const T_ccw = { x: -N.y, y: N.x };
    const T_cw = { x: N.y, y: -N.x };

    // Slope gravity: on curved slopes or vertical walls, gravity naturally pulls down (+Y)
    if (u.surfaceType === "curve" || u.surfaceType === "left_wall" || u.surfaceType === "right_wall") {
      // Downward tangent component
      const downTangent = T_ccw.y > 0 ? T_ccw : T_cw;
      const gravFactor = Math.abs(downTangent.y); // 1 on vertical wall, 0.707 on 45 deg slope, 0 on floor
      u.vx += downTangent.x * (pv * 0.75 * gravFactor) * f;
      u.vy += downTangent.y * (pv * 0.75 * gravFactor) * f;
    }

    // Determine driving direction along surface:
    let moveDir: { x: number; y: number } | null = null;
    let driveSpeed = 0;

    if (u.input.steerRight && !u.input.steerLeft) {
      // Move rightward in field: choose tangent pointing toward +X (or up on right wall)
      moveDir = (T_ccw.x > 0.05 || (Math.abs(T_ccw.x) <= 0.05 && T_ccw.y < 0)) ? T_ccw : T_cw;
      driveSpeed = ju; // 1000
    } else if (u.input.steerLeft && !u.input.steerRight) {
      // Move leftward in field: choose tangent pointing toward -X (or up on left wall)
      moveDir = (T_ccw.x < -0.05 || (Math.abs(T_ccw.x) <= 0.05 && T_ccw.y < 0)) ? T_ccw : T_cw;
      driveSpeed = ju;
    } else if (u.input.throttleForward) {
      const curFwd = { x: Math.cos(u.angle), y: Math.sin(u.angle) };
      const dot = curFwd.x * T_ccw.x + curFwd.y * T_ccw.y;
      moveDir = dot >= 0 ? T_ccw : T_cw;
      driveSpeed = ju;
    } else if (u.input.throttleReverse) {
      const curFwd = { x: Math.cos(u.angle), y: Math.sin(u.angle) };
      const dot = curFwd.x * T_ccw.x + curFwd.y * T_ccw.y;
      moveDir = dot >= 0 ? T_cw : T_ccw;
      driveSpeed = 500;
    }

    if (moveDir && driveSpeed > 0) {
      u.vx += moveDir.x * driveSpeed * f;
      u.vy += moveDir.y * driveSpeed * f;
      const targetAngle = Math.atan2(moveDir.y, moveDir.x);
      u.angle = Lh(u.angle, targetAngle, 22 * f);
    } else {
      // Ground rolling friction (0.985 restores original smooth coasting!)
      const friction = wh;
      u.vx *= Math.pow(friction, f * 60);
      u.vy *= Math.pow(friction, f * 60);
      // NOTE: Direction does NOT automatically change when sliding down walls under gravity!
      // It changes ONLY when the player presses left, right, or throttle!
    }
    // Always keep facing accurately synchronized while grounded:
    u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    if (u.surfaceType === "floor") {
      u.airRollInverted = false;
    }

    // Jump off surface (impulse along surface normal)
    if (u.input.jump && u.canJump) {
      u.canJump = false;
      u.isGrounded = false;
      u.jumpCount = 1;
      u.jumpHoldTimer = 0;
      u.surfaceType = "air";
      u.vx += N.x * cc;
      u.vy += N.y * cc;
      u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
      u.airRollInverted = false;
      Me.playJump();
    }
  } else {
    // AIR CONTROLS: Jumping, aerial boost, free flight
    u.vy += pv * f;
    u.vx *= Math.pow(Dh, f * 60);
    u.vy *= Math.pow(Dh, f * 60);

    // Maintain ground facing in air
    if (u.facing === undefined) {
      u.facing = Math.cos(u.angle) >= 0 ? 1 : -1;
    }

    // Smooth continuous air rotation like in Rocket League!
    // Holding A or D rotates the car smoothly for aerials and flip resets (NO SNAP!)
    let g = 0;
    if (u.input.steerLeft || u.input.pitchUp) g -= 1;
    if (u.input.steerRight || u.input.pitchDown) g += 1;
    if (!u.isFlipping) {
      u.angle += g * Av * f;
    }

    // Q / E Instant Air Roll: instantly flips 180° around roll axis (wheels <-> ceiling)!
    // If wheels were facing the ball, pressing Q or E instantly makes the ceiling of the car face the ball!
    // Pressing Q or E again instantly flips back to wheels facing the ball!
    if ((u.input.airRollLeft && !u._prevAirRollLeft) || (u.input.airRollRight && !u._prevAirRollRight)) {
      u.airRollInverted = !u.airRollInverted;
      Me.playAirRoll && Me.playAirRoll();
    }
    u._prevAirRollLeft = !!u.input.airRollLeft;
    u._prevAirRollRight = !!u.input.airRollRight;

    // Jump hold boost (first jump extension)
    if (u.input.jump && u.jumpCount === 1 && u.jumpHoldTimer < Ev) {
      u.jumpHoldTimer += f;
      const p = { x: Math.sin(u.angle), y: -Math.cos(u.angle) };
      u.vx += p.x * Gh * f;
      u.vy += p.y * Gh * f;
    }

    // Dodge flip in air
    if (u.input.jump && u.canJump && (u.jumpCount === 0 || u.hasFlipReset || (u.jumpCount === 1 && u.flipWindowTimer < _v))) {
      u.canJump = false;
      u.jumpCount = 2;
      u.hasFlipReset = false;

      let ax = 0, ay = 0;
      if (u.input.steerRight || u.input.throttleForward) ax += 1;
      if (u.input.steerLeft || u.input.throttleReverse) ax -= 1;
      if (u.input.pitchUp) ay -= 1;
      if (u.input.pitchDown) ay += 1;

      if (ax !== 0 || ay !== 0) {
        const len = Math.hypot(ax, ay) || 1;
        const nx = ax / len, ny = ay / len;
        u.vy *= 0.15;
        u.vx += nx * Bh;
        u.vy += ny * (Bh * 0.7);
        u.isFlipping = true;
        u.flipTimer = 0;
        u.flipDirection = { x: nx, y: ny };
        Me.playDodgeFlip();

        for (let k = 0; k < 8; k++) {
          r.newParticles.push({
            id: ++On,
            x: u.x,
            y: u.y,
            vx: -nx * 300 + (Math.random() - 0.5) * 150,
            vy: -ny * 300 + (Math.random() - 0.5) * 150,
            life: 0.35,
            maxLife: 0.35,
            color: "#38bdf8",
            size: 4 + Math.random() * 3,
            type: "spark"
          });
        }
      } else {
        u.vy = Math.min(u.vy - cc * 1.05, -cc * 1.15);
        Me.playJump();
      }
    }
  }

  if (!u.input.jump) {
    u.canJump = true;
  }

  // Rocket Boost
  u.isBoosting = false;
  if (u.input.boost && u.boost > 0) {
    u.isBoosting = true;
    u.boost = Math.max(0, u.boost - Mv * f);
    const fwd = { x: Math.cos(u.angle), y: Math.sin(u.angle) };
    const inAir = !u.isGrounded;
    const accel = inAir ? Nv : Sv;
    u.vx += fwd.x * accel * f;
    u.vy += fwd.y * accel * f;

    const tailX = u.x - fwd.x * (u.width / 2);
    const tailY = u.y - fwd.y * (u.width / 2);
    const count = inAir ? 3 : 2;
    for (let d = 0; d < count; d++) {
      r.newParticles.push({
        id: ++On,
        x: tailX + (Math.random() - 0.5) * 6,
        y: tailY + (Math.random() - 0.5) * 6,
        vx: -fwd.x * (450 + Math.random() * 350) + (Math.random() - 0.5) * 90,
        vy: -fwd.y * (450 + Math.random() * 350) + (Math.random() - 0.5) * 90,
        life: inAir ? 0.3 : 0.25,
        maxLife: inAir ? 0.3 : 0.25,
        color: u.team === "blue"
          ? (Math.random() > 0.4 ? "#38bdf8" : "#60a5fa")
          : (Math.random() > 0.4 ? "#f97316" : "#fbbf24"),
        size: (inAir ? 6 : 5) + Math.random() * 4,
        type: "boost"
      });
    }
  }

  // Speed clamping
  const spd = Math.hypot(u.vx, u.vy);
  const maxSpd = u.isBoosting ? bv : xv;
  if (spd > maxSpd) {
    const ratio = maxSpd / spd;
    u.vx *= ratio;
    u.vy *= ratio;
  }

  // Supersonic state
  if (Math.hypot(u.vx, u.vy) >= Tv) {
    if (!u.isSupersonic) Me.playSupersonicBoom();
    u.isSupersonic = true;
    u.supersonicTimer += f;
    if (Math.random() < 0.6) {
      r.newParticles.push({
        id: ++On,
        x: u.x - Math.cos(u.angle) * 20,
        y: u.y - Math.sin(u.angle) * 20,
        vx: u.vx * 0.1,
        vy: u.vy * 0.1,
        life: 0.28,
        maxLife: 0.28,
        color: "#ffffff",
        size: 3.5,
        type: "supersonic"
      });
    }
  } else {
    u.isSupersonic = false;
    u.supersonicTimer = 0;
  }

  u.x += u.vx * f;
  u.y += u.vy * f;
}

function Rv(u: any) {
  const f = u.height / 2;
  const wheelContact = f + 0.5; // 14.5px
  let s = false, y = { x: 0, y: -1 }, m = "air";

  // 1. FLOOR: from (At + F) to (Mt - F)
  if (u.x >= At + F && u.x <= Mt - F && u.y + wheelContact >= k) {
    u.y = k - wheelContact;
    u.vy > 0 && (u.vy = 0);
    s = true;
    y = { x: 0, y: -1 };
    m = "floor";
  }

  // 2. CEILING: from (At + F) to (Mt - F)
  if (u.x >= At + F && u.x <= Mt - F && u.y - wheelContact <= Qt) {
    u.y = Qt + wheelContact;
    if (u.vy < 0) u.vy = 0;

    // A car can ONLY grab the ceiling if its WHEELS are touching the ceiling!
    // In our coordinate system, down points towards the wheels.
    // If wheels point UP towards the ceiling, downY is negative (downY < -0.25).
    // If car's roof points UP towards ceiling, downY is positive (downY > 0).
    const fwdX = Math.cos(u.angle);
    const rollMult = u.airRollInverted ? -1 : 1;
    const downY = (fwdX >= 0 ? fwdX : -fwdX) * rollMult;
    const wheelsTouchCeiling = downY < -0.25 || (u.isGrounded && (u.surfaceType === "ceiling" || u.surfaceType === "curve"));

    if (wheelsTouchCeiling) {
      s = true;
      y = { x: 0, y: 1 };
      m = "ceiling";
    }
  }

  // 3. MAIN ARENA WALLS & CORNERS
  if (u.x >= At - 6 && u.x <= Mt + 6) {
    const onLeftWallUpper = u.y >= Qt + F && u.y <= le.yMin;
    const onLeftWallLower = u.y >= le.yMax && u.y <= k - F;
    const onRightWallUpper = u.y >= Qt + F && u.y <= ae.yMin;
    const onRightWallLower = u.y >= ae.yMax && u.y <= k - F;

    if (onLeftWallUpper || onLeftWallLower) {
      if (u.x - wheelContact <= At) {
        u.x = At + wheelContact;
        u.vx < 0 && (u.vx = 0);
        s = true;
        y = { x: 1, y: 0 };
        m = "left_wall";
      }
    }

    if (onRightWallUpper || onRightWallLower) {
      if (u.x + wheelContact >= Mt) {
        u.x = Mt - wheelContact;
        u.vx > 0 && (u.vx = 0);
        s = true;
        y = { x: -1, y: 0 };
        m = "right_wall";
      }
    }

    // Corner curves (Radius F = 160)
    const contactR = F - wheelContact;
    const curveAdhere = (u.surfaceType === "curve" && u.isGrounded) ? 8 : 0;

    // Bottom-Left Curve: center (At + F, k - F) = (280, 790)
    const blA = At + F, blC = k - F;
    if (u.x < blA && u.y > blC) {
      const U = u.x - blA, Tt = u.y - blC, at = Math.hypot(U, Tt);
      if (at >= contactR - curveAdhere && at > 0) {
        const Ht = -U / at, ot = -Tt / at;
        u.x = blA + (U / at) * contactR;
        u.y = blC + (Tt / at) * contactR;
        s = true;
        y = { x: Ht, y: ot };
        m = "curve";
        const vDotN = u.vx * Ht + u.vy * ot;
        if (vDotN < 0) {
          u.vx -= vDotN * Ht;
          u.vy -= vDotN * ot;
        }
      }
    }

    // Bottom-Right Curve: center (Mt - F, k - F) = (1720, 790)
    const brA = Mt - F, brC = k - F;
    if (u.x > brA && u.y > brC) {
      const U = u.x - brA, Tt = u.y - brC, at = Math.hypot(U, Tt);
      if (at >= contactR - curveAdhere && at > 0) {
        const Ht = -U / at, ot = -Tt / at;
        u.x = brA + (U / at) * contactR;
        u.y = brC + (Tt / at) * contactR;
        s = true;
        y = { x: Ht, y: ot };
        m = "curve";
        const vDotN = u.vx * Ht + u.vy * ot;
        if (vDotN < 0) {
          u.vx -= vDotN * Ht;
          u.vy -= vDotN * ot;
        }
      }
    }

    // Top-Left Curve: center (At + F, Qt + F) = (280, 280)
    const tlA = At + F, tlC = Qt + F;
    if (u.x < tlA && u.y < tlC) {
      const U = u.x - tlA, Tt = u.y - tlC, at = Math.hypot(U, Tt);
      if (at >= contactR - curveAdhere && at > 0) {
        const Ht = -U / at, ot = -Tt / at;
        u.x = tlA + (U / at) * contactR;
        const fwdX = Math.cos(u.angle);
        const fwdY = Math.sin(u.angle);
        const rollMult = u.airRollInverted ? -1 : 1;
        const downX = (fwdX >= 0 ? -fwdY : fwdY) * rollMult;
        const downY = (fwdX >= 0 ? fwdX : -fwdX) * rollMult;
        // Wheels must face surface normal (-Ht, -ot) or already grounded
        const wheelsTouch = u.isGrounded || (downX * (-Ht) + downY * (-ot) > 0.15);
        if (wheelsTouch) {
          s = true;
          y = { x: Ht, y: ot };
          m = "curve";
        }
        const vDotN = u.vx * Ht + u.vy * ot;
        if (vDotN < 0) {
          u.vx -= vDotN * Ht;
          u.vy -= vDotN * ot;
        }
      }
    }

    // Top-Right Curve: center (Mt - F, Qt + F) = (1720, 280)
    const trA = Mt - F, trC = Qt + F;
    if (u.x > trA && u.y < trC) {
      const U = u.x - trA, Tt = u.y - trC, at = Math.hypot(U, Tt);
      if (at >= contactR - curveAdhere && at > 0) {
        const Ht = -U / at, ot = -Tt / at;
        u.x = trA + (U / at) * contactR;
        u.y = trC + (Tt / at) * contactR;
        const fwdX = Math.cos(u.angle);
        const fwdY = Math.sin(u.angle);
        const rollMult = u.airRollInverted ? -1 : 1;
        const downX = (fwdX >= 0 ? -fwdY : fwdY) * rollMult;
        const downY = (fwdX >= 0 ? fwdX : -fwdX) * rollMult;
        const wheelsTouch = u.isGrounded || (downX * (-Ht) + downY * (-ot) > 0.15);
        if (wheelsTouch) {
          s = true;
          y = { x: Ht, y: ot };
          m = "curve";
        }
        const vDotN = u.vx * Ht + u.vy * ot;
        if (vDotN < 0) {
          u.vx -= vDotN * Ht;
          u.vy -= vDotN * ot;
        }
      }
    }
  } else if (u.x < At - 6) {
    // Inside Left Net
    const inBM = u.y > le.yMin && u.y < le.yMax;
    if (u.x - wheelContact <= At - le.depth) {
      u.x = At - le.depth + wheelContact;
      u.vx < 0 && (u.vx = 0);
      s = true;
      y = { x: 1, y: 0 };
      m = "left_wall";
    }
    if (u.y - wheelContact <= le.yMin) {
      u.y = le.yMin + wheelContact;
      if (u.vy < 0) u.vy = 0;
      s = false;
      m = "air";
    }
    if (u.y + wheelContact >= le.yMax) {
      u.y = le.yMax - wheelContact;
      u.vy > 0 && (u.vy = 0);
      s = true;
      y = { x: 0, y: -1 };
      m = "floor";
    }
    if (u.x + wheelContact >= At && !inBM) {
      u.x = At - wheelContact;
      u.vx > 0 && (u.vx = 0);
    }
  } else if (u.x > Mt + 6) {
    // Inside Right Net
    const inOM = u.y > ae.yMin && u.y < ae.yMax;
    if (u.x + wheelContact >= Mt + ae.depth) {
      u.x = Mt + ae.depth - wheelContact;
      u.vx > 0 && (u.vx = 0);
      s = true;
      y = { x: -1, y: 0 };
      m = "right_wall";
    }
    if (u.y - wheelContact <= ae.yMin) {
      u.y = ae.yMin + wheelContact;
      if (u.vy < 0) u.vy = 0;
      s = false;
      m = "air";
    }
    if (u.y + wheelContact >= ae.yMax) {
      u.y = ae.yMax - wheelContact;
      u.vy > 0 && (u.vy = 0);
      s = true;
      y = { x: 0, y: -1 };
      m = "floor";
    }
    if (u.x - wheelContact <= Mt && !inOM) {
      u.x = Mt + wheelContact;
      u.vx < 0 && (u.vx = 0);
    }
  }

  fc(u, At - zn, le.yMin);
  fc(u, At - zn, le.yMax);
  fc(u, Mt + zn, ae.yMin);
  fc(u, Mt + zn, ae.yMax);

  u.isGrounded = s;
  u.surfaceNormal = y;
  u.surfaceType = m;
}

function fc(u:any,f:any,r:any){
  if(u.surfaceType==="left_wall"||u.surfaceType==="right_wall"||u.surfaceType==="curve")return;
  const s=u.x-f,y=u.y-r,m=Math.hypot(s,y),g=zn+u.height/2;
  if(m<g&&m>0){
    const p=s/m,A=y/m;
    u.x=f+p*g,u.y=r+A*g;
    const C=u.vx*p+u.vy*A;
    C<0&&(u.vx-=1.3*C*p,u.vy-=1.3*C*A,Me.playCrossbar())
  }
}
function Dv(u:any,f:any,r:any){
  u.vy+=Ph*f,u.vx*=Math.pow(Uh,f*60),u.vy*=Math.pow(Uh,f*60),u.x+=u.vx*f,u.y+=u.vy*f,u.spin+=u.vx/u.radius*f,u.touchEffectTimer>0&&(u.touchEffectTimer-=f),u.trail=u.trail||[],u.trail.push({x:u.x,y:u.y,vx:u.vx,vy:u.vy,time:Date.now()});
  const _maxTr=Math.hypot(u.vx,u.vy)>800?30:20;
  u.trail.length>_maxTr&&u.trail.splice(0,u.trail.length-_maxTr);
  if(u.y+u.radius>=k){u.y=k-u.radius,u.vy=-u.vy*.60;if(Math.abs(u.vy)<25)u.vy=0;u.vx*=.96}
  if(u.y-u.radius<=Qt){u.y=Qt+u.radius,u.vy=-u.vy*.65}
  const inBM=u.y>le.yMin&&u.y<le.yMax,inOM=u.y>ae.yMin&&u.y<ae.yMax;
  if(u.x>=At&&u.x<=Mt){
    if(u.x-u.radius<=At&&!inBM){
      u.x=At+u.radius,u.vx=-u.vx*.65;
      if(u.y<le.yMin){
        u.backboardRebound={time:Date.now(),targetTeam:"blue",player:u.lastTouchPlayer};
        if(u.lastTouchTeam==="blue"){
          u.psychoCandidate={time:Date.now(),player:u.lastTouchPlayer,team:"blue",wall:"blue",sourceWall:"blue"};
        }
      }
    }
    if(u.x+u.radius>=Mt&&!inOM){
      u.x=Mt-u.radius,u.vx=-u.vx*.65;
      if(u.y<ae.yMin){
        u.backboardRebound={time:Date.now(),targetTeam:"orange",player:u.lastTouchPlayer};
        if(u.lastTouchTeam==="orange"){
          u.psychoCandidate={time:Date.now(),player:u.lastTouchPlayer,team:"orange",wall:"orange",sourceWall:"orange"};
        }
      }
    }
    wv(u);
  }else if(u.x<At){
    if(u.x-u.radius<=At-le.depth){u.x=At-le.depth+u.radius,u.vx=-u.vx*.35}
    if(u.y-u.radius<=le.yMin){u.y=le.yMin+u.radius,u.vy=Math.abs(u.vy)*.35}
    if(u.y+u.radius>=le.yMax){u.y=le.yMax-u.radius,u.vy=-Math.abs(u.vy)*.35}
    if(u.x+u.radius>=At&&!inBM){u.x=At-u.radius,u.vx=-Math.abs(u.vx)*.5}
  }else if(u.x>Mt){
    if(u.x+u.radius>=Mt+ae.depth){u.x=Mt+ae.depth-u.radius,u.vx=-u.vx*.35}
    if(u.y-u.radius<=ae.yMin){u.y=ae.yMin+u.radius,u.vy=Math.abs(u.vy)*.35}
    if(u.y+u.radius>=ae.yMax){u.y=ae.yMax-u.radius,u.vy=-Math.abs(u.vy)*.35}
    if(u.x-u.radius<=Mt&&!inOM){u.x=Mt+u.radius,u.vx=Math.abs(u.vx)*.5}
  }
  sc(u,At-zn,le.yMin,r),sc(u,At-zn,le.yMax,r),sc(u,Mt+zn,ae.yMin,r),sc(u,Mt+zn,ae.yMax,r);
  const m=Math.hypot(u.vx,u.vy);
  if(m>Hh){const g=Hh/m;u.vx*=g,u.vy*=g}
}
function sc(u:any,f:any,r:any,s:any){
  const y=u.x-f,m=u.y-r,g=Math.hypot(y,m),p=zn+u.radius;
  if(g<p&&g>0){
    const A=y/g,C=m/g;
    u.x=f+A*p,u.y=r+C*p;
    const z=u.vx*A+u.vy*C;
    if(z<0){
      u.vx-=1.5*z*A,u.vy-=1.5*z*C,Me.playCrossbar();
      for(let N=0;N<6;N++)s.newParticles.push({id:++On,x:f+A*zn,y:r+C*zn,vx:A*150+(Math.random()-.5)*100,vy:C*150+(Math.random()-.5)*100,life:.25,maxLife:.25,color:"#facc15",size:3,type:"spark"})
    }
  }
}
function wv(u:any){
  if(u.x<At||u.x>Mt)return;
  const f=[{cx:At+F,cy:Qt+F,minX:At,maxX:At+F,minY:0,maxY:Qt+F},{cx:Mt-F,cy:Qt+F,minX:Mt-F,maxX:Mt,minY:0,maxY:Qt+F},{cx:At+F,cy:k-F,minX:At,maxX:At+F,minY:k-F,maxY:hl},{cx:Mt-F,cy:k-F,minX:Mt-F,maxX:Mt,minY:k-F,maxY:hl}];
  for(const r of f)if(u.x>=r.minX&&u.x<=r.maxX&&u.y>=r.minY&&u.y<=r.maxY){const s=u.x-r.cx,y=u.y-r.cy,m=Math.hypot(s,y),g=F-u.radius;if(m>g&&m>0){const p=s/m,A=y/m;u.x=r.cx+p*g,u.y=r.cy+A*g;const C=u.vx*p+u.vy*A;C>0&&(u.vx-=1.4*C*p,u.vy-=1.4*C*A)}}
}
function Uv(u:any,f:any,r:number,s:any){
  const _now=Date.now(),prevVx=f.vx,prevVy=f.vy;
  const y=Math.cos(u.angle),m=Math.sin(u.angle);
  const g=f.x-u.x,p=f.y-u.y;
  const A=g*y+p*m;
  const isNoseLeft = u.facing !== undefined ? u.facing === -1 : Math.cos(u.angle) < 0;
  const lateralSign = (isNoseLeft ? -1 : 1) * (u.airRollInverted ? -1 : 1);
  const C=(-g*m+p*y)*lateralSign;
  const z=u.width/2,N=u.height/2;
  const D=Math.max(-z,Math.min(z,A));
  const X=Math.max(-N,Math.min(N,C));
  const tt=A-D,I=C-X;
  const U=Math.hypot(tt,I);

  if(U<f.radius){
    const Tt=f.radius-(U||.001);
    let at=tt/(U||1),Ht=I/(U||1);
    U===0&&(at=0,Ht=-1);
    const ot=at*y-Ht*m*lateralSign;
    const Lt=at*m+Ht*y*lateralSign;

    f.x+=ot*Tt;
    f.y+=Lt*Tt;

    const isRoof=Ht<-.45&&Math.abs(A)<z*1.25;
    const isWheels=Ht>.45&&Math.abs(A)<z*.95;
    const isFront=at>.45||(A>z*.5);
    const isRear=at<-.45;

    if(isWheels){
      u.jumpCount=0;
      u.flipWindowTimer=0;
      u.canJump=!0;
      if(!u.isGrounded&&!u.hasFlipReset){
        u.hasFlipReset=!0;
        Me.playFlipReset();
        emitMechanicEvent(s, u, {type:"flip_reset",text:"✨ FLIP RESET",color:"#f59e0b"});
        for(let _i=0;_i<12;_i++)s.newParticles.push({id:++On,x:u.x+(Math.random()-.5)*u.width,y:u.y+(Math.random()-.5)*u.height,vx:(Math.random()-.5)*180,vy:(Math.random()-.5)*180,life:.35,maxLife:.35,color:"#fbbf24",size:4,type:"spark"});
      }
    }

    const relVx=f.vx-u.vx;
    const relVy=f.vy-u.vy;
    const vn=relVx*ot+relVy*Lt;
    const isNearFloor=f.y>=k-Cu-18&&u.isGrounded&&u.surfaceType==="floor";

    if(isRoof){
      if(u.isFlipping&&u.flipTimer<.3){
        const flipDirX=u.flipDirection.x||(Math.cos(u.angle)>=0?1:-1);
        const flickVx=u.vx+flipDirX*420;
        const flickVy=Math.min(-260,u.vy+(u.flipDirection.y||-.4)*320-180);
        f.vx=flickVx;
        f.vy=flickVy;
        f.spin+=flipDirX*25;
        Me.playMustyFlick();
        emitMechanicEvent(s, u, {type:"flick",text:"⚡ FLICK SHOT",color:"#a855f7"});
        for(let _i=0;_i<12;_i++)s.newParticles.push({id:++On,x:f.x,y:f.y,vx:flipDirX*240+(Math.random()-.5)*120,vy:-200+(Math.random()-.5)*120,life:.35,maxLife:.35,color:"#c084fc",size:5,type:"spark"});
      }else{
        if(vn<0){
          const roofRestitution=Math.abs(vn)>160?.2:.05;
          const Te=-(1+roofRestitution)*vn;
          f.vx+=ot*Te;
          f.vy+=Lt*Te;
        }
        const grip=u.isGrounded?18:10;
        f.vx+=(u.vx-f.vx)*Math.min(1,grip*r);
        const rollTilt=(A/z)*110*r;
        f.vx+=rollTilt;
        if(u.vy<0&&f.vy>u.vy){
          f.vy=u.vy;
        }
      }
    }else if(isNearFloor&&isFront&&!u.isFlipping){
      const carForwardDir=Math.cos(u.angle)>=0?1:-1;
      const approachSpd=Math.abs(vn);
      if(approachSpd<160&&!u.isSupersonic){
        f.y=k-Cu;
        f.vy=0;
        f.vx=u.vx+carForwardDir*Math.max(15,Math.abs(u.vx)*.06);
      }else{
        const hitEnergy=Math.min(700,Math.max(180,approachSpd*1.3+(u.isSupersonic?180:0)));
        f.vx=u.vx*.4+ot*hitEnergy;
        const chipUp=Math.min(480,Math.max(120,hitEnergy*.55));
        f.vy=Math.min(f.vy,-chipUp);
      }
    }else{
      if(vn<0){
        const isAirborne = !u.isGrounded;
        const isGentleAirTouch = isAirborne && isFront && Math.abs(vn) < 280 && !u.isSupersonic;
        let e = isGentleAirTouch ? 0.12 : (isFront ? (isAirborne ? 0.40 : 0.70) : (isWheels ? 0.15 : (isRear ? 0.45 : 0.55)));
        let Te=-(1+e)*vn;
        f.vx+=ot*Te;
        f.vy+=Lt*Te;
        if(u.isFlipping){
          f.vx+=u.flipDirection.x*280;
          f.vy+=u.flipDirection.y*220;
        }
        if(u.isSupersonic&&isFront){
          f.vx+=y*220;
          f.vy+=m*220;
        }
        if(isAirborne && (isFront || isRoof) && !u.isFlipping){
          f.vx += (u.vx - f.vx) * Math.min(1, 14 * r);
          if(u.vy < 0){
            if(f.vy > u.vy){
              f.vy += (u.vy - f.vy) * Math.min(1, 16 * r);
            }
            if(u.isBoosting){
              f.vy += u.vy * 0.18 * Math.min(1, 12 * r);
            }
          }
        }
        u.vx-=ot*Te*.06;
        u.vy-=Lt*Te*.06;
      }
    }

    const _isMusty=(Math.cos(u.angle)<-.15&&Math.abs(Math.sin(u.angle))>.25||Math.abs(u.angle)>1.75)&&u.isFlipping&&!u.isGrounded&&f.y<u.y+15;
    if(_isMusty){
      const _flDir=u.team==="blue"?1:-1;
      f.vx=_flDir*Math.max(Math.abs(f.vx)+480,850);
      f.vy=-Math.max(Math.abs(f.vy)+320,480);
      f.spin+=_flDir*25;
      Me.playMustyFlick();
      emitMechanicEvent(s, u, {type:"musty",text:"⚡ MUSTY FLICK",color:"#a855f7"});
      for(let _i=0;_i<14;_i++)s.newParticles.push({id:++On,x:f.x,y:f.y,vx:_flDir*250+(Math.random()-.5)*160,vy:-220+(Math.random()-.5)*160,life:.38,maxLife:.38,color:"#c084fc",size:5,type:"spark"});
    }

    const _dLeft=f.x-At-f.radius,_dRight=Mt-f.x-f.radius,_dFloor=k-f.y-f.radius,_dCeil=f.y-Qt-f.radius;
    const _carSpd=Math.hypot(u.vx,u.vy);
    const _isPinchImpact=_carSpd>220||Math.abs(vn)>180;
    let _pType=null,_pVx=0,_pVy=0;
    if(_dLeft<44&&u.vx<-100&&_isPinchImpact){
      _pType="wall";
      const _sp=Math.min(1800,Math.max(1050,(_carSpd+Math.abs(vn))*1.6));
      _pVx=_sp*.92;_pVy=(f.y>hl/2?-1:1)*_sp*.38;
    }else if(_dRight<44&&u.vx>100&&_isPinchImpact){
      _pType="wall";
      const _sp=Math.min(1800,Math.max(1050,(_carSpd+Math.abs(vn))*1.6));
      _pVx=-_sp*.92;_pVy=(f.y>hl/2?-1:1)*_sp*.38;
    }else if(_dFloor<45&&u.vy>140&&_isPinchImpact){
      _pType="ground";
      const _sp=Math.min(1700,Math.max(1000,(_carSpd+Math.abs(vn))*1.55));
      _pVx=(u.vx>=0?1:-1)*_sp*.92;_pVy=-_sp*.35;
    }else if(_dCeil<45&&u.vy<-130&&_isPinchImpact){
      _pType="ceiling";
      const _sp=Math.min(1700,Math.max(1000,(_carSpd+Math.abs(vn))*1.55));
      _pVx=(u.vx>=0?1:-1)*_sp*.92;_pVy=_sp*.38;
    }
    if(_pType){
      f.vx=_pVx;f.vy=_pVy;f.touchEffectTimer=.4;
      const _kmh=Math.round(Math.hypot(_pVx,_pVy)/10*1.6);
      Me.playPinch();
      emitMechanicEvent(s, u, {type:"pinch",text:"💥 "+(_pType==="wall"?"KUXIR PINCH":_pType==="ground"?"GROUND PINCH":"CEILING PINCH")+" ("+_kmh+" KM/H)",color:"#f43f5e",speedKmh:_kmh});
      for(let _i=0;_i<20;_i++){
        const _ang=Math.random()*Math.PI*2,_sp=150+Math.random()*300;
        s.newParticles.push({id:++On,x:f.x,y:f.y,vx:Math.cos(_ang)*_sp,vy:Math.sin(_ang)*_sp,life:.42,maxLife:.42,color:_i%2===0?"#f43f5e":"#fb7185",size:5,type:"spark"});
      }
    }

    if(!u.isGrounded&&f.y<k-120){
      const _now=Date.now();
      _now-(u.lastAirTouchTime||0)<1600?(u.airTouches=(u.airTouches||0)+1,(u.airTouches===3||u.airTouches===5)&&emitMechanicEvent(s, u, {type:"air_dribble",text:"🌀 AIR DRIBBLE ("+u.airTouches+"x)",color:"#06b6d4"})):u.airTouches=1,u.lastAirTouchTime=_now;
      if(f.backboardRebound&&_now-f.backboardRebound.time<2800&&(f.backboardRebound.player===u.name||f.backboardRebound.targetTeam!==u.team)){
        Me.playDoubleTap();
        emitMechanicEvent(s, u, {type:"double_tap",text:"🎯 DOUBLE TAP",color:"#22c55e"});
        f.backboardRebound=null;
      }
      if(f.psychoCandidate&&_now-f.psychoCandidate.time<5000&&!u.isGrounded&&(u.team===f.psychoCandidate.team)&&(u.team==="blue"?f.vx>180:f.vx<-180)){
        Me.playPsycho();
        emitMechanicEvent(s, u, {type:"psycho",text:"🔮 PSYCHO REDIRECT ("+(Math.round(Math.hypot(f.vx,f.vy)/10*1.6)||95)+" KM/H)",color:"#ec4899"});
        f.psychoCandidate=null;
      }
    }else if(u.isGrounded){
      u.airTouches=0;
    }

    f.lastTouchTeam=u.team;
    f.lastTouchPlayer=u.name;
    f.lastTouchTime=Date.now();
    f.touchEffectTimer=.2;
    u.shots++;
    const W=Math.hypot(f.vx,f.vy)/400;
    Me.playBallHit(W);
    const $=u.team==="blue"?"#38bdf8":"#f97316";
    for(let bt=0;bt<8;bt++){
      s.newParticles.push({id:++On,x:f.x-ot*f.radius*.8,y:f.y-Lt*f.radius*.8,vx:ot*160+(Math.random()-.5)*120,vy:Lt*160+(Math.random()-.5)*120,life:.3,maxLife:.3,color:$,size:4+Math.random()*3,type:"spark"});
    }
  }

  const ownNetX=u.team==="blue"?At:Mt;
  const isHeadingToOwn=u.team==="blue"?prevVx<-50:prevVx>50;
  const inDefZone=Math.abs(f.x-ownNetX)<380&&f.y>le.yMin-85&&f.y<le.yMax+85;
  const isCleared=u.team==="blue"?f.vx>20:f.vx<-20;
  if(isHeadingToOwn&&inDefZone&&isCleared&&(_now-(u._lastSaveTime||0)>1600)){
    u._lastSaveTime=_now;
    const isEpic=Math.abs(f.x-ownNetX)<140;
    emitMechanicEvent(s, u, {type:isEpic?"epic_save":"save",text:isEpic?"🏆 EPIC SAVE!":"🛡️ SAVE!",color:isEpic?"#eab308":"#38bdf8"});
    Me.playSave(isEpic);
    u.saves=(u.saves||0)+1;
    u.score=(u.score||0)+(isEpic?75:50);
  }
}function Hv(u:any,f:any,r:any){const s=f.x-u.x,y=f.y-u.y,m=Math.hypot(s,y),g=(u.width+f.width)/2.2;if(m<g&&m>0){const p=s/m,A=y/m,C={x:Math.cos(u.angle),y:Math.sin(u.angle)},z=C.x*p+C.y*A,N={x:Math.cos(f.angle),y:Math.sin(f.angle)},D=N.x*-p+N.y*-A;const closingSpeedU=(u.vx-f.vx)*p+(u.vy-f.vy)*A;const closingSpeedF=(f.vx-u.vx)*(-p)+(f.vy-u.vy)*(-A);const canDemoU=u.isSupersonic&&(u.supersonicTimer||0)>=0.08&&u.team!==f.team&&z>.70&&closingSpeedU>180;const canDemoF=f.isSupersonic&&(f.supersonicTimer||0)>=0.08&&f.team!==u.team&&D>.70&&closingSpeedF>180;if(canDemoU){Xh(f,u,r);return}else if(canDemoF){Xh(u,f,r);return}const X=g-m;u.x-=p*X*.5,u.y-=A*X*.5,f.x+=p*X*.5,f.y+=A*X*.5;const tt=u.vx-f.vx,I=u.vy-f.vy,U=(tt*p+I*A)*1.2;U>0&&(u.vx-=p*U*.5,u.vy-=A*U*.5,f.vx+=p*U*.5,f.vy+=A*U*.5)}}function Xh(u,f,r){u.isDemoed=!0,u.demoRespawnTimer=3,u.boost=33,f.demos++,f.score+=50,Me.playDemolition(),r.demoEvents.push({killer:f,victim:u,pos:{x:u.x,y:u.y}});for(let s=0;s<35;s++){const y=Math.random()*Math.PI*2,m=150+Math.random()*450;r.newParticles.push({id:++On,x:u.x,y:u.y,vx:Math.cos(y)*m,vy:Math.sin(y)*m,life:.6+Math.random()*.4,maxLife:1,color:Math.random()>.5?"#ef4444":"#f97316",size:8+Math.random()*8,type:"demo_explosion"})}}function Gv(u){u.isDemoed=!1,u.demoRespawnTimer=0,u.vx=0,u.vy=0,u.isSupersonic=!1,u.isFlipping=!1,u.jumpCount=0,u.boost=33,u.airRollInverted=!1,u.team==="blue"?(u.x=At+220,u.y=k-u.height/2,u.angle=0,u.facing=1):(u.x=Mt-220,u.y=k-u.height/2,u.angle=Math.PI,u.facing=-1)}function Bv(u,f){if(!(u.boost>=100))for(const r of f){if(!r.active)continue;const s=u.x-r.x,y=u.y-r.y,m=r.type==="big"?55:35;Math.hypot(s,y)<m&&(r.active=!1,r.cooldownTimer=r.respawnTime,r.type==="big"?u.boost=100:u.boost=Math.min(100,u.boost+12),Me.playBoostPadPickup())}}function qv(u,f){const r=Math.round(Math.hypot(u.vx,u.vy)/10*1.6);u.x+u.radius<le.x&&u.y>le.yMin&&u.y<le.yMax&&(Me.playGoalExplosion(),f.goalScored={scoringTeam:"orange",scorerName:u.lastTouchPlayer||"Orange Team",speedKmh:Math.max(35,r),ballPos:{x:u.x,y:u.y}}),u.x-u.radius>ae.x&&u.y>ae.yMin&&u.y<ae.yMax&&(Me.playGoalExplosion(),f.goalScored={scoringTeam:"blue",scorerName:u.lastTouchPlayer||"Blue Team",speedKmh:Math.max(35,r),ballPos:{x:u.x,y:u.y}})}function Lh(u,f,r){const s=Math.atan2(Math.sin(f-u),Math.cos(f-u));return u+s*Math.min(1,Math.max(0,r))}function Yv(u:any,f:any,r:any,s:any,y:any,m:any,g:any){
  const p:any={};
  if(u.isDemoed)return Vh(u),p;
  u.botState||(u.botState={action:"idle",dribbleTime:0,airDribbleTouches:0,targetPos:{x:f.x,y:f.y},interceptTime:0,mustyStage:"idle",mustyTimer:0,jumpSeq:{stage:"idle",timer:0,type:"aerial",dodgeX:0,dodgeY:0}});
  Vh(u);
  Xv(u,m);

  // If in the middle of a fast-aerial double jump, preserve rocket launch inputs!
  const isLaunchingAerial=u.botState.jumpSeq&&u.botState.jumpSeq.stage!=="idle"&&u.botState.jumpSeq.type==="aerial";

  if(u.x<At+35){
    u.input.throttleForward=!0,u.input.steerRight=!0,u.input.steerLeft=!1;
    u.isGrounded&&Math.random()<.15&&(u.input.jump=!0);
    return p;
  }
  if(u.x>Mt-35){
    u.input.throttleForward=!0,u.input.steerLeft=!0,u.input.steerRight=!1;
    u.isGrounded&&Math.random()<.15&&(u.input.jump=!0);
    return p;
  }

  const curSpd=Math.hypot(u.vx,u.vy);
  if(curSpd<40){
    u._stuckTicks=(u._stuckTicks||0)+1;
    if(u._stuckTicks>25){
      u.input.throttleForward=!1,u.input.throttleReverse=!0,u.input.jump=!0,u.input.handbrake=!0;
      u.input.steerLeft=u.team==="blue",u.input.steerRight=u.team==="orange";
      if(u._stuckTicks>50)u._stuckTicks=0;
      return p;
    }
  }else{
    u._stuckTicks=0;
  }

  const ownGoal=u.team==="orange"?ae:le;
  const oppGoal=u.team==="orange"?le:ae;
  const teamDir=u.team==="orange"?-1:1;
  const oppCar=r.find((D:any)=>!D.isDemoed)||r[0];

  switch(y){
    case"rookie":Lv(u,f,r);break;
    case"pro":Vv(u,f,ownGoal.x,oppGoal.x,teamDir,m);break;
    case"allstar":Qv(u,f,oppCar,ownGoal,oppGoal,teamDir,m,g);break;
    case"ssl":case"unfair":
      Zv(u,f,oppCar,ownGoal,oppGoal,teamDir,m,p,y==="unfair",g,s);
      break;
  }

  // Prevent ground steering helpers from canceling fast aerial vertical thrust!
  if(isLaunchingAerial){
    u.input.throttleForward=!1;
    u.input.throttleReverse=!1;
    u.input.steerLeft=!1;
    u.input.steerRight=!1;
    u.input.pitchUp=!0;
    u.input.pitchDown=!1;
    u.input.boost=!0;
  }

  return p;
}

function Vh(u:any){
  u.input={steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,jump:!1,boost:!1,handbrake:!1};
}

function Oe(u:any,f:string,r:number=0,s:number=0){
  const y=u.botState;
  (!y.jumpSeq||y.jumpSeq.stage==="idle")&&(y.jumpSeq={stage:"press1",timer:0,type:f,dodgeX:r,dodgeY:s});
}

function Xv(u:any,f:number){
  const r=u.botState;
  if(!r.jumpSeq||r.jumpSeq.stage==="idle")return;
  const s=r.jumpSeq;
  s.timer+=f;

  if(s.type==="aerial"){
    // Immaculate fast-aerial double jump:
    // Jump 1 -> quick release -> Jump 2 straight up with boost & pitchUp
    u.input.pitchUp=!0;
    u.input.pitchDown=!1;
    u.input.boost=!0;
    u.input.throttleForward=!1;
    u.input.throttleReverse=!1;
    u.input.steerLeft=!1;
    u.input.steerRight=!1;
    if(s.stage==="press1"){
      u.input.jump=!0;
      if(s.timer>=.05){s.stage="release";s.timer=0;u.input.jump=!1;}
    }else if(s.stage==="release"){
      u.input.jump=!1;
      if(s.timer>=.035){s.stage="press2";s.timer=0;}
    }else if(s.stage==="press2"){
      u.input.jump=!0;
      if(s.timer>=.07){s.stage="idle";s.timer=0;}
    }
  }else if(s.type==="musty_jump"){
    // Single jump pop for Musty flick setup
    u.input.jump=!0;
    if(s.timer>=.05){s.stage="idle";s.timer=0;u.input.jump=!1;}
  }else if(s.type==="dodge"){
    if(s.stage==="press1"){
      u.input.jump=!0;
      if(s.timer>=.05){s.stage="release";s.timer=0;u.input.jump=!1;}
    }else if(s.stage==="release"){
      u.input.jump=!1;
      if(s.timer>=.035){s.stage="press2";s.timer=0;}
    }else if(s.stage==="press2"){
      u.input.jump=!0;
      u.input.throttleForward=!1;
      u.input.throttleReverse=!1;
      s.dodgeX>.15?(u.input.steerRight=!0):s.dodgeX<-.15&&(u.input.steerLeft=!0);
      s.dodgeY>.15?(u.input.pitchDown=!0):s.dodgeY<-.15&&(u.input.pitchUp=!0);
      if(s.timer>=.07){s.stage="idle";s.timer=0;}
    }
  }
}

function tm(u:any){
  return Math.abs(u.x-Kt/2)<25&&Math.abs(u.vx)<5&&Math.abs(u.vy)<5&&u.y>k-90;
}

function em(u: any, f: number, isLegacy = false) {
  const legacy = isLegacy || activePhysicsMode === "legacy";
  if (legacy) {
    let r = u.x, s = u.y, y = u.vx, m = u.vy;
    const g = .04, p = Math.min(50, Math.ceil(f / g));
    for (let A = 0; A < p; A++) {
      m += 850 * g;
      y *= .999;
      r += y * g;
      s += m * g;
      s > k - 30 && (s = k - 30, m = -Math.abs(m) * .75);
      s < Qt + 30 && (s = Qt + 30, m = Math.abs(m) * .75);
    }
    return { x: r, y: s, vx: y, vy: m };
  }
  let r = u.x, s = u.y, y = u.vx, m = u.vy;
  const g = .03, p = Math.min(60, Math.ceil(f / g));
  for (let A = 0; A < p; A++) {
    m += 720 * g;
    y *= .998;
    r += y * g;
    s += m * g;
    s > k - 30 && (s = k - 30, m = -Math.abs(m) * .60);
    s < Qt + 30 && (s = Qt + 30, m = Math.abs(m) * .65);
    r > Mt - 30 && (r = Mt - 30, y = -Math.abs(y) * .65);
    r < At + 30 && (r = At + 30, y = Math.abs(y) * .65);
  }
  return { x: r, y: s, vx: y, vy: m };
}

function lm(u:any,f:any,r:number){
  if(!(r>0&&u.vx<-60||r<0&&u.vx>60))return{isThreat:0,interceptTime:0,interceptY:0};
  const m=Math.abs(u.x-f.x)/(Math.abs(u.vx)||1);
  if(m>2.5)return{isThreat:0,interceptTime:0,interceptY:0};
  const g=em(u,m),p=g.y>=f.yMin-35&&g.y<=f.yMax+35,A=g.y<f.yMin-35&&g.y>Qt+40;
  return p?{isThreat:1,interceptTime:m,interceptY:g.y}:A?{isThreat:2,interceptTime:m,interceptY:g.y}:{isThreat:0,interceptTime:0,interceptY:0};
}

function Fs(u:any,f:any,r:any,s:any,y:any,m:any){
  if(!f||f.length===0)return null;
  const g=f.filter((p:any)=>p.active||p.cooldownTimer<.6);
  if(g.length===0)return null;
  if(m==="starve_corner"){
    const p=g.filter((A:any)=>A.type==="big"&&Math.abs(A.x-r)<400);
    if(p.length>0)return p.sort((A:any,C:any)=>Math.hypot(A.x-u.x,A.y-u.y)-Math.hypot(C.x-u.x,C.y-u.y)),p[0];
  }
  if(m==="defensive_route"){
    const p=g.filter((A:any)=>y>0?A.x<u.x:A.x>u.x);
    if(p.length>0)return p.sort((A:any,C:any)=>A.type==="big"&&C.type!=="big"?-1:C.type==="big"&&A.type!=="big"?1:Math.hypot(A.x-u.x,A.y-u.y)-Math.hypot(C.x-u.x,C.y-u.y)),p[0];
  }
  return g.sort((p:any,A:any)=>{
    const C=Math.hypot(p.x-u.x,p.y-u.y)-(p.type==="big"?220:0),z=Math.hypot(A.x-u.x,A.y-u.y)-(A.type==="big"?220:0);
    return C-z;
  }),g[0];
}

function Lv(u:any,f:any,r:any){
  const s=f.x-u.x;
  s>30?(u.input.throttleForward=!0,u.input.steerRight=!0):s<-30&&(u.input.throttleForward=!0,u.input.steerLeft=!0);
  Math.abs(s)<60&&f.y<u.y-40&&Math.random()<.05&&(u.input.jump=!0);
}

function Vv(u:any,f:any,r:any,s:any,y:any,m:any){
  const g=f.x-u.x;
  if((y>0&&f.x<u.x||y<0&&f.x>u.x)&&Math.abs(g)>180){
    const A=r>u.x?1:-1;
    je(u,r+A*100,!1);
    return;
  }
  je(u,f.x,!0);
  Math.abs(g)<100&&f.y<u.y-60&&u.isGrounded&&Oe(u,"aerial");
}

function Qv(u:any,f:any,r:any,s:any,y:any,m:any,g:any,p:any){
  if(tm(f)){nm(u,f,m);return;}
  if(f.x<At+30||f.x>Mt-30){
    const waitX=f.x<At+30?At+140:Mt-140;
    je(u,waitX,!1);
    return;
  }
  if(u.boost<25&&p){
    const I=Fs(u,p,y.x,s.x,m,"emergency");
    if(I&&Math.hypot(I.x-u.x,I.y-u.y)<320){je(u,I.x,!1);return;}
  }
  const A=lm(f,s,m);
  if(A.isThreat===1){am(u,f,s,m,A.interceptTime,A.interceptY);return;}
  const C=em(f,.28),z=C.x-u.x,N=Math.hypot(z,C.y-u.y),D=(y.yMin+y.yMax)/2;
  const X=m>0&&f.x<Kt/2||m<0&&f.x>Kt/2,tt=m>0&&f.x<u.x-40||m<0&&f.x>u.x+40;
  if(X&&tt){
    const I=s.x+(m>0?180:-180);
    je(u,I,!0);
    return;
  }
  if(f.backboardRebound&&Date.now()-f.backboardRebound.time<2600&&f.backboardRebound.targetTeam!==u.team){
    const _reb=em(f,.32);
    if(u.isGrounded){
      je(u,_reb.x,!0);
      if(Math.abs(u.x-_reb.x)<180&&_reb.y<k-90)Oe(u,"aerial");
    }else{
      jn(u,_reb.x,_reb.y);
      if(N<130&&u.jumpCount===1)Oe(u,"dodge",m,-.4);
    }
    return;
  }
  const _nearLW=Math.abs(f.x-At)<155,_nearRW=Math.abs(f.x-Mt)<155;
  if((_nearLW||_nearRW)&&f.y<k-110&&u.boost>12&&N<240){
    je(u,f.x,!0);
    if(N<105)Oe(u,"dodge",_nearLW?-1:1,-.35);
    else if(f.y<u.y-35&&u.isGrounded)Oe(u,"aerial");
    return;
  }
  if(u.isGrounded){
    je(u,C.x,!0);
    if(N<150&&f.y>k-95&&u.boost>20&&Math.abs(u.vx)>110){
      Oe(u,"aerial");
    }else if(N<120&&f.y>k-120){
      Oe(u,"dodge",m,-.6);
    }else if(N<280&&f.y<u.y-75){
      Oe(u,"aerial");
    }
  }else{
    jn(u,C.x,C.y);
    if(N<120&&u.jumpCount===1){
      const ot=Math.atan2(D-f.y,y.x-f.x);
      Oe(u,"dodge",Math.cos(ot),Math.sin(ot));
    }
  }
}

function Zv(u:any,f:any,r:any,ownGoal:any,oppGoal:any,teamDir:number,dt:number,evtObj:any,isUnfair:boolean,boostPads:any,matchState:any){
  const z=u.botState;
  const oppCar=r&&!r.isDemoed?r:null;
  const targetCornerY=(oppCar&&Math.abs(oppCar.x-oppGoal.x)<320)?(oppCar.y<530?oppGoal.yMax-45:oppGoal.yMin+45):oppGoal.yMin+50;
  const D=Math.hypot(f.x-u.x,f.y-u.y);
  const curSpd=Math.hypot(u.vx,u.vy);

  // 1. KICKOFF: Pure skill speedflip kickoff
  if(tm(f)){
    z.action="kickoff";
    nm(u,f,teamDir);
    return;
  }

  // Corner boundary wait if ball trapped
  if(f.x<At+30||f.x>Mt-30){
    const waitX=f.x<At+30?At+130:Mt-130;
    je(u,waitX,!1);
    return;
  }

  // 2. DEFENSIVE THREATS & CLUTCH SAVES
  const threat=lm(f,ownGoal,teamDir);
  if(threat.isThreat===1){
    z.action="save";
    am(u,f,ownGoal,teamDir,threat.interceptTime,threat.interceptY);
    return;
  }
  if(threat.isThreat===2){
    z.action="backboard_clear";
    Jv(u,f,ownGoal,teamDir);
    return;
  }

  // 3. ANTI-OWNGOAL PROTECTION
  const isBehindBall=(teamDir>0&&u.x>f.x-24)||(teamDir<0&&u.x<f.x+24);
  if(isBehindBall){
    const ballHeadingToOwn=(teamDir>0&&f.vx<-40)||(teamDir<0&&f.vx>40);
    if(ballHeadingToOwn){
      const saveX=ownGoal.x+teamDir*75;
      je(u,saveX,!0);
      const betweenNetAndBall=(teamDir>0&&u.x<f.x)||(teamDir<0&&u.x>f.x);
      if(betweenNetAndBall&&D<95)Oe(u,"dodge",teamDir,-.4);
      return;
    }else{
      const rotateBehindX=f.x-teamDir*100;
      je(u,rotateBehindX,!0);
      if(Math.abs(u.x-f.x)<75&&u.isGrounded)u.input.jump=!0;
      return;
    }
  }

  // 4. BOOST MANAGEMENT: If low on boost and ball is safe, collect boost pads on route
  if(u.boost<28&&boostPads&&D>300){
    const pad=Fs(u,boostPads,ownGoal.x,oppGoal.x,teamDir,"defensive_route");
    if(pad&&Math.hypot(pad.x-u.x,pad.y-u.y)<250){
      je(u,pad.x,!1);
      return;
    }
  }

  // 5. AFK / DEFENDER DEMO HUNT (Tactical 1v1 play)
  if(oppCar){
    const isOppAFK=Math.hypot(oppCar.vx,oppCar.vy)<25;
    const oppBetweenBotAndGoal=(teamDir>0&&oppCar.x>u.x&&oppCar.x<oppGoal.x)||(teamDir<0&&oppCar.x<u.x&&oppCar.x>oppGoal.x);
    if(isOppAFK&&oppBetweenBotAndGoal&&D>260){
      z.action="demo_hunt";
      je(u,oppCar.x,!0);
      const distToOpp=Math.hypot(oppCar.x-u.x,oppCar.y-u.y);
      if(distToOpp<120&&Math.abs(u.y-oppCar.y)<45&&u.canJump){
        Oe(u,"dodge",oppCar.x>u.x?1:-1,0);
      }
      return;
    }
  }

  // 6. FLIP RESET EXECUTION: If bot holds a flip reset, unleash a rocket flick!
  if(u.hasFlipReset){
    z.action="flip_reset_shot";
    const shootAngle=Math.atan2(targetCornerY-f.y,oppGoal.x-f.x);
    if(D<105){
      Oe(u,"dodge",Math.cos(shootAngle),Math.sin(shootAngle)*.85);
      matchState&&emitMechanicEvent(matchState,u,{type:"flip_reset",text:"🚀 FLIP RESET FLICK!",color:"#38bdf8"});
      evtObj&&Math.random()<.6&&(evtObj.chatMessage="Flip reset flick! 🚀");
      return;
    }else{
      jn(u,f.x,f.y,.6);
      return;
    }
  }

  // 7. MUSTY FLICK EXECUTION (Pure skill mechanic)
  const canStartMusty=z.mustyStage==="idle"&&u.isGrounded&&u.canJump&&u.jumpCount===0&&D<80&&f.y<u.y+5&&f.y>u.y-35&&((teamDir>0&&u.vx>120&&u.x<oppGoal.x-350)||(teamDir<0&&u.vx<-120&&u.x>oppGoal.x+350));
  if(canStartMusty){
    z.mustyStage="pop";
    z.mustyTimer=0;
    Oe(u,"musty_jump");
    return;
  }
  if(z.mustyStage==="pop"){
    z.mustyTimer+=dt;
    z.action="musty_flick";
    if(teamDir>0){
      u.input.pitchDown=!0;
      u.input.pitchUp=!1;
    }else{
      u.input.pitchUp=!0;
      u.input.pitchDown=!1;
    }
    u.input.boost=z.mustyTimer<.15;
    const isPastVertical=teamDir>0?(u.angle>1.75&&u.angle<2.8):(u.angle<1.38&&u.angle>0);
    if((isPastVertical||z.mustyTimer>.22)&&u.jumpCount===1&&D<110){
      Oe(u,"dodge",-teamDir*.65,.45);
      z.mustyStage="idle";
      return;
    }
    if(z.mustyTimer>.45){
      z.mustyStage="idle";
    }else{
      return;
    }
  }

  // 8. AIR DRIBBLE: when ball is airborne, moving forward/up
  if(f.y<k-130&&f.y>Qt+110&&u.boost>12&&(teamDir>0&&f.x<oppGoal.x-140||teamDir<0&&f.x>oppGoal.x+140)){
    z.action="air_dribble";
    Kv(u,f,oppGoal,targetCornerY,teamDir,dt,evtObj);
    return;
  }

  // 9. FLIP RESET SETUP: fly under high ball with wheels facing ball
  if(f.y<k-210&&f.y>Qt+140&&u.boost>15){
    if(u.isGrounded&&D<290&&Math.abs(f.vx)<650){
      z.action="flip_reset_setup";
      je(u,f.x,!0);
      Oe(u,"aerial");
      return;
    }
    if(!u.isGrounded&&!u.hasFlipReset&&D<230){
      z.action="flip_reset_setup";
      jn(u,f.x,f.y+36,.55);
      u.input.pitchUp=!0;
      Math.abs(u.angle)<2.5&&(u.angle+=teamDir*4*dt);
      D<105&&(u.input.boost=!0);
      return;
    }
  }

  // 10. DOUBLE TAP
  if(f.backboardRebound&&Date.now()-f.backboardRebound.time<2800&&f.backboardRebound.targetTeam!==u.team){
    z.action="double_tap";
    const _reb=em(f,.35);
    if(u.isGrounded){
      je(u,_reb.x,!0);
      Math.abs(u.x-_reb.x)<200&&_reb.y<k-100&&Oe(u,"aerial");
    }else{
      jn(u,_reb.x,_reb.y,.5);
      if(D<130&&u.jumpCount===1){
        Oe(u,"dodge",teamDir,-.35);
        if(Math.random()<.5)evtObj.chatMessage="Double tap! 🎯";
      }
    }
    return;
  }

  // 11. POWER STRIKE & GROUND POP CHIP SHOT (Scoring into the Elevated Goal)
  z.action="attack";
  const shootAngle=Math.atan2(targetCornerY-f.y,oppGoal.x-f.x);
  const cosShoot=Math.cos(shootAngle),sinShoot=Math.sin(shootAngle);

  // Ground ball control:
  if(f.y>k-105){
    const approachX=f.x-cosShoot*20;
    je(u,approachX,!0);
    // Analytical flip trigger distance accounting for 85ms flip delay:
    // Initiating dodge at this distance ensures front bumper strikes ball from underneath at PEAK flip velocity!
    const triggerDist=Math.max(70,Math.min(125,curSpd*.085+45));
    if(D<triggerDist&&u.isGrounded&&u.canJump&&!u.isFlipping){
      // Pop jump/chip flip into the lower half of the ball to launch it upward into the elevated net!
      Oe(u,"dodge",cosShoot,sinShoot*.85);
    }
    return;
  }

  // Airborne interception:
  const estT=Math.max(.05,Math.min(1.1,D/Math.max(550,curSpd)));
  const pred=em(f,estT);
  const pDist=Math.hypot(pred.x-u.x,pred.y-u.y);

  if(u.isGrounded){
    const approachX=pred.x-cosShoot*20;
    je(u,approachX,!0);
    if(pred.y<u.y-50&&pDist<380&&u.boost>8){
      Oe(u,"aerial");
    }else{
      const triggerDist=Math.max(68,Math.min(120,curSpd*.085+40));
      if(D<triggerDist&&u.canJump&&!u.isFlipping){
        Oe(u,"dodge",cosShoot,sinShoot*.85);
      }
    }
  }else{
    jn(u,pred.x,pred.y,.45);
    if(D<80&&(u.jumpCount===1||u.hasFlipReset)){
      Oe(u,"dodge",cosShoot,sinShoot*.85);
    }
  }
}
function Kv(u:any,f:any,r:any,s:any,y:any,m:any,p:any){
  const goalDist=Math.abs(u.x-r.x),D=Math.hypot(f.x-u.x,f.y-u.y);
  if(u.isGrounded){
    je(u,f.x-y*14,!0);
    Math.abs(u.x-f.x)<75&&Oe(u,"aerial");
    return;
  }
  // Sweet spot: 12px behind ball, 18px below center (car nose lifting underside)
  const sweetX=f.x-y*12,sweetY=f.y+18;
  const targetAngle=Math.atan2(s-u.y,r.x-u.x)-.22;
  const angleDiff=Math.atan2(Math.sin(targetAngle-u.angle),Math.cos(targetAngle-u.angle));
  if(angleDiff>.06){u.input.pitchDown=!0;u.input.pitchUp=!1;}
  else if(angleDiff<-.06){u.input.pitchUp=!0;u.input.pitchDown=!1;}

  if(u.x<sweetX-5){u.input.steerRight=!0;u.input.throttleForward=!0;}
  else if(u.x>sweetX+5){u.input.steerLeft=!0;u.input.throttleForward=!0;}
  else{u.input.throttleForward=!0;}

  // Micro boost feathering to carry ball across the arena
  const needsLift=u.y>sweetY-3||u.vy>f.vy-18;
  (needsLift&&u.boost>0)?(u.input.boost=!0):(u.input.boost=!1);

  // Air Dribble Dunk Finish
  if(goalDist<260&&D<80&&(u.jumpCount===1||u.hasFlipReset)){
    const shootAngle=Math.atan2(s-f.y,r.x-f.x);
    Oe(u,"dodge",Math.cos(shootAngle),Math.sin(shootAngle)*.75);
    p&&Math.random()<.6&&(p.chatMessage="Air dribble dunk! 💥");
  }
}

function am(u:any,f:any,r:any,s:number,y:number,m:number){
  const g=r.x+(s>0?100:-100),p=Math.max(r.yMin+20,Math.min(r.yMax-20,m));
  if(u.isGrounded){
    je(u,g,!0);
    (Math.abs(u.x-g)<220||y<1.2)&&Oe(u,"aerial");
  }else{
    jn(u,f.x,p,.55);
    if(Math.hypot(f.x-u.x,f.y-u.y)<95&&(u.jumpCount===1||u.hasFlipReset)){
      Oe(u,"dodge",s,-.4);
    }
  }
}

function Jv(u:any,f:any,r:any,s:number){
  const y=r.x+(s>0?40:-40);
  u.isGrounded?(je(u,y,!0),Math.abs(u.x-y)<160&&Oe(u,"aerial")):jn(u,f.x,f.y,.5);
}

function nm(u:any,f:any,r:number){
  const s=f.x-u.x,y=Math.abs(s);
  u.input.throttleForward=!0;
  s>10?(u.input.steerRight=!0):s<-10&&(u.input.steerLeft=!0);
  if(u.boost>0)u.input.boost=!0;

  if(u.isGrounded){
    // Stage 1: Speedflip at distance 400-220px to hit supersonic speed while conserving boost
    if(y<420&&y>220&&u.canJump&&!u.isFlipping){
      Oe(u,"dodge",r,-.22);
    }else if(y<105&&u.canJump&&!u.isFlipping){
      // Stage 2: Front-flip pop into the lower half of the ball to launch it upward towards the elevated net!
      Oe(u,"dodge",r,-.32);
    }
  }else{
    // Airborne during kickoff
    if(u.boost>0&&Math.abs(f.x-u.x)>60)u.input.boost=!0;
    if(y<90&&(u.jumpCount===1||u.hasFlipReset)){
      Oe(u,"dodge",r,-.28);
    }
  }
}
function je(u:any,targetX:number,allowBoost:boolean=true){
  const s=targetX-u.x,y=Math.abs(s);
  if(s>15){
    u.input.steerRight=!0;
    u.input.steerLeft=!1;
    u.input.throttleForward=!0;
  }else if(s<-15){
    u.input.steerLeft=!0;
    u.input.steerRight=!1;
    u.input.throttleForward=!0;
  }else{
    u.input.throttleForward=!0;
  }
  const isFacingRight=Math.cos(u.angle)>.35,isFacingLeft=Math.cos(u.angle)<-.35;
  const isAligned=s>25&&isFacingRight||s<-25&&isFacingLeft;
  allowBoost&&isAligned&&y>110&&u.boost>0&&(u.input.boost=!0);
  (s>50&&u.vx<-140||s<-50&&u.vx>140)&&u.isGrounded&&(u.input.handbrake=!0,u.input.throttleReverse=!0,u.input.throttleForward=!1);
}

function jn(u:any,targetX:number,targetY:number,maxBoostAngle:number=0.45){
  const dx=targetX-u.x,dy=targetY-u.y;
  const dist=Math.hypot(dx,dy);
  const gravComp=Math.min(180,dist*.28);
  const desiredAngle=Math.atan2(dy-gravComp,dx);
  const angleDiff=Math.atan2(Math.sin(desiredAngle-u.angle),Math.cos(desiredAngle-u.angle));
  if(angleDiff>.06){
    u.input.pitchDown=!0;
    u.input.pitchUp=!1;
  }else if(angleDiff<-.06){
    u.input.pitchUp=!0;
    u.input.pitchDown=!1;
  }
  if(Math.abs(angleDiff)<maxBoostAngle&&u.boost>0){
    u.input.boost=!0;
  }
}
function kv(u: any, f: any, r: any, s: any, y: any, m: any = {}) {
  const canvas = u.canvas;
  if (!canvas) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const displayW = canvas.clientWidth || window.innerWidth;
  const displayH = canvas.clientHeight || window.innerHeight;
  const targetW = Math.round(displayW * dpr);
  const targetH = Math.round(displayH * dpr);

  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  u.save();
  u.clearRect(0, 0, targetW, targetH);
  u.scale(dpr, dpr);

  const ARENA_W = Kt; // 2000
  const ARENA_H = hl; // 1100 (Floor k=950 is 150px above bottom, ground visible beneath cars)

  const scale = Math.min(displayW / ARENA_W, displayH / ARENA_H);
  const offsetX = Math.round((displayW - ARENA_W * scale) / 2);
  const offsetY = Math.round((displayH - ARENA_H * scale) / 2);

  const viewMinX = Math.round(-offsetX / scale);
  const viewMaxX = Math.round(ARENA_W + (displayW - offsetX - ARENA_W * scale) / scale);
  const viewMinY = Math.round(-offsetY / scale);
  const viewMaxY = Math.round(ARENA_H + (displayH - offsetY - ARENA_H * scale) / scale);

  u.save();
  u.translate(offsetX, offsetY);
  u.scale(scale, scale);

  Fv(u, m.arenaTheme || "classic", viewMinX, viewMaxX, viewMinY, viewMaxY);

  for (const g of s) Wv(u, g);
  m.showTrajectory && Pv(u, r, m.physicsMode === "legacy");
  $v(u, r);
  for (const g of f) g.isDemoed ? ag(u, g) : (tg(u, g), eg(u, g, m));
  Iv(u, r);
  ng(u, viewMinX, viewMaxX);
  ug(u, y);

  u.restore();
  u.restore();
}

function Fv(
  u: any,
  theme: string = "classic",
  viewMinX: number = 0,
  viewMaxX: number = Kt,
  viewMinY: number = 0,
  viewMaxY: number = hl
) {
  u.save();

  const minX = Math.min(0, viewMinX);
  const maxX = Math.max(Kt, viewMaxX);
  const minY = Math.min(0, viewMinY);
  const maxY = Math.max(hl, viewMaxY);
  const totalW = maxX - minX;

  // 1. OUTDOOR SKY GRADIENT (Between pitch walls At to Mt, from Qt=120 to horizon y=380)
  const skyGrad = u.createLinearGradient(0, Qt, 0, 380);
  if (theme === "neon_night") {
    skyGrad.addColorStop(0, "#050814");
    skyGrad.addColorStop(0.6, "#0b112c");
    skyGrad.addColorStop(1, "#02050e");
  } else if (theme === "sunset_champions") {
    skyGrad.addColorStop(0, "#1a0b2e");
    skyGrad.addColorStop(0.5, "#2d124d");
    skyGrad.addColorStop(1, "#f97316");
  } else {
    skyGrad.addColorStop(0, "#5ba5f5");
    skyGrad.addColorStop(0.55, "#7ab9fa");
    skyGrad.addColorStop(1, "#abd8fd");
  }
  u.fillStyle = skyGrad;
  u.fillRect(minX, minY, totalW, 380 - minY);

  // 2. STYLIZED PUFFY CLOUDS (Inside outdoor pitch window)
  const drawCloud = (cx: number, cy: number, scale: number) => {
    u.save();
    u.translate(cx, cy);
    u.scale(scale, scale);
    u.fillStyle = "#ffffff";
    u.beginPath();
    u.arc(0, 0, 38, 0, Math.PI * 2);
    u.arc(-32, 8, 28, 0, Math.PI * 2);
    u.arc(34, 6, 30, 0, Math.PI * 2);
    u.arc(-58, 16, 20, 0, Math.PI * 2);
    u.arc(56, 16, 22, 0, Math.PI * 2);
    u.fill();
    u.fillStyle = "rgba(195, 222, 252, 0.42)";
    u.beginPath();
    u.arc(0, 10, 34, 0, Math.PI);
    u.arc(-32, 16, 25, 0, Math.PI);
    u.arc(34, 14, 26, 0, Math.PI);
    u.fill();
    u.restore();
  };

  drawCloud(340, 160, 0.9);
  drawCloud(670, 145, 1.05);
  drawCloud(1270, 155, 1.15);
  drawCloud(1650, 165, 0.85);

  // 3. DISTANT CITY SKYLINE (Centered behind pitch)
  u.fillStyle = "#7296ac";
  const skyline = [
    { x: -160, w: 60, h: 120 },
    { x: -90, w: 50, h: 150 },
    { x: -30, w: 55, h: 100 },
    { x: 35, w: 50, h: 130 },
    { x: 95, w: 65, h: 90 },
    { x: 190, w: 55, h: 140 },
    { x: 250, w: 45, h: 90 },
    { x: 300, w: 60, h: 160 },
    { x: 365, w: 40, h: 110 },
    { x: 410, w: 50, h: 130 },
    { x: 465, w: 65, h: 85 },
    { x: 535, w: 45, h: 150 },
    { x: 585, w: 55, h: 100 },
    { x: 645, w: 50, h: 175 },
    { x: 700, w: 70, h: 120 },
    { x: 775, w: 55, h: 145 },
    { x: 835, w: 60, h: 95 },
    { x: 900, w: 50, h: 165 },
    { x: 955, w: 90, h: 130 },
    { x: 1050, w: 55, h: 180 },
    { x: 1110, w: 60, h: 110 },
    { x: 1175, w: 45, h: 155 },
    { x: 1225, w: 65, h: 90 },
    { x: 1295, w: 50, h: 170 },
    { x: 1350, w: 60, h: 135 },
    { x: 1415, w: 45, h: 105 },
    { x: 1465, w: 70, h: 150 },
    { x: 1540, w: 50, h: 115 },
    { x: 1595, w: 60, h: 160 },
    { x: 1660, w: 55, h: 95 },
    { x: 1720, w: 65, h: 140 },
    { x: 1790, w: 50, h: 110 },
    { x: 1850, w: 60, h: 145 },
    { x: 1920, w: 55, h: 115 },
    { x: 1985, w: 65, h: 155 },
    { x: 2060, w: 50, h: 90 },
    { x: 2120, w: 70, h: 135 }
  ];
  const horizonBaseY = 360;
  for (const b of skyline) {
    if (b.x + b.w >= minX && b.x <= maxX) {
      u.fillRect(b.x, horizonBaseY - b.h, b.w, b.h);
      if (b.h > 150) {
        u.strokeStyle = "#5f8398";
        u.lineWidth = 2.5;
        u.beginPath();
        u.moveTo(b.x + b.w / 2, horizonBaseY - b.h);
        u.lineTo(b.x + b.w / 2, horizonBaseY - b.h - 24);
        u.stroke();
      }
    }
  }

  // 4. LUSH GREEN TREES / BUSH CANOPY
  const treeY = 360;
  const startTx = Math.floor((minX - 48) / 48) * 48;
  const endTx = Math.ceil((maxX + 48) / 48) * 48;
  for (let tx = startTx; tx <= endTx; tx += 48) {
    u.fillStyle = "#3e8c47";
    u.beginPath();
    u.arc(tx, treeY, 34, 0, Math.PI * 2);
    u.fill();
    u.fillStyle = "#4fa758";
    u.beginPath();
    u.arc(tx + 8, treeY - 8, 25, 0, Math.PI * 2);
    u.fill();
    u.fillStyle = "#63bf6d";
    u.beginPath();
    u.arc(tx + 12, treeY - 14, 15, 0, Math.PI * 2);
    u.fill();
  }

  // 5. STADIUM FLOODLIGHT TOWERS (Symmetrical at 390 and 1610)
  const drawLightTower = (tx: number) => {
    u.save();
    u.strokeStyle = "#475569";
    u.lineWidth = 5;
    u.beginPath();
    u.moveTo(tx - 18, 360);
    u.lineTo(tx - 12, 235);
    u.moveTo(tx + 18, 360);
    u.lineTo(tx + 12, 235);
    u.stroke();

    u.strokeStyle = "#64748b";
    u.lineWidth = 2.5;
    for (let yb = 330; yb > 240; yb -= 28) {
      u.beginPath();
      u.moveTo(tx - 16, yb);
      u.lineTo(tx + 16, yb - 20);
      u.moveTo(tx + 16, yb);
      u.lineTo(tx - 16, yb - 20);
      u.stroke();
    }

    u.fillStyle = "#1e293b";
    u.strokeStyle = "#0f172a";
    u.lineWidth = 2;
    u.beginPath();
    u.roundRect(tx - 52, 190, 104, 46, 4);
    u.fill();
    u.stroke();

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 3; row++) {
        const lx = tx - 38 + col * 25;
        const ly = 200 + row * 13;
        const lampGlow = u.createRadialGradient(lx, ly, 1, lx, ly, 8);
        lampGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
        lampGlow.addColorStop(0.5, "rgba(254, 240, 138, 0.9)");
        lampGlow.addColorStop(1, "rgba(254, 240, 138, 0)");
        u.fillStyle = lampGlow;
        u.beginPath();
        u.arc(lx, ly, 8, 0, Math.PI * 2);
        u.fill();

        u.fillStyle = "#ffffff";
        u.beginPath();
        u.arc(lx, ly, 4.5, 0, Math.PI * 2);
        u.fill();
      }
    }
    u.restore();
  };

  drawLightTower(390);
  drawLightTower(1610);

  // 6. STADIUM GRANDSTAND STANDS & CROWD (Inside arena: At to Mt)
  u.fillStyle = "#263346";
  u.fillRect(At, 355, Mt - At, 185);

  const crowdRows = [
    { y: 380, h: 24 },
    { y: 408, h: 26 },
    { y: 438, h: 28 },
    { y: 470, h: 32 },
    { y: 506, h: 34 }
  ];

  for (const row of crowdRows) {
    u.fillStyle = "#1e293b";
    u.fillRect(At, row.y, Mt - At, row.h);
    u.strokeStyle = "rgba(100, 116, 139, 0.4)";
    u.lineWidth = 1.5;
    u.beginPath();
    u.moveTo(At, row.y);
    u.lineTo(Mt, row.y);
    u.stroke();

    for (let cx = At + 12; cx < Mt - 12; cx += 16) {
      const randVal = Math.sin(cx * 12.3 + row.y * 3.7);
      let dotColor = "#38bdf8";
      if (randVal > 0.45) dotColor = "#fb923c";
      else if (randVal > 0.15) dotColor = "#ffffff";
      else if (randVal > -0.2) dotColor = "#94a3b8";
      else if (randVal > -0.55) dotColor = "#0284c7";
      else dotColor = "#ea580c";

      u.fillStyle = dotColor;
      u.beginPath();
      u.arc(cx + (randVal * 3), row.y + row.h / 2, 4.5, 0, Math.PI * 2);
      u.fill();
    }
  }

  // 7. SLEEK STADIUM BACK WALL (Inside arena: At to Mt, down to dasher boards)
  const wallGrad = u.createLinearGradient(0, 540, 0, 895);
  wallGrad.addColorStop(0, "#1e293b");
  wallGrad.addColorStop(0.4, "#182230");
  wallGrad.addColorStop(1, "#0f172a");
  u.fillStyle = wallGrad;
  u.fillRect(At, 540, Mt - At, 355);

  // Architectural panel seams on the stadium wall
  u.strokeStyle = "rgba(255, 255, 255, 0.06)";
  u.lineWidth = 2;
  for (let px = At + 160; px < Mt; px += 160) {
    u.beginPath();
    u.moveTo(px, 540);
    u.lineTo(px, 895);
    u.stroke();
  }
  u.strokeStyle = "rgba(255, 255, 255, 0.08)";
  u.beginPath();
  u.moveTo(At, 720);
  u.lineTo(Mt, 720);
  u.stroke();

  // 8. HANGING TEAM BANNERS (Symmetrical at 790 and 1210)
  const drawTeamBanner = (x: number, isBlue: boolean) => {
    u.save();
    const bannerW = 58;
    const bannerH = 150;
    const by = 330;

    u.strokeStyle = "#334155";
    u.lineWidth = 4;
    u.beginPath();
    u.moveTo(x - bannerW / 2 - 8, by);
    u.lineTo(x + bannerW / 2 + 8, by);
    u.stroke();

    u.fillStyle = isBlue ? "#2563eb" : "#ea580c";
    u.beginPath();
    u.moveTo(x - bannerW / 2, by);
    u.lineTo(x + bannerW / 2, by);
    u.lineTo(x + bannerW / 2, by + bannerH);
    u.lineTo(x, by + bannerH + 18);
    u.lineTo(x - bannerW / 2, by + bannerH);
    u.closePath();
    u.fill();

    u.strokeStyle = "rgba(255, 255, 255, 0.85)";
    u.lineWidth = 2.5;
    u.stroke();

    u.strokeStyle = "#ffffff";
    u.lineWidth = 3;
    u.fillStyle = "rgba(255, 255, 255, 0.2)";
    u.beginPath();
    u.moveTo(x - 15, by + 32);
    u.lineTo(x + 15, by + 32);
    u.lineTo(x + 13, by + 60);
    u.lineTo(x, by + 78);
    u.lineTo(x - 13, by + 60);
    u.closePath();
    u.stroke();
    u.fill();

    u.restore();
  };

  drawTeamBanner(790, true);
  drawTeamBanner(1210, false);

  // 9. DASHER BOARDS (Inside arena: At to Mt, at ground level y = 895 to 948)
  const blueWallGrad = u.createLinearGradient(At, 895, At, 948);
  blueWallGrad.addColorStop(0, "#0284c7");
  blueWallGrad.addColorStop(1, "#0369a1");
  u.fillStyle = blueWallGrad;
  u.fillRect(At, 895, Kt / 2 - At, 53);

  const orangeWallGrad = u.createLinearGradient(Kt / 2, 895, Kt / 2, 948);
  orangeWallGrad.addColorStop(0, "#f97316");
  orangeWallGrad.addColorStop(1, "#c2410c");
  u.fillStyle = orangeWallGrad;
  u.fillRect(Kt / 2, 895, Mt - Kt / 2, 53);

  // White top cap of dasher boards
  u.fillStyle = "#ffffff";
  u.fillRect(At, 893, Mt - At, 3.5);

  // 10. SOLID CEILING ROOF STRUCTURE & INDUSTRIAL TRUSS (Spans minX to maxX across full top!)
  u.save();
  const roofGrad = u.createLinearGradient(0, minY, 0, Qt);
  roofGrad.addColorStop(0, "#070b14");
  roofGrad.addColorStop(0.7, "#0f172a");
  roofGrad.addColorStop(1, "#182232");
  u.fillStyle = roofGrad;
  u.fillRect(minX, minY, totalW, Qt - minY);

  // Top structural edge beam
  u.fillStyle = "#334155";
  u.fillRect(minX, minY, totalW, 12);
  u.fillStyle = "#475569";
  u.fillRect(minX, minY + 12, totalW, 2.5);

  // Bottom structural ceiling beam (along Qt = 120)
  u.fillStyle = "#1e293b";
  u.fillRect(minX, Qt - 14, totalW, 14);
  u.fillStyle = "#334155";
  u.fillRect(minX, Qt - 16, totalW, 2);

  // Steel Truss Cross-Braces across FULL WIDTH minX to maxX
  u.strokeStyle = "rgba(148, 163, 184, 0.35)";
  u.lineWidth = 2.5;
  const trussStep = 80;
  const startTrussX = Math.floor(minX / trussStep) * trussStep;
  const endTrussX = Math.ceil(maxX / trussStep) * trussStep;

  for (let bx = startTrussX; bx < endTrussX; bx += trussStep) {
    u.beginPath();
    u.moveTo(bx, minY + 12);
    u.lineTo(bx, Qt - 14);
    u.stroke();

    u.beginPath();
    u.moveTo(bx, minY + 12);
    u.lineTo(bx + trussStep, Qt - 14);
    u.stroke();

    u.beginPath();
    u.moveTo(bx + trussStep, minY + 12);
    u.lineTo(bx, Qt - 14);
    u.stroke();

    // Rivet joints
    u.fillStyle = "#64748b";
    u.beginPath();
    u.arc(bx, minY + 12, 3, 0, Math.PI * 2);
    u.arc(bx, Qt - 14, 3, 0, Math.PI * 2);
    u.fill();
  }

  // Industrial floodlights hung along ceiling
  const overheadLights = [
    At + 220, At + 520, At + 820,
    Mt - 820, Mt - 520, Mt - 220
  ];
  for (const lx of overheadLights) {
    u.fillStyle = "#0f172a";
    u.strokeStyle = "#475569";
    u.lineWidth = 1.5;
    u.beginPath();
    u.roundRect(lx - 16, Qt - 22, 32, 9, 2);
    u.fill();
    u.stroke();

    const beam = u.createLinearGradient(lx, Qt - 13, lx, Qt + 40);
    beam.addColorStop(0, "rgba(255, 255, 255, 0.25)");
    beam.addColorStop(1, "rgba(255, 255, 255, 0)");
    u.fillStyle = beam;
    u.beginPath();
    u.moveTo(lx - 14, Qt - 13);
    u.lineTo(lx + 14, Qt - 13);
    u.lineTo(lx + 24, Qt + 40);
    u.lineTo(lx - 24, Qt + 40);
    u.closePath();
    u.fill();
  }

  // Ceiling Drive Runway & Neon Edge Runner (cars drive upside down here)
  const ceilingGlow = u.createLinearGradient(At, Qt, Mt, Qt);
  ceilingGlow.addColorStop(0, "rgba(56, 189, 248, 0.85)");
  ceilingGlow.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
  ceilingGlow.addColorStop(1, "rgba(249, 115, 22, 0.85)");
  u.strokeStyle = ceilingGlow;
  u.lineWidth = 4;
  u.beginPath();
  u.moveTo(At + F, Qt - 2);
  u.lineTo(Mt - F, Qt - 2);
  u.stroke();

  // Ceiling surface texture dashes (tactile feedback when driving upside down)
  u.strokeStyle = "rgba(255, 255, 255, 0.35)";
  u.lineWidth = 2.5;
  for (let cx = At + F + 25; cx < Mt - F; cx += 45) {
    u.beginPath();
    u.moveTo(cx, Qt - 7);
    u.lineTo(cx, Qt - 1);
    u.stroke();
  }
  u.restore();

  // Clean architectural stadium wall panels matching RL stadium reference
  const drawWallPanels = (isBlue: boolean) => {
    u.save();
    u.beginPath();
    if (isBlue) {
      u.moveTo(minX, minY);
      u.lineTo(At + F, minY);
      u.lineTo(At + F, Qt);
      u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
      u.lineTo(At, 380);
      u.lineTo(minX, 380);
    } else {
      u.moveTo(maxX, minY);
      u.lineTo(Mt - F, minY);
      u.lineTo(Mt - F, Qt);
      u.arc(Mt - F, Qt + F, F, Math.PI * 1.5, 0, false);
      u.lineTo(Mt, 380);
      u.lineTo(maxX, 380);
    }
    u.closePath();
    u.clip();

    // Subtle architectural horizontal seams
    u.strokeStyle = "rgba(255, 255, 255, 0.08)";
    u.lineWidth = 1.5;
    for (let py = minY + 45; py < 380; py += 55) {
      u.beginPath();
      u.moveTo(isBlue ? minX : Mt, py);
      u.lineTo(isBlue ? At + F : maxX, py);
      u.stroke();
    }
    u.restore();
  };

  // 11. SOLID LEFT ARENA WALL STRUCTURE (BLUE)
  // --- A. Upper Wall Column & Corner (minY to 380) ---
  u.save();
  const leftUpperGrad = u.createLinearGradient(minX, minY, At, 380);
  leftUpperGrad.addColorStop(0, "#08162b");
  leftUpperGrad.addColorStop(0.5, "#0e2444");
  leftUpperGrad.addColorStop(1, "#0a1b32");
  u.fillStyle = leftUpperGrad;
  u.beginPath();
  u.moveTo(minX, minY);
  u.lineTo(At + F, minY);
  u.lineTo(At + F, Qt);
  u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
  u.lineTo(At, 380);
  u.lineTo(minX, 380);
  u.closePath();
  u.fill();

  // Draw upper architectural panels
  drawWallPanels(true);

  // Inner border & curved neon highlight along upper left wall
  u.strokeStyle = "#0284c7";
  u.lineWidth = 6;
  u.beginPath();
  u.arc(At + F, Qt + F, F - 3, Math.PI * 1.5, Math.PI, true);
  u.lineTo(At, 380);
  u.stroke();

  u.strokeStyle = "#38bdf8";
  u.lineWidth = 2.5;
  u.beginPath();
  u.arc(At + F, Qt + F, F - 3, Math.PI * 1.5, Math.PI, true);
  u.lineTo(At, 380);
  u.stroke();
  u.restore();

  // --- B. Lower Ramp Foundation & Corner Slope (680 to k=950) ---
  u.save();
  const leftSlopeGrad = u.createLinearGradient(minX, 680, At + F, k);
  leftSlopeGrad.addColorStop(0, "#0a1a2e");
  leftSlopeGrad.addColorStop(0.5, "#102a48");
  leftSlopeGrad.addColorStop(1, "#0a1727");
  u.fillStyle = leftSlopeGrad;
  u.beginPath();
  u.moveTo(minX, 680);
  u.lineTo(At, 680);
  u.lineTo(At, k - F); // (120, 790)
  u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true); // (280, 950)
  u.lineTo(minX, k);
  u.closePath();
  u.fill();

  // Vertical lower wall border
  u.strokeStyle = "#0284c7";
  u.lineWidth = 6;
  u.beginPath();
  u.moveTo(At, 680);
  u.lineTo(At, k - F);
  u.stroke();

  u.strokeStyle = "#38bdf8";
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(At, 680);
  u.lineTo(At, k - F);
  u.stroke();

  // Curved slope ramp highlight
  const leftRampHighlight = u.createLinearGradient(At, 790, At + F, k);
  leftRampHighlight.addColorStop(0, "rgba(56, 189, 248, 0.6)");
  leftRampHighlight.addColorStop(1, "rgba(14, 165, 233, 0.2)");
  u.strokeStyle = leftRampHighlight;
  u.lineWidth = 14;
  u.beginPath();
  u.arc(At + F, k - F, F - 4, Math.PI, Math.PI * 0.5, true);
  u.stroke();
  u.restore();

  // 12. SOLID RIGHT ARENA WALL STRUCTURE (ORANGE) - EXACT SYMMETRICAL MIRROR!
  // --- A. Upper Wall Column & Corner (minY to 380) ---
  u.save();
  const rightUpperGrad = u.createLinearGradient(Mt, minY, maxX, 380);
  rightUpperGrad.addColorStop(0, "#250c05");
  rightUpperGrad.addColorStop(0.5, "#3b1509");
  rightUpperGrad.addColorStop(1, "#230b05");
  u.fillStyle = rightUpperGrad;
  u.beginPath();
  u.moveTo(maxX, minY);
  u.lineTo(Mt - F, minY);
  u.lineTo(Mt - F, Qt);
  u.arc(Mt - F, Qt + F, F, Math.PI * 1.5, 0, false);
  u.lineTo(Mt, 380);
  u.lineTo(maxX, 380);
  u.closePath();
  u.fill();

  // Draw upper architectural panels
  drawWallPanels(false);

  // Inner border & curved neon highlight along upper right wall
  u.strokeStyle = "#ea580c";
  u.lineWidth = 6;
  u.beginPath();
  u.arc(Mt - F, Qt + F, F - 3, Math.PI * 1.5, 0, false);
  u.lineTo(Mt, 380);
  u.stroke();

  u.strokeStyle = "#fb923c";
  u.lineWidth = 2.5;
  u.beginPath();
  u.arc(Mt - F, Qt + F, F - 3, Math.PI * 1.5, 0, false);
  u.lineTo(Mt, 380);
  u.stroke();
  u.restore();

  // --- B. Lower Ramp Foundation & Corner Slope (680 to k=950) ---
  u.save();
  const rightSlopeGrad = u.createLinearGradient(Mt - F, 680, maxX, k);
  rightSlopeGrad.addColorStop(0, "#250c05");
  rightSlopeGrad.addColorStop(0.5, "#3d170a");
  rightSlopeGrad.addColorStop(1, "#1e0904");
  u.fillStyle = rightSlopeGrad;
  u.beginPath();
  u.moveTo(maxX, 680);
  u.lineTo(Mt, 680);
  u.lineTo(Mt, k - F); // (1880, 790)
  u.arc(Mt - F, k - F, F, 0, Math.PI * 0.5, false); // (1720, 950)
  u.lineTo(maxX, k);
  u.closePath();
  u.fill();

  // Vertical lower wall border
  u.strokeStyle = "#ea580c";
  u.lineWidth = 6;
  u.beginPath();
  u.moveTo(Mt, 680);
  u.lineTo(Mt, k - F);
  u.stroke();

  u.strokeStyle = "#fb923c";
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(Mt, 680);
  u.lineTo(Mt, k - F);
  u.stroke();

  // Curved slope ramp highlight
  const rightRampHighlight = u.createLinearGradient(Mt, 790, Mt - F, k);
  rightRampHighlight.addColorStop(0, "rgba(249, 115, 22, 0.6)");
  rightRampHighlight.addColorStop(1, "rgba(234, 88, 12, 0.2)");
  u.strokeStyle = rightRampHighlight;
  u.lineWidth = 14;
  u.beginPath();
  u.arc(Mt - F, k - F, F - 4, 0, Math.PI * 0.5, false);
  u.stroke();
  u.restore();

  // 13. TURF GRASS GROUND (Below car level k = 950 across full screen)
  const groundGrad = u.createLinearGradient(0, k, 0, maxY);
  groundGrad.addColorStop(0, "#3e9e49");
  groundGrad.addColorStop(0.5, "#48aa54");
  groundGrad.addColorStop(1, "#287333");
  u.fillStyle = groundGrad;
  u.fillRect(minX, k, totalW, maxY - k);

  // DIAGONAL MOWN LAWN STRIPES ON THE GROUND
  u.save();
  u.beginPath();
  u.rect(minX, k, totalW, maxY - k);
  u.clip();

  const stripeW = 85;
  u.fillStyle = "rgba(255, 255, 255, 0.09)";
  for (let sx = minX - 1200; sx < maxX + 1200; sx += stripeW * 2) {
    u.beginPath();
    u.moveTo(sx, k);
    u.lineTo(sx + stripeW, k);
    u.lineTo(sx + stripeW + 160, maxY);
    u.lineTo(sx + 160, maxY);
    u.closePath();
    u.fill();
  }
  u.restore();

  // 14. PITCH MARKINGS
  // Dashed white center line
  u.strokeStyle = "rgba(255, 255, 255, 0.85)";
  u.lineWidth = 3.5;
  u.setLineDash([12, 10]);
  u.beginPath();
  u.moveTo(Kt / 2, Qt);
  u.lineTo(Kt / 2, k);
  u.stroke();
  u.setLineDash([]);

  // Center Kickoff Floor Circle
  u.strokeStyle = "rgba(255, 255, 255, 0.9)";
  u.lineWidth = 4;
  u.beginPath();
  u.arc(Kt / 2, k, 170, Math.PI, 0);
  u.stroke();

  // Center Kickoff Dot
  u.fillStyle = "#ffffff";
  u.beginPath();
  u.arc(Kt / 2, 790, 8, 0, Math.PI * 2);
  u.fill();
  u.beginPath();
  u.arc(Kt / 2, k, 7, 0, Math.PI * 2);
  u.fill();

  // 15. ARENA PERIMETER BOUNDARY LINES (Floor, Walls, Ceiling & 4 Smooth Corner Arcs!)
  u.strokeStyle = "rgba(255, 255, 255, 0.95)";
  u.lineWidth = 4;
  u.beginPath();
  // Floor line (cars drive on this line!)
  u.moveTo(At + F, k);
  u.lineTo(Mt - F, k);
  // Bottom-right corner curve into floor
  u.arc(Mt - F, k - F, F, Math.PI * 0.5, 0, true);
  // Right lower wall
  u.lineTo(Mt, ae.yMax);
  // Jump over orange goal mouth
  u.moveTo(Mt, ae.yMin);
  // Right upper wall
  u.lineTo(Mt, Qt + F);
  // Top-right corner curve into ceiling
  u.arc(Mt - F, Qt + F, F, 0, Math.PI * 1.5, true);
  // Ceiling line (cars drive upside down here!)
  u.lineTo(At + F, Qt);
  // Top-left corner curve into left wall
  u.arc(At + F, Qt + F, F, Math.PI * 1.5, Math.PI, true);
  // Left upper wall
  u.lineTo(At, le.yMin);
  // Jump over blue goal mouth
  u.moveTo(At, le.yMax);
  // Left lower wall
  u.lineTo(At, k - F);
  // Bottom-left corner curve into floor
  u.arc(At + F, k - F, F, Math.PI, Math.PI * 0.5, true);

  u.stroke();

  u.restore();
}

function Qh(u: any, f: number, r: number, s: string) {
  u.save();
  const y = u.createRadialGradient(f, r, 5, f, r + 250, 300);
  y.addColorStop(0, s);
  y.addColorStop(0.3, "rgba(255, 255, 255, 0.15)");
  y.addColorStop(1, "rgba(0, 0, 0, 0)");
  u.fillStyle = y;
  u.beginPath();
  u.moveTo(f - 60, r);
  u.lineTo(f + 60, r);
  u.lineTo(f + 220, r + 400);
  u.lineTo(f - 220, r + 400);
  u.closePath();
  u.fill();
  u.restore();
}

function Wv(u: any, f: any) {
  u.save();
  if (f.type === "big") {
    if (f.active) {
      // Golden glowing bloom
      const aura = u.createRadialGradient(f.x, f.y, 10, f.x, f.y, 48);
      aura.addColorStop(0, "rgba(251, 191, 36, 0.9)");
      aura.addColorStop(0.4, "rgba(245, 158, 11, 0.45)");
      aura.addColorStop(1, "rgba(245, 158, 11, 0)");
      u.fillStyle = aura;
      u.beginPath();
      u.arc(f.x, f.y, 48, 0, Math.PI * 2);
      u.fill();

      // Outer golden hexagon border
      u.strokeStyle = "#f59e0b";
      u.lineWidth = 3.5;
      Zh(u, f.x, f.y, 25);

      // Inner golden pill with 100
      const pulse = Math.sin(Date.now() * 0.003) * 3;
      u.fillStyle = "#fef08a";
      u.beginPath();
      u.roundRect(f.x - 14, f.y - 13 + pulse, 28, 26, 8);
      u.fill();

      u.font = "900 13px 'Chakra Petch', system-ui, sans-serif";
      u.fillStyle = "#1e1b4b";
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText("100", f.x, f.y + pulse);
    } else {
      u.strokeStyle = "rgba(255, 255, 255, 0.25)";
      u.lineWidth = 2;
      Zh(u, f.x, f.y, 23);
      const ratio = 1 - f.cooldownTimer / f.respawnTime;
      u.strokeStyle = "#f59e0b";
      u.lineWidth = 3.5;
      u.beginPath();
      u.arc(f.x, f.y, 21, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2);
      u.stroke();
      u.font = "bold 11px 'Chakra Petch', system-ui, sans-serif";
      u.fillStyle = "rgba(255, 255, 255, 0.85)";
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText(Math.ceil(f.cooldownTimer).toString(), f.x, f.y);
    }
  } else {
    // Small boost pad (glowing diamond)
    if (f.active) {
      const aura = u.createRadialGradient(f.x, f.y, 3, f.x, f.y, 22);
      aura.addColorStop(0, "rgba(250, 204, 21, 0.85)");
      aura.addColorStop(1, "rgba(250, 204, 21, 0)");
      u.fillStyle = aura;
      u.beginPath();
      u.arc(f.x, f.y, 22, 0, Math.PI * 2);
      u.fill();

      u.fillStyle = "#fef08a";
      u.beginPath();
      u.moveTo(f.x, f.y - 10);
      u.lineTo(f.x + 10, f.y);
      u.lineTo(f.x, f.y + 10);
      u.lineTo(f.x - 10, f.y);
      u.closePath();
      u.fill();

      u.strokeStyle = "#f59e0b";
      u.lineWidth = 1.5;
      u.stroke();
    } else {
      u.strokeStyle = "rgba(255, 255, 255, 0.18)";
      u.lineWidth = 1.5;
      u.beginPath();
      u.moveTo(f.x, f.y - 6);
      u.lineTo(f.x + 6, f.y);
      u.lineTo(f.x, f.y + 6);
      u.lineTo(f.x - 6, f.y);
      u.closePath();
      u.stroke();
    }
  }
  u.restore();
}

function Zh(u: any, f: number, r: number, s: number) {
  u.beginPath();
  for (let y = 0; y < 6; y++) {
    const m = (y * Math.PI) / 3;
    const g = f + s * Math.cos(m);
    const p = r + s * Math.sin(m);
    y === 0 ? u.moveTo(g, p) : u.lineTo(g, p);
  }
  u.closePath();
  u.stroke();
}

function $v(u: any, f: any) {
  u.save();
  const r = k - (f.y + f.radius);
  if (r >= 0) {
    const s = Math.max(0.2, 1 - r / 700);
    const y = Math.max(0.08, 0.45 * s);
    u.fillStyle = `rgba(0, 0, 0, ${y})`;
    u.beginPath();
    u.ellipse(f.x, k, f.radius * s * 1.3, 8 * s, 0, 0, Math.PI * 2);
    u.fill();
  }
  u.restore();
}

function renderBallTrail(u: any, f: any) {
  if (!f.trail || f.trail.length < 2) return;
  const r = Math.hypot(f.vx, f.vy);
  if (r < 110 && f.trail.length < 5) return;
  u.save();
  const s = r > 1450;
  const y = r > 1050;
  const m = f.lastTouchTeam === "blue" ? [56, 189, 248] : f.lastTouchTeam === "orange" ? [249, 115, 22] : [203, 213, 225];
  const g = f.trail;
  const p = g.length;
  for (let A = 0; A < p - 1; A++) {
    const C = g[A], z = g[A + 1], N = A / (p - 1), D = Math.min(0.88, N * N * (y ? 0.95 : 0.65)), X = Math.max(2, f.radius * (0.2 + N * 0.75) * (y ? 1.25 : 0.9));
    u.beginPath();
    u.moveTo(C.x, C.y);
    u.lineTo(z.x, z.y);
    s ? (u.strokeStyle = `rgba(244, 63, 94, ${D})`, u.lineWidth = X * 1.5) : y ? (u.strokeStyle = `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${D * 0.75})`, u.lineWidth = X * 1.4) : (u.strokeStyle = `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${D * 0.5})`, u.lineWidth = X);
    u.lineCap = "round";
    u.stroke();

    u.beginPath();
    u.moveTo(C.x, C.y);
    u.lineTo(z.x, z.y);
    u.strokeStyle = `rgba(255, 255, 255, ${D * (y ? 0.9 : 0.7)})`;
    u.lineWidth = X * 0.45;
    u.lineCap = "round";
    u.stroke();
  }
  if (y) {
    for (let A = 0; A < p; A += 4) {
      const C = g[A], z = A / (p - 1);
      u.beginPath();
      u.arc(C.x, C.y, (1 - z) * f.radius * 0.5 + 2, 0, Math.PI * 2);
      u.fillStyle = s ? `rgba(251, 113, 133, ${z * 0.5})` : `rgba(255, 255, 255, ${z * 0.45})`;
      u.fill();
    }
  }
  u.restore();
}

function Iv(u: any, f: any) {
  renderBallTrail(u, f);
  u.save();
  u.translate(f.x, f.y);
  u.rotate(f.spin);
  if (f.touchEffectTimer > 0) {
    const s = u.createRadialGradient(0, 0, f.radius * 0.8, 0, 0, f.radius * 1.8);
    const y = f.lastTouchTeam === "blue" ? "rgba(56, 189, 248, 0.7)" : "rgba(249, 115, 22, 0.7)";
    s.addColorStop(0, y);
    s.addColorStop(1, "rgba(0,0,0,0)");
    u.fillStyle = s;
    u.beginPath();
    u.arc(0, 0, f.radius * 1.8, 0, Math.PI * 2);
    u.fill();
  }
  const r = u.createRadialGradient(-f.radius * 0.35, -f.radius * 0.35, f.radius * 0.1, 0, 0, f.radius);
  r.addColorStop(0, "#ffffff");
  r.addColorStop(0.7, "#cbd5e1");
  r.addColorStop(1, "#475569");
  u.fillStyle = r;
  u.beginPath();
  u.arc(0, 0, f.radius, 0, Math.PI * 2);
  u.fill();

  u.fillStyle = "#1e293b";
  Kh(u, 0, 0, f.radius * 0.42);
  for (let s = 0; s < 5; s++) {
    const y = (s * Math.PI * 2) / 5;
    const m = Math.cos(y) * (f.radius * 0.76);
    const g = Math.sin(y) * (f.radius * 0.76);
    Kh(u, m, g, f.radius * 0.24);
    u.strokeStyle = "#334155";
    u.lineWidth = 2;
    u.beginPath();
    u.moveTo(0, 0);
    u.lineTo(m, g);
    u.stroke();
  }
  u.strokeStyle = f.lastTouchTeam === "blue" ? "#38bdf8" : f.lastTouchTeam === "orange" ? "#fb923c" : "rgba(255, 255, 255, 0.4)";
  u.lineWidth = 2.5;
  u.beginPath();
  u.arc(0, 0, f.radius - 1, 0, Math.PI * 2);
  u.stroke();
  u.restore();
}

function Kh(u: any, f: number, r: number, s: number) {
  u.beginPath();
  for (let y = 0; y < 5; y++) {
    const m = (y * Math.PI * 2) / 5 - Math.PI / 2;
    const g = f + s * Math.cos(m);
    const p = r + s * Math.sin(m);
    y === 0 ? u.moveTo(g, p) : u.lineTo(g, p);
  }
  u.closePath();
  u.fill();
}

function Pv(u: any, f: any, isLegacy = false) {
  const legacy = isLegacy || activePhysicsMode === "legacy";
  u.save();
  u.strokeStyle = "rgba(255, 255, 255, 0.35)";
  u.lineWidth = 2;
  u.setLineDash([4, 6]);
  let r = f.x, s = f.y, y = f.vx, m = f.vy;
  const g = 0.035;
  const grav = legacy ? 850 : 720;
  const bFactor = legacy ? 0.75 : 0.60;
  u.beginPath();
  u.moveTo(r, s);
  for (let p = 0; p < 24; p++) {
    m += grav * g;
    r += y * g;
    s += m * g;
    s > k - f.radius && ((s = k - f.radius), (m = -m * bFactor));
    u.lineTo(r, s);
  }
  u.stroke();
  u.restore();
}

function tg(u: any, f: any) {
  u.save();
  const r = k - (f.y + f.height / 2);
  if (r >= 0) {
    const s = Math.max(0.2, 1 - r / 600);
    u.fillStyle = `rgba(0, 0, 0, ${0.4 * s})`;
    u.beginPath();
    u.ellipse(f.x, k, (f.width / 2) * s * 1.2, 7 * s, 0, 0, Math.PI * 2);
    u.fill();
  }
  u.restore();
}
function eg(u: any, f: any, m: any = {}) {
  u.save();

  // Compute basis vectors for side-profile car:
  // fwd: local (+1, 0) direction (nose, front bumper, headlights)
  // down: local (0, +1) direction (bottom of car, wheels touching surface/ground)
  let fwdX: number, fwdY: number;
  let downX: number, downY: number;

  if (f.isGrounded && f.surfaceNormal) {
    // 1. When car is on a surface (floor, ceiling, wall, curve):
    // Wheels must point towards the surface (opposite of surfaceNormal)
    downX = -f.surfaceNormal.x;
    downY = -f.surfaceNormal.y;

    // Forward direction: tangent along the surface matching car heading
    const physCos = Math.cos(f.angle);
    const physSin = Math.sin(f.angle);

    // Tangent T1 is (-N.y, N.x)
    const t1X = -f.surfaceNormal.y;
    const t1Y = f.surfaceNormal.x;
    const dot1 = physCos * t1X + physSin * t1Y;
    if (dot1 >= 0) {
      fwdX = t1X;
      fwdY = t1Y;
    } else {
      fwdX = -t1X;
      fwdY = -t1Y;
    }
  } else if (f.isFlipping) {
    // 2. Active dodge / flip somersault:
    // Continuous 360-degree tumble around car's center
    const isLeftFlip = f.flipDirection ? f.flipDirection.x < 0 : (Math.cos(f.angle) < 0);
    fwdX = Math.cos(f.angle);
    fwdY = Math.sin(f.angle);
    if (!isLeftFlip) {
      downX = -fwdY;
      downY = fwdX;
    } else {
      downX = fwdY;
      downY = -fwdX;
    }
  } else {
    // 3. In the air (jumping, aerial boost flight, free fall):
    // Authentic 2D side-view orientation:
    // When upright, wheels ALWAYS point downwards towards arena floor (+Y).
    // Air roll (Q / E) inverts 180 degrees (wheels <-> ceiling).
    fwdX = Math.cos(f.angle);
    fwdY = Math.sin(f.angle);
    const rollMult = f.airRollInverted ? -1 : 1;

    if (fwdX >= 0) {
      // Facing rightwards: belly/wheels point downwards towards arena floor (+Y)
      downX = -fwdY * rollMult;
      downY = fwdX * rollMult;
    } else {
      // Facing leftwards: horizontally mirrored so belly/wheels point downwards (+Y)
      downX = fwdY * rollMult;
      downY = -fwdX * rollMult;
    }
  }

  // Set the 2D coordinate space for the car
  u.transform(fwdX, fwdY, downX, downY, f.x, f.y);

  const r = f.width / 2;  // 34
  const s = f.height / 2; // 14
  const isBlue = f.team === "blue";

  const primaryDark = isBlue ? "#024673" : "#7c2207";
  const primaryMid = isBlue ? "#0284c7" : "#ea580c";
  const primaryBright = isBlue ? "#38bdf8" : "#fb923c";
  const accentColor = isBlue ? "#7dd3fc" : "#fdba74";
  const chassisDark = "#080c14";
  const metalSilver = "#cbd5e1";
  const metalDark = "#334155";

  // Supersonic trails (streamlines behind car in side view)
  if (f.isSupersonic) {
    u.save();
    u.strokeStyle = "rgba(255, 255, 255, 0.85)";
    u.lineWidth = 2.5;
    u.shadowColor = primaryBright;
    u.shadowBlur = 12;
    u.beginPath();
    // Top trail from spoiler
    u.moveTo(-r - 4, -s - 6);
    u.lineTo(-r - 55, -s - 6);
    // Mid trail from engine
    u.moveTo(-r - 6, 0);
    u.lineTo(-r - 70, 0);
    // Bottom trail from lower chassis
    u.moveTo(-r, s - 2);
    u.lineTo(-r - 50, s - 2);
    u.stroke();
    u.restore();
  }

  // Helper: Draw round car wheel in side profile (wheels pointing down towards pitch)
  const drawWheel = (wx: number, wy: number, radius: number, isFarSide: boolean = false) => {
    u.save();
    // Tire outer rubber
    u.fillStyle = isFarSide ? "#05070c" : "#0f172a";
    u.strokeStyle = isFarSide ? "#0f172a" : "#1e293b";
    u.lineWidth = 1.5;
    u.beginPath();
    u.arc(wx, wy, radius, 0, Math.PI * 2);
    u.fill();
    u.stroke();

    // Tire tread pattern grooves
    if (!isFarSide) {
      u.strokeStyle = "#334155";
      u.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const x1 = wx + Math.cos(a) * (radius - 1.5);
        const y1 = wy + Math.sin(a) * (radius - 1.5);
        const x2 = wx + Math.cos(a) * (radius - 3.5);
        const y2 = wy + Math.sin(a) * (radius - 3.5);
        u.beginPath();
        u.moveTo(x1, y1);
        u.lineTo(x2, y2);
        u.stroke();
      }
    }

    // Rim outer lip
    u.fillStyle = isFarSide ? "#1e293b" : "#334155";
    u.beginPath();
    u.arc(wx, wy, radius * 0.65, 0, Math.PI * 2);
    u.fill();

    // Rim inner dish
    u.fillStyle = isFarSide ? "#0b0f19" : chassisDark;
    u.beginPath();
    u.arc(wx, wy, radius * 0.48, 0, Math.PI * 2);
    u.fill();

    // Cristiano 5-spoke star pattern
    u.strokeStyle = isFarSide ? "#334155" : metalSilver;
    u.lineWidth = 1.2;
    for (let a = 0; a < 5; a++) {
      const ang = a * (Math.PI * 2 / 5);
      u.beginPath();
      u.moveTo(wx, wy);
      u.lineTo(wx + Math.cos(ang) * (radius * 0.48), wy + Math.sin(ang) * (radius * 0.48));
      u.stroke();
    }

    // Wheel center hubcap
    u.fillStyle = primaryBright;
    u.beginPath();
    u.arc(wx, wy, radius * 0.22, 0, Math.PI * 2);
    u.fill();

    // Center lug nut
    u.fillStyle = "#ffffff";
    u.beginPath();
    u.arc(wx, wy, 1.2, 0, Math.PI * 2);
    u.fill();

    // Flip reset glowing aura around wheels
    if (f.hasFlipReset) {
      const pulse = Math.sin(Date.now() * 0.015) * 0.25 + 0.75;
      u.save();
      u.strokeStyle = "rgba(251, 191, 36, " + pulse + ")";
      u.lineWidth = 2.5;
      u.shadowColor = "#fbbf24";
      u.shadowBlur = 8;
      u.beginPath();
      u.arc(wx, wy, radius + 2.5, 0, Math.PI * 2);
      u.stroke();
      u.restore();
    }

    u.restore();
  };

  const rearWheelX = -17;
  const frontWheelX = 18;
  const wheelRadius = 7.5;
  // Floor contact is at y = s (14). Center of near wheels at y = s - wheelRadius + 0.5 = 7
  const nearWheelY = s - wheelRadius + 0.5;
  // Far side wheels slightly higher up and offset for 2.5D perspective
  const farWheelY = nearWheelY - 2.5;

  // 1. FAR-SIDE WHEELS (Background layer, wheels pointing down)
  drawWheel(rearWheelX - 2, farWheelY, wheelRadius * 0.92, true);
  drawWheel(frontWheelX - 2, farWheelY, wheelRadius * 0.92, true);

  // 2. EXHAUST & ROCKET BOOSTER NOZZLE (at the rear, -X)
  u.fillStyle = "#1e293b";
  u.strokeStyle = "#475569";
  u.lineWidth = 1.2;
  // Thruster bell
  u.beginPath();
  u.moveTo(-r + 6, -2);
  u.lineTo(-r - 4, -4);
  u.lineTo(-r - 6, -5);
  u.lineTo(-r - 6, 5);
  u.lineTo(-r - 4, 4);
  u.lineTo(-r + 6, 2);
  u.closePath();
  u.fill();
  u.stroke();

  // Thruster inner glowing core
  u.fillStyle = "#f59e0b";
  u.beginPath();
  u.arc(-r - 4, 0, 2.8, 0, Math.PI * 2);
  u.fill();

  // Boost flame eruption (backward from rocket nozzle)
  if (f.isBoosting || f.isSupersonic) {
    u.save();
    const flameLen = f.isSupersonic ? 45 : 28;
    const flameW = f.isSupersonic ? 7 : 5;
    const flameGrad = u.createLinearGradient(-r - 6, 0, -r - 6 - flameLen, 0);
    flameGrad.addColorStop(0, "#ffffff");
    flameGrad.addColorStop(0.15, "#fef08a");
    flameGrad.addColorStop(0.45, isBlue ? "#38bdf8" : "#f97316");
    flameGrad.addColorStop(0.85, isBlue ? "#0284c7" : "#ea580c");
    flameGrad.addColorStop(1, "rgba(234, 88, 12, 0)");

    u.fillStyle = flameGrad;
    u.beginPath();
    u.moveTo(-r - 6, -flameW);
    u.quadraticCurveTo(-r - 6 - flameLen * 0.6, -flameW * 1.3, -r - 6 - flameLen, 0);
    u.quadraticCurveTo(-r - 6 - flameLen * 0.6, flameW * 1.3, -r - 6, flameW);
    u.closePath();
    u.fill();

    // Inner bright core flame
    const coreGrad = u.createLinearGradient(-r - 6, 0, -r - 6 - flameLen * 0.45, 0);
    coreGrad.addColorStop(0, "#ffffff");
    coreGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
    u.fillStyle = coreGrad;
    u.beginPath();
    u.moveTo(-r - 6, -flameW * 0.5);
    u.lineTo(-r - 6 - flameLen * 0.45, 0);
    u.lineTo(-r - 6, flameW * 0.5);
    u.closePath();
    u.fill();
    u.restore();
  }

  // 3. REAR EXPOSED ENGINE BAY (Octane signature V8 Block behind cab)
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalDark;
  u.lineWidth = 1.2;
  u.fillRect(-r + 9, -5, 12, 9);
  u.strokeRect(-r + 9, -5, 12, 9);

  // Chrome intake pipes / exhaust runners
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.8;
  for (let px = -r + 11; px <= -r + 19; px += 4) {
    u.beginPath();
    u.moveTo(px, -5);
    u.lineTo(px, -9);
    u.lineTo(px - 2, -11);
    u.stroke();
  }

  // 4. LOWER CHASSIS & UNDERBELLY PLATE
  u.fillStyle = chassisDark;
  u.strokeStyle = "#1e293b";
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(-r + 5, nearWheelY);
  u.lineTo(r - 5, nearWheelY);
  u.lineTo(r - 2, nearWheelY - 2);
  u.lineTo(-r + 2, nearWheelY - 2);
  u.closePath();
  u.fill();
  u.stroke();

  // 5. ICONIC OCTANE MAIN BODY (Side Profile Silhouette)
  const bodyGrad = u.createLinearGradient(0, -s - 6, 0, nearWheelY);
  bodyGrad.addColorStop(0, primaryBright);
  bodyGrad.addColorStop(0.4, primaryMid);
  bodyGrad.addColorStop(1, primaryDark);

  u.fillStyle = bodyGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 2;
  u.beginPath();

  // Rear lower corner
  u.moveTo(-r + 5, nearWheelY);
  // Rear overhang to wheel well
  u.lineTo(rearWheelX - wheelRadius - 2.5, nearWheelY);
  // Rear wheel arch cutout (smooth arch over wheel)
  u.quadraticCurveTo(rearWheelX, nearWheelY - wheelRadius - 3.5, rearWheelX + wheelRadius + 2.5, nearWheelY);
  // Center rocker panel (between wheels)
  u.lineTo(frontWheelX - wheelRadius - 2.5, nearWheelY);
  // Front wheel arch cutout (smooth arch over wheel)
  u.quadraticCurveTo(frontWheelX, nearWheelY - wheelRadius - 3.5, frontWheelX + wheelRadius + 2.5, nearWheelY);
  // Front lower lip / splitter
  u.lineTo(r - 3, nearWheelY);
  u.lineTo(r + 1, nearWheelY - 3);
  // Front bumper / nose cone
  u.lineTo(r + 2, 0);
  u.lineTo(r - 2, -3);
  // Front sloped hood
  u.lineTo(6, -6);
  // Windshield base up to roof
  u.lineTo(-4, -s);
  // Roofline
  u.lineTo(-15, -s + 1);
  // Rear cabin slope down
  u.lineTo(-20, -5);
  // Rear deck over engine
  u.lineTo(-r + 6, -3);
  // Down back to rear lower corner
  u.lineTo(-r + 5, nearWheelY - 1);
  u.closePath();
  u.fill();
  u.stroke();

  // 6. OCTANE CABIN & TINTED WINDOW (Side Glass)
  u.fillStyle = "#070c14";
  u.strokeStyle = primaryDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(4, -6);
  u.lineTo(-3, -s + 1.5);
  u.lineTo(-13, -s + 2.5);
  u.lineTo(-17, -5);
  u.closePath();
  u.fill();
  u.stroke();

  // Window glass reflection gleam
  u.strokeStyle = "rgba(255, 255, 255, 0.65)";
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(2, -6);
  u.lineTo(-3, -s + 2);
  u.stroke();

  // Tubular roll cage A-pillar & B-pillar
  u.strokeStyle = metalSilver;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(3, -6);
  u.lineTo(-3.5, -s + 1.5);
  u.moveTo(-13.5, -s + 2);
  u.lineTo(-17, -5);
  u.stroke();

  // 7. ROOF SCOOP / AIR INTAKE
  u.fillStyle = "#1e293b";
  u.strokeStyle = metalDark;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-2, -s);
  u.lineTo(-10, -s);
  u.lineTo(-8, -s - 2.8);
  u.lineTo(-1, -s - 2.8);
  u.closePath();
  u.fill();
  u.stroke();

  // 8. OCTANE ICONIC DECALS & STRIPES
  // White signature hood stripe
  u.fillStyle = "rgba(255, 255, 255, 0.92)";
  u.beginPath();
  u.moveTo(r - 2, -1.5);
  u.lineTo(6, -5);
  u.lineTo(5, -6.5);
  u.lineTo(r - 3, -3);
  u.closePath();
  u.fill();

  // Side accent swoosh
  u.strokeStyle = accentColor;
  u.lineWidth = 1.5;
  u.beginPath();
  u.moveTo(frontWheelX - 4, nearWheelY - 6);
  u.lineTo(0, nearWheelY - 8);
  u.lineTo(rearWheelX + 6, nearWheelY - 6);
  u.stroke();

  // 9. HIGH-MOUNTED OCTANE REAR WING / SPOILER (Signature Feature!)
  // Wing support struts (angled backwards from rear deck)
  u.strokeStyle = chassisDark;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(-20, -5);
  u.lineTo(-24, -s - 4);
  u.moveTo(-17, -4);
  u.lineTo(-21, -s - 4);
  u.stroke();

  // Chrome strut highlights
  u.strokeStyle = metalSilver;
  u.lineWidth = 1;
  u.beginPath();
  u.moveTo(-19.5, -5);
  u.lineTo(-23.5, -s - 4);
  u.stroke();

  // Horizontal aerofoil blade
  const wingGrad = u.createLinearGradient(-28, -s - 7, -17, -s - 5);
  wingGrad.addColorStop(0, "#0f172a");
  wingGrad.addColorStop(0.5, primaryMid);
  wingGrad.addColorStop(1, primaryBright);

  u.fillStyle = wingGrad;
  u.strokeStyle = chassisDark;
  u.lineWidth = 1.4;
  u.beginPath();
  u.moveTo(-28, -s - 4);
  u.lineTo(-17, -s - 3);
  u.lineTo(-16, -s - 7);
  u.lineTo(-28, -s - 7);
  u.closePath();
  u.fill();
  u.stroke();

  // Wing endplate
  u.fillStyle = primaryBright;
  u.fillRect(-29, -s - 8, 3.5, 6);
  u.strokeStyle = chassisDark;
  u.lineWidth = 1;
  u.strokeRect(-29, -s - 8, 3.5, 6);

  // 10. FRONT HEADLIGHT & LIGHT CONE
  u.fillStyle = "#fef08a";
  u.shadowColor = "#fef08a";
  u.shadowBlur = 8;
  u.beginPath();
  u.arc(r + 1, -1, 2.2, 0, Math.PI * 2);
  u.fill();
  u.shadowBlur = 0;

  // Forward beam illumination on the field
  const beamGrad = u.createLinearGradient(r + 2, -1, r + 130, -1);
  beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
  beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
  u.fillStyle = beamGrad;
  u.beginPath();
  u.moveTo(r + 2, -1);
  u.lineTo(r + 130, -18);
  u.lineTo(r + 130, 22);
  u.closePath();
  u.fill();

  // 11. FOREGROUND WHEELS (Crisp front and rear wheels on near side, rolling on pitch)
  drawWheel(rearWheelX, nearWheelY, wheelRadius, false);
  drawWheel(frontWheelX, nearWheelY, wheelRadius, false);

  u.restore();

  // 12. Player nametag and boost bar
  lg(u, f, m);
}function oc(u: any, f: any, r: any, s: any, y: any, m: any, g: any) {
  u.fillStyle = m;
  u.beginPath();
  u.roundRect(f, r, s, y, 3);
  u.fill();
  u.fillStyle = g;
  u.beginPath();
  u.arc(f + s / 2, r + y / 2, 2.5, 0, Math.PI * 2);
  u.fill();
}

function lg(u: any, f: any, m: any = {}) {
  u.save();
  const isBlue = f.team === "blue";
  const name = f.name || (isBlue ? "Player" : "Bot");
  u.font = "bold 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif";
  const textMetrics = u.measureText(name);
  const pillW = Math.max(88, Math.round(textMetrics.width + 28));
  const pillH = 26;
  const rx = Math.round(f.x);
  const ry = Math.round(f.y - 46);

  u.shadowColor = "rgba(0, 0, 0, 0.55)";
  u.shadowBlur = 6;
  u.shadowOffsetY = 2;

  u.fillStyle = isBlue ? "rgba(10, 25, 47, 0.94)" : "rgba(36, 16, 10, 0.94)";
  u.strokeStyle = isBlue ? "#38bdf8" : "#f97316";
  u.lineWidth = 2.5;
  u.beginPath();
  u.roundRect(rx - pillW / 2, ry - pillH / 2, pillW, pillH, 7);
  u.fill();
  u.stroke();

  u.shadowColor = "transparent";
  u.shadowBlur = 0;
  u.shadowOffsetY = 0;

  u.fillStyle = "#ffffff";
  u.textAlign = "center";
  u.textBaseline = "middle";
  u.fillText(name, rx, ry);

  const barW = pillW - 12;
  const barH = 3.5;
  const barY = ry + pillH / 2 + 3.5;
  u.fillStyle = "rgba(255, 255, 255, 0.25)";
  u.fillRect(rx - barW / 2, barY, barW, barH);
  u.fillStyle = f.boost > 25 ? "#fbbf24" : "#ef4444";
  u.fillRect(rx - barW / 2, barY, (barW * Math.max(0, Math.min(100, f.boost))) / 100, barH);

  // Tiny overhead mechanic alert badge (above car nameplate)
  if (m.showMechanicAlerts !== false && f.activeMechanicAlert) {
    const alert = f.activeMechanicAlert;
    const elapsed = Date.now() - alert.startTime;
    if (elapsed < alert.duration) {
      const progress = elapsed / alert.duration;
      const opacity = progress < 0.15 ? progress / 0.15 : (progress > 0.7 ? Math.max(0, (1 - progress) / 0.3) : 1);
      const floatY = -progress * 18;
      const alertY = ry - 24 + floatY;

      u.save();
      u.globalAlpha = opacity;
      u.font = "bold 13px 'Chakra Petch', system-ui, -apple-system, sans-serif";
      const mText = alert.text;
      const mMetrics = u.measureText(mText);
      const mPillW = Math.round(mMetrics.width + 16);
      const mPillH = 22;

      u.shadowColor = alert.color || "#38bdf8";
      u.shadowBlur = 8;
      u.shadowOffsetY = 1;

      u.fillStyle = "rgba(10, 15, 26, 0.94)";
      u.strokeStyle = alert.color || "#38bdf8";
      u.lineWidth = 1.8;
      u.beginPath();
      u.roundRect(rx - mPillW / 2, alertY - mPillH / 2, mPillW, mPillH, 6);
      u.fill();
      u.stroke();

      u.shadowBlur = 2;
      u.fillStyle = "#ffffff";
      u.textAlign = "center";
      u.textBaseline = "middle";
      u.fillText(mText, rx, alertY);

      u.restore();
    } else {
      f.activeMechanicAlert = null;
    }
  }

  u.restore();
}

function ag(u: any, f: any) {
  u.save();
  u.font = "bold 14px 'Chakra Petch', system-ui, sans-serif";
  u.fillStyle = "#ef4444";
  u.textAlign = "center";
  u.fillText(`RESPAWNING: ${f.demoRespawnTimer.toFixed(1)}s`, f.x, f.y - 20);
  u.strokeStyle = "rgba(239, 68, 68, 0.4)";
  u.lineWidth = 2;
  u.beginPath();
  u.arc(f.x, f.y, 25, 0, Math.PI * 2);
  u.stroke();
  u.restore();
}

function ng(u: any, viewMinX: number = -150, viewMaxX: number = 2150) {
  u.save();
  Jh(u, le, true, viewMinX, viewMaxX);  // Blue Goal (Left)
  Jh(u, ae, false, viewMinX, viewMaxX); // Orange Goal (Right)
  u.restore();
}

function Jh(u: any, f: any, isBlue: boolean, viewMinX: number = -150, viewMaxX: number = 2150) {
  const goalLineX = f.x; // At = 120 for blue, Mt = 1880 for orange
  const yTop = f.yMin;   // 380
  const yBot = f.yMax;   // 680
  const netH = yBot - yTop; // 300

  // Outer horizontal boundary of net cavity (extends offscreen so no voids on wide screens)
  const outerX = isBlue
    ? Math.min(viewMinX, goalLineX - f.depth)
    : Math.max(viewMaxX, goalLineX + f.depth);

  const rectLeft = isBlue ? outerX : goalLineX;
  const rectWidth = isBlue ? (goalLineX - outerX) : (outerX - goalLineX);

  u.save();

  // 1. Goal Net Interior Backing
  const netGrad = u.createLinearGradient(
    goalLineX, yTop,
    outerX, yBot
  );
  netGrad.addColorStop(0, isBlue ? "#0c1a2e" : "#28110b");
  netGrad.addColorStop(1, isBlue ? "#050b16" : "#170805");
  u.fillStyle = netGrad;
  u.fillRect(rectLeft, yTop, rectWidth, netH);

  // 2. Hexagonal Honeycomb Net Pattern (Mirrored symmetrically from goal line)
  u.save();
  u.beginPath();
  u.rect(rectLeft, yTop, rectWidth, netH);
  u.clip();

  const hexRadius = 14;
  const hexWidth = hexRadius * Math.sqrt(3);
  const hexHeight = hexRadius * 1.5;

  u.strokeStyle = isBlue ? "rgba(56, 189, 248, 0.45)" : "rgba(249, 115, 22, 0.45)";
  u.lineWidth = 1.4;

  const numRows = Math.ceil(netH / hexHeight) + 3;
  const numCols = Math.ceil(rectWidth / hexWidth) + 3;

  for (let r = -1; r <= numRows; r++) {
    const hy = yTop + r * hexHeight;
    const rowOffset = (Math.abs(r) % 2 === 0) ? 0 : hexWidth / 2;

    for (let c = -1; c <= numCols; c++) {
      // Anchor columns from goalLineX moving outwards for exact symmetry
      const hx = isBlue
        ? (goalLineX - c * hexWidth - rowOffset)
        : (goalLineX + c * hexWidth + rowOffset);

      u.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 - Math.PI / 6;
        const px = hx + hexRadius * Math.cos(ang);
        const py = hy + hexRadius * Math.sin(ang);
        i === 0 ? u.moveTo(px, py) : u.lineTo(px, py);
      }
      u.closePath();
      u.stroke();
    }
  }
  u.restore();

  // 3. Goal Posts and Curved Tubular Framing
  // Top pipe running from outerX to goalLineX at y = yTop
  // Bottom pipe running from outerX to goalLineX at y = yBot
  // Back post running vertically at outerX from yTop to yBot
  // NOTE: NO VERTICAL LINE AT goalLineX (GOAL MOUTH IS OPEN!)
  const pipeColor = isBlue ? "#0284c7" : "#ea580c";
  const pipeHighlight = isBlue ? "#38bdf8" : "#fb923c";

  // Base thick pipe
  u.strokeStyle = pipeColor;
  u.lineWidth = 7;
  u.beginPath();
  u.moveTo(goalLineX, yBot);
  u.lineTo(outerX, yBot);
  u.lineTo(outerX, yTop);
  u.lineTo(goalLineX, yTop);
  u.stroke();

  // Pipe metallic highlight
  u.strokeStyle = pipeHighlight;
  u.lineWidth = 2.5;
  u.beginPath();
  u.moveTo(goalLineX, yBot);
  u.lineTo(outerX, yBot);
  u.lineTo(outerX, yTop);
  u.lineTo(goalLineX, yTop);
  u.stroke();

  // 4. White/Silver Bumper Caps at Goal Posts (At the mouth of the goal: top & bottom)
  kh(u, goalLineX, yTop);
  kh(u, goalLineX, yBot);

  u.restore();
}

function kh(u: any, f: number, r: number) {
  const s = u.createRadialGradient(f - 2, r - 2, 2, f, r, zn);
  s.addColorStop(0, "#ffffff");
  s.addColorStop(0.6, "#cbd5e1");
  s.addColorStop(1, "#475569");
  u.fillStyle = s;
  u.strokeStyle = "#0f172a";
  u.lineWidth = 2;
  u.beginPath();
  u.arc(f, r, zn, 0, Math.PI * 2);
  u.fill();
  u.stroke();
}

function ug(u: any, f: any) {
  u.save();
  for (let r = f.length - 1; r >= 0; r--) {
    const s = f[r];
    const y = Math.max(0, s.life / s.maxLife);
    u.fillStyle = s.color;
    u.globalAlpha = y;
    if (s.type === "boost") {
      u.beginPath();
      u.arc(s.x, s.y, s.size * (0.4 + 0.6 * y), 0, Math.PI * 2);
      u.fill();
    } else if (s.type === "spark") {
      u.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    } else if (s.type === "supersonic") {
      u.beginPath();
      u.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      u.fill();
    } else if (s.type === "demo_explosion") {
      u.beginPath();
      u.arc(s.x, s.y, s.size * (1.5 - y * 0.5), 0, Math.PI * 2);
      u.fill();
    }
  }
  u.restore();
}
// --- UI COMPONENTS & MAIN APP ---
const a2 = ({
  blueScore: u,
  orangeScore: f,
  timeLeft: r,
  isOvertime: s,
  matchState: y,
  gameMode: m,
  botDifficulty: g,
  physicsMode: pMode = "rocket_league",
  isPaused: p,
  onTogglePause: A,
  onOpenSettings: C,
  onResetMatch: z,
  isFullscreen: isFull,
  onToggleFullscreen: toggleFull,
  onOpenControls: openControls
}: any) => {
  const N = Math.floor(Math.max(0, r) / 60);
  const D = Math.floor(Math.max(0, r) % 60);
  const X = `${N}:${D < 10 ? "0" : ""}${D}`;

  const difficultyBadges: Record<string, { text: string; color: string }> = {
    rookie: { text: "Rookie", color: "text-emerald-400 border-emerald-500/50 bg-emerald-950/80" },
    pro: { text: "Pro", color: "text-amber-400 border-amber-500/50 bg-amber-950/80" },
    allstar: { text: "All-Star", color: "text-purple-400 border-purple-500/50 bg-purple-950/80" },
    ssl: { text: "🔥 SSL", color: "text-rose-400 border-rose-500/60 bg-rose-950/90 font-black" },
    unfair: { text: "💀 Unfair", color: "text-red-400 border-red-500/80 bg-red-950/90 font-black" }
  };

  const modeLabels: Record<string, string> = {
    "1v1": "1 vs 1",
    "2v2": "2 vs 2",
    training: "Free Play",
    bot_vs_bot: "Bot vs Bot"
  };

  return d.jsx("div", {
    className: "absolute top-3 left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-4 select-none",
    children: d.jsxs("div", {
      className: "relative flex items-center justify-between w-full max-w-6xl pointer-events-auto",
      children: [
        // Left: Game Mode & Bot Difficulty badges
        d.jsxs("div", {
          className: "flex items-center gap-2",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs font-gaming font-bold text-slate-200",
              children: [
                d.jsx(Is, { className: "w-3.5 h-3.5 text-amber-400" }),
                d.jsx("span", { children: modeLabels[m] || m })
              ]
            }),
            m !== "training" && difficultyBadges[g] &&
              d.jsx("div", {
                className: `px-3 py-1.5 rounded-xl border text-xs font-gaming flex items-center gap-1 backdrop-blur-md shadow-lg ${difficultyBadges[g].color}`,
                children: d.jsx("span", { children: difficultyBadges[g].text })
              }),
            d.jsxs("div", {
              className: `px-2.5 py-1.5 rounded-xl border text-[11px] font-gaming font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg ${
                pMode === "legacy" ? "text-amber-400 border-amber-500/50 bg-amber-950/80" : "text-sky-400 border-sky-500/50 bg-sky-950/80"
              }`,
              children: [
                d.jsx(Ru, { className: "w-3 h-3" }),
                d.jsx("span", { children: pMode === "legacy" ? "Classic / Arcade" : "RL Pro Physics" })
              ]
            })
          ]
        }),

        // Center: Tournament Scoreboard Pod
        d.jsxs("div", {
          className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center shadow-2xl rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950/90 backdrop-blur-md",
          children: [
            // Blue Score Pod (Numbers only)
            d.jsx("div", {
              className: "flex items-center justify-center px-6 py-2 bg-gradient-to-r from-sky-600 to-sky-700 text-white min-w-[76px] shadow-inner",
              children: d.jsx("span", {
                className: "text-3xl md:text-4xl font-gaming font-black tracking-tight drop-shadow-md",
                children: u
              })
            }),

            // Center Clock Pod
            d.jsx("div", {
              className: "px-6 py-2 flex flex-col items-center justify-center min-w-[110px] bg-slate-900/95 border-x border-slate-800",
              children: s
                ? d.jsxs("div", {
                    className: "flex flex-col items-center",
                    children: [
                      d.jsx("span", {
                        className: "text-[10px] font-gaming font-black uppercase tracking-widest text-amber-400 animate-pulse",
                        children: "OVERTIME"
                      }),
                      d.jsxs("span", {
                        className: "text-lg font-gaming font-black text-amber-300",
                        children: ["+", X]
                      })
                    ]
                  })
                : m === "training"
                ? d.jsx("span", {
                    className: "text-xs font-gaming font-black text-slate-300 tracking-widest",
                    children: "FREE PLAY"
                  })
                : d.jsx("span", {
                    className: "text-2xl font-gaming font-black text-white tracking-widest",
                    children: X
                  })
            }),

            // Orange Score Pod (Numbers only)
            d.jsx("div", {
              className: "flex items-center justify-center px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white min-w-[76px] shadow-inner",
              children: d.jsx("span", {
                className: "text-3xl md:text-4xl font-gaming font-black tracking-tight drop-shadow-md",
                children: f
              })
            })
          ]
        }),

        // Right: Control Icons + Controls Help Button
        d.jsxs("div", {
          className: "flex items-center gap-2",
          children: [
            d.jsx("button", {
              onClick: toggleFull,
              className: "p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer",
              title: isFull ? "Exit Fullscreen (F)" : "Fullscreen (F)",
              children: isFull ? d.jsx(Minimize, { className: "w-4 h-4" }) : d.jsx(Maximize, { className: "w-4 h-4" })
            }),
            d.jsx("button", {
              onClick: A,
              className: "p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer",
              title: p ? "Resume (P)" : "Pause (P)",
              children: p ? d.jsx(Hg, { className: "w-4 h-4" }) : d.jsx(wg, { className: "w-4 h-4" })
            }),
            d.jsx("button", {
              onClick: z,
              className: "p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer",
              title: "Restart Match (R)",
              children: d.jsx(im, { className: "w-4 h-4" })
            }),
            d.jsx("button", {
              onClick: C,
              className: "p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/70 shadow-lg transition cursor-pointer",
              title: "Match Settings",
              children: d.jsx(cm, { className: "w-4 h-4" })
            }),
            d.jsxs("button", {
              onClick: openControls,
              className: "flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-gaming font-bold text-xs shadow-lg border border-sky-400/40 transition cursor-pointer active:scale-95",
              title: "Controls & Mechanics Guide",
              children: [
                d.jsx(Ng, { className: "w-4 h-4" }),
                d.jsx("span", { children: "Controls" })
              ]
            })
          ]
        })
      ]
    })
  });
};

const n2 = ({ playerCar: u }: any) => {
  if (!u) return null;
  const boostVal = Math.round(Math.max(0, Math.min(100, u.boost)));
  const speedKmh = Math.round((Math.hypot(u.vx, u.vy) / 10) * 1.6);
  const isSupersonic = u.isSupersonic;
  const hasFlip = u.jumpCount < 2 && (u.isGrounded ? true : u.flipWindowTimer < 1.35 || u.jumpCount === 0);

  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const arcLength = circ * 0.75;
  const strokeOffset = arcLength - (boostVal / 100) * arcLength;

  return d.jsxs("div", {
    className: "absolute bottom-6 right-6 z-20 flex flex-col items-end pointer-events-none select-none",
    children: [
      d.jsxs("div", {
        className: "relative w-40 h-40 flex items-center justify-center",
        children: [
          // Circular dial track
          d.jsxs("svg", {
            className: "w-full h-full transform rotate-[135deg]",
            viewBox: "0 0 140 140",
            children: [
              d.jsx("circle", {
                cx: "70",
                cy: "70",
                r: radius,
                fill: "transparent",
                stroke: "rgba(15, 23, 42, 0.8)",
                strokeWidth: "12",
                strokeDasharray: `${arcLength} ${circ}`,
                strokeLinecap: "round"
              }),
              d.jsx("circle", {
                cx: "70",
                cy: "70",
                r: radius,
                fill: "transparent",
                stroke: boostVal > 25 ? "url(#boostGradientRef)" : "#ef4444",
                strokeWidth: "12",
                strokeDasharray: `${arcLength} ${circ}`,
                strokeDashoffset: strokeOffset,
                strokeLinecap: "round",
                className: "transition-all duration-75"
              }),
              d.jsx("defs", {
                children: d.jsxs("linearGradient", {
                  id: "boostGradientRef",
                  x1: "0%",
                  y1: "0%",
                  x2: "100%",
                  y2: "100%",
                  children: [
                    d.jsx("stop", { offset: "0%", stopColor: "#f59e0b" }),
                    d.jsx("stop", { offset: "70%", stopColor: "#f97316" }),
                    d.jsx("stop", { offset: "100%", stopColor: "#ef4444" })
                  ]
                })
              })
            ]
          }),

          // Center Boost Reading (1:1 with reference image: +33 BOOST)
          d.jsxs("div", {
            className: "absolute flex flex-col items-center justify-center text-center",
            children: [
              d.jsxs("div", {
                className: "flex items-center text-amber-400 -mt-1",
                children: [
                  d.jsx(Ru, { className: "w-4 h-4 fill-amber-400 mr-0.5" }),
                  d.jsxs("span", {
                    className: "text-4xl font-gaming font-black tracking-tight text-white drop-shadow-md",
                    children: [boostVal > 0 ? "+" : "", boostVal]
                  })
                ]
              }),
              d.jsx("span", {
                className: "text-[10px] font-gaming font-black uppercase tracking-widest text-slate-300",
                children: "BOOST"
              })
            ]
          })
        ]
      }),

      // Speedometer badge & Flight status pill
      d.jsxs("div", {
        className: "mt-1 flex items-center gap-2",
        children: [
          d.jsxs("div", {
            className: "px-3 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs font-mono font-bold text-slate-200 shadow",
            children: [speedKmh, " KM/H"]
          }),
          d.jsx("div", {
            className: `px-3 py-1 rounded-lg text-xs font-gaming font-black tracking-wider border transition ${
              u.hasFlipReset
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse"
                : isSupersonic
                ? "bg-gradient-to-r from-orange-600 to-rose-600 text-white border-amber-400 shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse"
                : u.isGrounded
                ? "bg-emerald-600/90 text-white border-emerald-400/50 shadow"
                : hasFlip
                ? "bg-sky-600/90 text-white border-sky-400/50 shadow"
                : "bg-slate-800/80 text-slate-400 border-slate-700"
            }`,
            children: u.hasFlipReset
              ? "✨ RESET READY"
              : isSupersonic
              ? "⚡ SUPERSONIC"
              : u.isGrounded
              ? "GROUNDED"
              : hasFlip
              ? "FLIP READY"
              : "AIRBORNE"
          })
        ]
      })
    ]
  });
};

const u2 = ({ messages: u, onSendMessage: f }: any) => {
  const [isOpen, setIsOpen] = st.useState(false);
  const quickChatOptions = [
    {
      label: "Reactions",
      items: ["What a save!", "Nice shot!", "Calculated.", "Savage!"]
    },
    {
      label: "Team",
      items: ["Defending...", "Take the shot!", "Need boost!", "Great pass!"]
    },
    {
      label: "Compliments",
      items: ["Thanks!", "No problem.", "OMG!", "Close one!"]
    }
  ];

  st.useEffect(() => {
    const handleKey = (p: any) => {
      if ((p.key === "t" || p.key === "T" || p.key === "c" || p.key === "C") && p.target.tagName !== "INPUT") {
        setIsOpen(prev => !prev);
      }
      if (p.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const sendAndClose = (msg: string) => {
    f(msg);
    setIsOpen(false);
  };

  return d.jsxs("div", {
    className: "absolute top-16 left-5 z-30 flex flex-col gap-2 pointer-events-none select-none",
    children: [
      // Recent killfeed / chat notification items (matching screenshot!)
      d.jsx("div", {
        className: "flex flex-col gap-1.5 max-w-sm",
        children: u.slice(-5).map((g: any) => {
          const isBlue = g.team === "blue";
          return d.jsxs("div", {
            className: "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs shadow-lg animate-fade-in font-gaming",
            children: [
              d.jsx("span", { className: "text-slate-400", children: "☠️" }),
              d.jsxs("span", {
                className: `font-bold ${isBlue ? "text-sky-400" : "text-orange-400"}`,
                children: [g.sender, ":"]
              }),
              d.jsx("span", {
                className: "text-slate-100 font-medium",
                children: g.text
              })
            ]
          }, g.id);
        })
      }),

      // Chat Toggle Button / Popover
      d.jsx("div", {
        className: "pointer-events-auto mt-1",
        children: isOpen
          ? d.jsxs("div", {
              className: "bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-2xl w-72 text-slate-100 animate-fade-in",
              children: [
                d.jsxs("div", {
                  className: "flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3",
                  children: [
                    d.jsx("span", {
                      className: "text-xs font-gaming font-black text-slate-200 uppercase tracking-wider",
                      children: "Quick Chat"
                    }),
                    d.jsx("button", {
                      onClick: () => setIsOpen(false),
                      className: "text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer",
                      children: "✕"
                    })
                  ]
                }),
                d.jsx("div", {
                  className: "space-y-3",
                  children: quickChatOptions.map(cat =>
                    d.jsxs("div", {
                      children: [
                        d.jsx("div", {
                          className: "text-[10px] font-gaming font-bold text-slate-400 uppercase tracking-wider mb-1.5",
                          children: cat.label
                        }),
                        d.jsx("div", {
                          className: "grid grid-cols-2 gap-1.5",
                          children: cat.items.map(msg =>
                            d.jsx("button", {
                              onClick: () => sendAndClose(msg),
                              className: "text-left px-2.5 py-1.5 bg-slate-900 hover:bg-sky-600 hover:text-white text-slate-200 text-xs rounded-lg transition truncate border border-slate-800/80 cursor-pointer font-gaming font-semibold",
                              children: msg
                            }, msg)
                          )
                        })
                      ]
                    }, cat.label)
                  )
                })
              ]
            })
          : d.jsxs("button", {
              onClick: () => setIsOpen(true),
              className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/70 text-xs font-gaming font-bold transition shadow-lg cursor-pointer",
              title: "Quick Chat (Press T)",
              children: [
                d.jsx(jg, { className: "w-3.5 h-3.5 text-sky-400" }),
                d.jsx("span", { children: "Chat (T)" })
              ]
            })
      })
    ]
  });
};

const i2 = ({ playerCar: u }: any) => {
  const [hasTouch, setHasTouch] = st.useState(false);
  st.useEffect(() => {
    setHasTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!hasTouch || !u) return null;
  const setInput = (key: string, val: boolean) => {
    if (u) u.input[key] = val;
  };

  return d.jsxs("div", {
    className: "absolute inset-x-0 bottom-4 z-30 flex justify-between items-end px-6 pointer-events-none select-none",
    children: [
      d.jsxs("div", {
        className: "flex flex-col items-center gap-1 pointer-events-auto",
        children: [
          d.jsx("button", {
            onTouchStart: () => setInput("pitchUp", true),
            onTouchEnd: () => setInput("pitchUp", false),
            className: "w-14 h-12 bg-slate-900/90 active:bg-slate-700 text-white rounded-t-xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95",
            children: d.jsx(pg, { className: "w-6 h-6" })
          }),
          d.jsxs("div", {
            className: "flex gap-2",
            children: [
              d.jsx("button", {
                onTouchStart: () => {
                  setInput("steerLeft", true);
                  setInput("throttleReverse", true);
                },
                onTouchEnd: () => {
                  setInput("steerLeft", false);
                  setInput("throttleReverse", false);
                },
                className: "w-14 h-14 bg-slate-900/90 active:bg-slate-700 text-white rounded-l-xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95",
                children: d.jsx(mg, { className: "w-6 h-6" })
              }),
              d.jsx("button", {
                onTouchStart: () => {
                  setInput("steerRight", true);
                  setInput("throttleForward", true);
                },
                onTouchEnd: () => {
                  setInput("steerRight", false);
                  setInput("throttleForward", false);
                },
                className: "w-14 h-14 bg-slate-900/90 active:bg-slate-700 text-white rounded-r-xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95",
                children: d.jsx(vg, { className: "w-6 h-6" })
              })
            ]
          }),
          d.jsx("button", {
            onTouchStart: () => setInput("pitchDown", true),
            onTouchEnd: () => setInput("pitchDown", false),
            className: "w-14 h-12 bg-slate-900/90 active:bg-slate-700 text-white rounded-b-xl border border-slate-700 flex items-center justify-center shadow-lg active:scale-95",
            children: d.jsx(dg, { className: "w-6 h-6" })
          })
        ]
      }),
      d.jsxs("div", {
        className: "flex items-center gap-4 pointer-events-auto mr-40",
        children: [
          d.jsxs("button", {
            onTouchStart: () => setInput("jump", true),
            onTouchEnd: () => setInput("jump", false),
            className: "w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-gaming font-black text-sm uppercase shadow-xl shadow-sky-500/30 border-2 border-sky-300 flex flex-col items-center justify-center active:scale-90",
            children: [d.jsx(bg, { className: "w-7 h-7" }), d.jsx("span", { children: "JUMP" })]
          }),
          d.jsxs("button", {
            onTouchStart: () => setInput("boost", true),
            onTouchEnd: () => setInput("boost", false),
            className: "w-22 h-22 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-gaming font-black text-sm uppercase shadow-2xl shadow-orange-500/40 border-2 border-amber-300 flex flex-col items-center justify-center active:scale-90",
            children: [d.jsx(Ru, { className: "w-8 h-8 fill-amber-200 text-amber-200" }), d.jsx("span", { children: "BOOST" })]
          })
        ]
      })
    ]
  });
};

// Skill / Mechanic Alert Banners (Overhead badges on canvas used instead)
const v2 = () => null;

const c2 = ({
  onResetBall: u,
  onDribbleSetup: s,
  onPassToMe: f,
  onHighAerialSetup: r,
  onMustySetup: musty,
  onFlipResetSetup: reset,
  onPinchSetup: pinch,
  onDoubleTapSetup: dbl,
  onPsychoSetup: psycho,
  infiniteBoost: y,
  onToggleInfiniteBoost: m
}: any) =>
  d.jsxs("div", {
    className: "absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2 pointer-events-auto bg-slate-950/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 shadow-2xl select-none",
    children: [
      d.jsxs("span", {
        className: "text-xs font-gaming font-black text-amber-400 uppercase tracking-wider px-2 flex items-center gap-1",
        children: [d.jsx(om, { className: "w-3.5 h-3.5" }), "Free Play"]
      }),
      d.jsxs("button", {
        onClick: u,
        className: "px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-gaming font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition cursor-pointer",
        title: "Reset ball to center (Key 1)",
        children: [d.jsx(Bg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Reset [1]" })]
      }),
      d.jsxs("button", {
        onClick: s,
        className: "px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-gaming font-bold rounded-xl border border-emerald-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Place ball on roof for dribbling & flicks (Key 2)",
        children: [d.jsx(Qg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Dribble [2]" })]
      }),
      d.jsxs("button", {
        onClick: f,
        className: "px-2.5 py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-gaming font-bold rounded-xl border border-sky-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "High pass in front of car (Key 3)",
        children: [d.jsx(Xg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Pass [3]" })]
      }),
      d.jsxs("button", {
        onClick: r,
        className: "px-2.5 py-1.5 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-gaming font-bold rounded-xl border border-purple-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "High aerial bounce off wall (Key 4)",
        children: [d.jsx(Rg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Aerial [4]" })]
      }),
      d.jsxs("button", {
        onClick: musty,
        className: "px-2.5 py-1.5 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-gaming font-bold rounded-xl border border-purple-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Musty flick air setup (Key 5)",
        children: [d.jsx(sm, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Musty [5]" })]
      }),
      d.jsxs("button", {
        onClick: reset,
        className: "px-2.5 py-1.5 bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-gaming font-bold rounded-xl border border-amber-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "High lob for flip reset (Key 6)",
        children: [d.jsx(om, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Reset [6]" })]
      }),
      d.jsxs("button", {
        onClick: pinch,
        className: "px-2.5 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-gaming font-bold rounded-xl border border-rose-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Kuxir pinch wall setup (Key 7)",
        children: [d.jsx(sm, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Pinch [7]" })]
      }),
      d.jsxs("button", {
        onClick: dbl,
        className: "px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-gaming font-bold rounded-xl border border-emerald-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Backboard double tap setup (Key 8)",
        children: [d.jsx(Qg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Double Tap [8]" })]
      }),
      d.jsxs("button", {
        onClick: psycho,
        className: "px-2.5 py-1.5 bg-red-600/90 hover:bg-red-500 text-white text-xs font-gaming font-bold rounded-xl border border-red-400/40 flex items-center gap-1.5 transition cursor-pointer",
        title: "Psycho redirect setup (Key 9)",
        children: [d.jsx(Xg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Psycho [9]" })]
      }),
      d.jsxs("button", {
        onClick: m,
        className: `px-2.5 py-1.5 text-xs font-gaming font-black rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
          y ? "bg-amber-500 text-slate-950 border-amber-300" : "bg-slate-900 text-slate-400 border-slate-700"
        }`,
        title: "Infinite Boost Toggle",
        children: [d.jsx(Ru, { className: "w-3.5 h-3.5 fill-current" }), d.jsx("span", { children: y ? "Boost: ∞" : "Boost: 100" })]
      })
    ]
  });

const f2 = ({ isOpen: u, settings: f, onUpdateSettings: r, onClose: s, onApplyAndRestart: y }: any) => {
  if (!u) return null;

  const difficulties = [
    {
      id: "rookie",
      name: "Rookie",
      badge: "Easy",
      description: "Slow reaction, stays grounded, avoids aerials, light sparring partner.",
      features: ["Ground driving", "No double jumps", "Relaxed pace"],
      color: "text-emerald-400",
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10"
    },
    {
      id: "pro",
      name: "Pro",
      badge: "Medium",
      description: "Actively tracks the ball, uses single jumps and boost, rotates back to net.",
      features: ["Basic jumps", "Goal line defense", "Direct boost paths"],
      color: "text-amber-400",
      border: "border-amber-500/40",
      bg: "bg-amber-500/10"
    },
    {
      id: "allstar",
      name: "All-Star",
      badge: "Hard",
      description: "Interprets aerial trajectories, double jumps, controls 100 boost pads, strikes with flips.",
      features: ["Double jumps", "Goal saves", "100 boost control", "Power flips"],
      color: "text-purple-400",
      border: "border-purple-500/40",
      bg: "bg-purple-500/10"
    },
    {
      id: "ssl",
      name: "🔥 SSL Terminator",
      badge: "Insane",
      description: "Aggressive Grand Champion AI: dribbles on roof, fast aerials, wall bounces, and supersonic demos!",
      features: ["Roof ball carry", "45° power flicks", "Fast ceiling aerials", "Aggressive demos"],
      color: "text-rose-400",
      border: "border-rose-500/60",
      bg: "bg-rose-500/15"
    },
    {
      id: "unfair",
      name: "☠️ Unfair Cheat Bot",
      badge: "Impossible",
      description: "Ruthless perfection: 0ms reaction, boost starving, geometric top-corner snipes, iron defense!",
      features: ["Predator boost starve", "Corner snipes", "Supersonic demos", "Toxic quick chat"],
      color: "text-red-400",
      border: "border-red-500/80",
      bg: "bg-red-950/40"
    }
  ];

  const gameModes = [
    {
      id: "1v1",
      name: "1 vs 1 Duel",
      desc: "Classic competitive duel against chosen Bot AI",
      icon: d.jsx(Is, { className: "w-4 h-4 text-sky-400" })
    },
    {
      id: "2v2",
      name: "2 vs 2 Team",
      desc: "You & an AI teammate against two AI opponents",
      icon: d.jsx(Wg, { className: "w-4 h-4 text-emerald-400" })
    },
    {
      id: "training",
      name: "Free Play (Training)",
      desc: "Open practice pitch with instant mechanic setup keys",
      icon: d.jsx(om, { className: "w-4 h-4 text-amber-400" })
    },
    {
      id: "bot_vs_bot",
      name: "Bot vs Bot (Spectator)",
      desc: "Watch AI match with full DVR rewind and slow-mo",
      icon: d.jsx(Eg, { className: "w-4 h-4 text-purple-400" })
    }
  ];

  return d.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md",
    children: d.jsxs("div", {
      className: "bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in text-slate-100 font-sans",
      children: [
        // Modal Header
        d.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                d.jsx(cm, { className: "w-5 h-5 text-sky-400" }),
                d.jsx("h2", {
                  className: "text-base font-gaming font-black tracking-wider text-white uppercase",
                  children: "Match Settings & Bot Difficulty"
                })
              ]
            }),
            d.jsx("button", {
              onClick: s,
              className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer",
              children: d.jsx(rm, { className: "w-5 h-5" })
            })
          ]
        }),

        // Modal Body
        d.jsxs("div", {
          className: "p-6 space-y-6 overflow-y-auto",
          children: [
            // Game Mode
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2.5 block",
                  children: "Game Mode"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                  children: gameModes.map(p => {
                    const active = f.mode === p.id;
                    return d.jsxs("button", {
                      onClick: () => r({ ...f, mode: p.id }),
                      className: `p-3 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                        active ? "bg-sky-600/20 border-sky-400 text-white shadow-lg" : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`,
                      children: [
                        d.jsx("div", { className: "p-2 rounded-xl bg-slate-800 mt-0.5", children: p.icon }),
                        d.jsxs("div", {
                          children: [
                            d.jsxs("div", {
                              className: "font-gaming font-bold text-sm text-white flex items-center gap-1.5",
                              children: [p.name, active && d.jsx(Wh, { className: "w-4 h-4 text-sky-400" })]
                            }),
                            d.jsx("div", { className: "text-xs text-slate-400 mt-0.5", children: p.desc })
                          ]
                        })
                      ]
                    }, p.id);
                  })
                })
              ]
            }),

            // Physics Engine Mode
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2.5 block",
                  children: "Physics Engine Mode"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5",
                  children: [
                    {
                      id: "rocket_league",
                      name: "Rocket League Pro",
                      badge: "Realistic & Dribbling",
                      color: "text-sky-400",
                      bg: "bg-sky-950/40",
                      border: "border-sky-500/70",
                      desc: "Authentic Rocket League pacing and mechanics: unified 720 gravity, smooth ground push dribbling, sticky roof ball carries, and high-velocity flicks.",
                      features: ["Roof Carry Dribble", "45° & Musty Flicks", "Smooth Ground Roll", "Unified 720 Gravity", "Pro Speed Scaling"]
                    },
                    {
                      id: "legacy",
                      name: "Classic / Arcade",
                      badge: "Original",
                      color: "text-amber-400",
                      bg: "bg-amber-950/40",
                      border: "border-amber-500/70",
                      desc: "Exact original fast-paced arcade physics: high bounce turf (0.76 restitution), front bumper pop kicks, high car speeds (650/1250 px/s), and extreme pinches.",
                      features: ["Original 850/1050 Gravity", "Bumper Pop Launches", "Fast Paced (1250 Boost)", "Original Arena Bounces", "Extreme Pinches"]
                    }
                  ].map(p => {
                    const active = (f.physicsMode || "rocket_league") === p.id;
                    return d.jsxs("button", {
                      key: p.id,
                      onClick: () => r({ ...f, physicsMode: p.id }),
                      className: `p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                        active ? `${p.bg} ${p.border} shadow-lg ring-1 ring-white/20` : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                      }`,
                      children: [
                        d.jsxs("div", {
                          className: "flex items-center justify-between mb-1",
                          children: [
                            d.jsxs("div", {
                              className: "flex items-center gap-2",
                              children: [
                                d.jsx("span", { className: `font-gaming font-black text-sm ${p.color}`, children: p.name }),
                                d.jsx("span", {
                                  className: "text-[10px] px-2 py-0.5 rounded-full font-gaming font-bold bg-slate-800 text-slate-300 border border-slate-700",
                                  children: p.badge
                                })
                              ]
                            }),
                            active &&
                              d.jsxs("div", {
                                className: "flex items-center gap-1 text-xs font-gaming font-bold text-sky-400",
                                children: [d.jsx(Wh, { className: "w-4 h-4" }), d.jsx("span", { children: "Active" })]
                              })
                          ]
                        }),
                        d.jsx("p", { className: "text-xs text-slate-300 mb-2 leading-relaxed", children: p.desc }),
                        d.jsx("div", {
                          className: "flex flex-wrap gap-1.5",
                          children: p.features.map(c =>
                            d.jsx("span", {
                              key: c,
                              className: "text-[10px] font-gaming px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50",
                              children: c
                            })
                          )
                        })
                      ]
                    });
                  })
                })
              ]
            }),

            // Bot Difficulty
            f.mode !== "training" &&
              d.jsxs("div", {
                children: [
                  d.jsx("label", {
                    className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2.5 block",
                    children: "Bot Difficulty"
                  }),
                  d.jsx("div", {
                    className: "grid grid-cols-1 gap-2.5",
                    children: difficulties.map(p => {
                      const active = f.botDifficulty === p.id;
                      return d.jsxs("button", {
                        onClick: () => r({ ...f, botDifficulty: p.id }),
                        className: `p-3.5 rounded-2xl border text-left transition cursor-pointer relative ${
                          active ? `${p.bg} ${p.border} shadow-lg ring-1 ring-white/20` : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                        }`,
                        children: [
                          d.jsxs("div", {
                            className: "flex items-center justify-between mb-1",
                            children: [
                              d.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  d.jsx("span", { className: `font-gaming font-black text-sm ${p.color}`, children: p.name }),
                                  d.jsx("span", {
                                    className: "text-[10px] px-2 py-0.5 rounded-full font-gaming font-bold bg-slate-800 text-slate-300 border border-slate-700",
                                    children: p.badge
                                  })
                                ]
                              }),
                              active &&
                                d.jsxs("div", {
                                  className: "flex items-center gap-1 text-xs font-gaming font-bold text-sky-400",
                                  children: [d.jsx(Wh, { className: "w-4 h-4" }), d.jsx("span", { children: "Active" })]
                                })
                            ]
                          }),
                          d.jsx("p", { className: "text-xs text-slate-300 mb-2 leading-relaxed", children: p.description }),
                          d.jsx("div", {
                            className: "flex flex-wrap gap-1.5",
                            children: p.features.map(c =>
                              d.jsx("span", {
                                className: "text-[10px] font-gaming px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50",
                                children: c
                              }, c)
                            )
                          })
                        ]
                      }, p.id);
                    })
                  })
                ]
              }),

            // Match Duration
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2 block",
                  children: "Match Duration"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-4 gap-2",
                  children: [
                    { val: 60, label: "1 Min" },
                    { val: 180, label: "3 Min" },
                    { val: 300, label: "5 Min" },
                    { val: 9999, label: "Unlimited" }
                  ].map(p =>
                    d.jsx("button", {
                      onClick: () => r({ ...f, matchDuration: p.val }),
                      className: `py-2.5 px-3 rounded-xl border text-xs font-gaming font-bold transition text-center cursor-pointer ${
                        f.matchDuration === p.val ? "bg-sky-600 border-sky-400 text-white shadow" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`,
                      children: p.label
                    }, p.val)
                  )
                })
              ]
            }),

            // Jump Keybind
            d.jsxs("div", {
              children: [
                d.jsx("label", {
                  className: "text-xs font-gaming font-bold uppercase tracking-wider text-slate-400 mb-2 block",
                  children: "Jump Keybind"
                }),
                d.jsx("div", {
                  className: "grid grid-cols-2 gap-2",
                  children: [
                    { id: "space", label: "Spacebar", desc: "Classic keyboard jump" },
                    { id: "rmb", label: "Right Click (RMB)", desc: "Mouse right button" }
                  ].map(p =>
                    d.jsxs("button", {
                      key: p.id,
                      onClick: () => r({ ...f, jumpKey: p.id }),
                      className: `py-2.5 px-3 rounded-xl border text-left transition cursor-pointer ${
                        (f.jumpKey || "space") === p.id ? "bg-sky-600 border-sky-400 text-white shadow" : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`,
                      children: [
                        d.jsx("div", { className: "text-xs font-gaming font-bold", children: p.label }),
                        d.jsx("div", { className: "text-[10px] text-slate-400 mt-0.5", children: p.desc })
                      ]
                    })
                  )
                })
              ]
            }),

            // Audio & Ball Trajectory
            d.jsx("div", {
              className: "pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3",
              children: d.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  d.jsxs("button", {
                    onClick: () => r({ ...f, soundEnabled: !f.soundEnabled }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.soundEnabled ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      f.soundEnabled ? d.jsx(Ig, { className: "w-4 h-4" }) : d.jsx(t2, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.soundEnabled ? "Audio Enabled" : "Muted" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: () => r({ ...f, showTrajectory: !f.showTrajectory }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.showTrajectory ? "bg-sky-600/20 border-sky-500/50 text-sky-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      d.jsx(sm, { className: "w-4 h-4" }),
                      d.jsx("span", { children: "Ball Trajectory" })
                    ]
                  }),
                  d.jsxs("button", {
                    onClick: () => r({ ...f, showMechanicAlerts: f.showMechanicAlerts === false ? true : false }),
                    className: `flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-gaming font-bold transition cursor-pointer ${
                      f.showMechanicAlerts !== false ? "bg-purple-600/20 border-purple-500/50 text-purple-300" : "bg-slate-900 border-slate-800 text-slate-400"
                    }`,
                    children: [
                      d.jsx(Wh, { className: "w-4 h-4" }),
                      d.jsx("span", { children: f.showMechanicAlerts !== false ? "Mechanic Alerts: ON" : "Mechanic Alerts: OFF" })
                    ]
                  })
                ]
              })
            })
          ]
        }),

        // Modal Footer
        d.jsxs("div", {
          className: "flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/80",
          children: [
            d.jsx("button", {
              onClick: s,
              className: "px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-gaming font-bold transition cursor-pointer",
              children: "Cancel"
            }),
            d.jsxs("button", {
              onClick: y,
              className: "px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-gaming font-black uppercase tracking-wider shadow-lg shadow-sky-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer",
              children: [d.jsx(Ru, { className: "w-4 h-4" }), d.jsx("span", { children: "Apply & Restart Match" })]
            })
          ]
        })
      ]
    })
  });
};

const s2 = ({ jumpKey = "space", isOpen, onClose }: any) => {
  if (!isOpen) return null;

  return d.jsx("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none",
    children: d.jsxs("div", {
      className: "bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full text-slate-100 animate-fade-in font-sans",
      children: [
        d.jsxs("div", {
          className: "flex items-center justify-between pb-3 border-b border-slate-800 mb-4",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                d.jsx(zg, { className: "w-5 h-5 text-sky-400" }),
                d.jsx("span", {
                  className: "font-gaming font-black text-base text-white uppercase tracking-wider",
                  children: "Controls & Mechanics Guide"
                })
              ]
            }),
            d.jsx("button", {
              onClick: onClose,
              className: "p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer",
              children: d.jsx(rm, { className: "w-5 h-5" })
            })
          ]
        }),

        d.jsxs("div", {
          className: "space-y-2.5 text-xs font-gaming",
          children: [
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Drive / Throttle" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "W / ↑" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Brake / Reverse" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "S / ↓" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Steer (Ground) / Air Steer" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "A / D or ← / →" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Air Roll (Flip Ceiling / Wheels)" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-amber-300", children: "Q / E" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Dodge Flip (In Air)" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300", children: "WASD + Space" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Jump" }),
                d.jsx("span", {
                  className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-sky-300",
                  children: jumpKey === "rmb" ? "Right Click / Space" : "Spacebar"
                })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Rocket Boost" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-amber-300", children: "Shift / LMB / J" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Double Jump / Dodge Flip" }),
                d.jsx("span", { className: "font-mono text-slate-200", children: "WASD + Space in air" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5 border-b border-slate-800/80",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Quick Chat" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200", children: "T or C" })
              ]
            }),
            d.jsxs("div", {
              className: "flex justify-between items-center py-1.5",
              children: [
                d.jsx("span", { className: "text-slate-400", children: "Pause / Restart" }),
                d.jsx("span", { className: "font-mono font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200", children: "P / R" })
              ]
            })
          ]
        }),

        d.jsxs("div", {
          className: "mt-4 p-3 bg-sky-950/40 border border-sky-800/50 rounded-2xl text-xs text-sky-200 leading-relaxed font-sans",
          children: [
            d.jsxs("strong", { className: "text-white font-gaming", children: ["💡 ", "Authentic Rocket League Mechanics:"] }),
            d.jsxs("ul", {
              className: "list-disc list-inside mt-1.5 space-y-1 text-slate-300 text-[11px]",
              children: [
                d.jsxs("li", {
                  children: ["Accelerate past 840 km/h to enter ", d.jsx("strong", { className: "text-amber-300", children: "SUPERSONIC" }), " and demolish (demo) opponents on impact!"]
                }),
                d.jsx("li", { children: "Drive smoothly through the rounded ramps onto walls and the ceiling without losing traction!" }),
                d.jsxs("li", {
                  children: ["Touching all 4 wheels against the ball or ceiling grants an unlimited ", d.jsx("strong", { className: "text-amber-300", children: "FLIP RESET" }), "!"]
                })
              ]
            })
          ]
        })
      ]
    })
  });
};

const o2 = ({ goalInfo: u, kickoffCountdown: f }: any) =>
  d.jsxs("div", {
    className: "absolute inset-0 pointer-events-none z-40 flex items-center justify-center select-none",
    children: [
      u &&
        d.jsx("div", {
          className: "flex flex-col items-center animate-bounce-short",
          children: d.jsxs("div", {
            className: `px-14 py-6 rounded-3xl backdrop-blur-xl border-2 shadow-2xl flex flex-col items-center text-center font-gaming ${
              u.scoringTeam === "blue"
                ? "bg-gradient-to-b from-sky-600/95 to-blue-950/95 border-sky-400 text-white shadow-[0_0_90px_rgba(56,189,248,0.6)]"
                : "bg-gradient-to-b from-orange-600/95 to-rose-950/95 border-orange-400 text-white shadow-[0_0_90px_rgba(249,115,22,0.6)]"
            }`,
            children: [
              d.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  u.scoringTeam === "blue"
                    ? d.jsx(fm, { className: "w-12 h-12 fill-sky-200 text-sky-200 animate-pulse" })
                    : d.jsx($s, { className: "w-12 h-12 fill-orange-200 text-orange-200 animate-pulse" }),
                  d.jsx("span", {
                    className: "text-7xl font-black italic tracking-tighter uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]",
                    children: "GOAL!"
                  })
                ]
              }),
              d.jsxs("div", {
                className: "mt-2 text-xl font-bold text-slate-100 flex items-center gap-2",
                children: [
                  d.jsx("span", { className: "text-slate-300 text-sm", children: "Scored by:" }),
                  d.jsx("span", { className: "underline decoration-wavy decoration-amber-400 font-black", children: u.scorerName })
                ]
              }),
              d.jsxs("div", {
                className: "mt-3 px-5 py-1.5 rounded-full bg-black/50 border border-white/20 text-sm font-mono font-black text-amber-300 flex items-center gap-2 shadow-inner",
                children: [
                  d.jsx(Ru, { className: "w-4 h-4 fill-amber-300" }),
                  d.jsxs("span", { children: ["SHOT SPEED: ", u.speedKmh, " KM/H"] })
                ]
              })
            ]
          })
        }),
      f !== null && !u &&
        d.jsx("div", {
          className: "flex flex-col items-center",
          children: d.jsx("div", {
            className: `text-9xl font-gaming font-black italic tracking-tight uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.85)] transition-all duration-200 transform scale-110 ${
              f === 0 ? "text-emerald-400 scale-125" : f === 1 ? "text-amber-400" : f === 2 ? "text-sky-400" : "text-rose-400"
            }`,
            children: f === 0 ? "GO!" : f
          })
        })
    ]
  });

function interpolateSnapshots(s1:any,s2:any,t:number){
  if(!s1)return s2;
  if(!s2||t<=0)return s1;
  if(t>=1)return s2;
  const clampedT=Math.max(0,Math.min(1,t));
  return{
    time:s1.time+(s2.time-s1.time)*clampedT,
    ball:{
      ...s2.ball,
      x:s1.ball.x+(s2.ball.x-s1.ball.x)*clampedT,
      y:s1.ball.y+(s2.ball.y-s1.ball.y)*clampedT,
      vx:s1.ball.vx+(s2.ball.vx-s1.ball.vx)*clampedT,
      vy:s1.ball.vy+(s2.ball.vy-s1.ball.vy)*clampedT,
      spin:s1.ball.spin+(s2.ball.spin-s1.ball.spin)*clampedT,
      trail:s2.ball.trail
    },
    cars:s1.cars.map((c1:any)=>{
      const c2=s2.cars.find((c:any)=>c.id===c1.id);
      if(!c2)return c1;
      const diff=Math.atan2(Math.sin(c2.angle-c1.angle),Math.cos(c2.angle-c1.angle));
      return{
        ...c2,
        x:c1.x+(c2.x-c1.x)*clampedT,
        y:c1.y+(c2.y-c1.y)*clampedT,
        vx:c1.vx+(c2.vx-c1.vx)*clampedT,
        vy:c1.vy+(c2.vy-c1.vy)*clampedT,
        angle:c1.angle+diff*clampedT,
        boost:c1.boost+(c2.boost-c1.boost)*clampedT
      };
    })
  };
}


function getSnapshotAtTime(frames: any[], targetTime: number) {
  if (!frames || frames.length === 0) return null;
  if (frames.length === 1 || targetTime <= frames[0].time) return frames[0];
  if (targetTime >= frames[frames.length - 1].time) return frames[frames.length - 1];
  let low = 0, high = frames.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (frames[mid].time <= targetTime) {
      if (mid === frames.length - 1 || frames[mid + 1].time > targetTime) {
        const f1 = frames[mid], f2 = frames[mid + 1];
        const dt = f2.time - f1.time;
        const fract = dt > 0 ? (targetTime - f1.time) / dt : 0;
        return interpolateSnapshots(f1, f2, fract);
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return frames[0];
}
const GoalReplayOverlay = ({
  replayUI,
  onSkip,
  onSpeedToggle,
  onTogglePause,
  onScrub,
  onStep,
  onRestart,
}: {
  replayUI: any;
  onSkip: () => void;
  onSpeedToggle: (speed: number) => void;
  onTogglePause?: () => void;
  onScrub?: (progress: number) => void;
  onStep?: (deltaSec: number) => void;
  onRestart?: () => void;
}) => {
  if (!replayUI || !replayUI.active) return null;
  const isBlue = replayUI.info?.scoringTeam === "blue";
  const isSlowMo = (replayUI.speed || 1) < 1;

  return d.jsxs("div", {
    className: "absolute inset-0 pointer-events-none z-40 flex flex-col justify-between select-none animate-fade-in",
    children: [
      d.jsxs("div", {
        className: "w-full bg-gradient-to-b from-black/95 via-black/85 to-transparent pt-4 pb-10 px-6 flex items-center justify-between pointer-events-auto border-b border-white/10",
        children: [
          d.jsxs("div", {
            className: "flex items-center gap-3 flex-wrap",
            children: [
              d.jsxs("div", {
                className: "flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600/30 border border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.6)] backdrop-blur-md",
                children: [
                  d.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" }),
                  d.jsxs("span", {
                    className: "text-xs md:text-sm font-black uppercase tracking-widest text-red-100 flex items-center gap-1.5",
                    children: [
                      d.jsx(Video, { className: "w-4 h-4 text-red-400" }),
                      isSlowMo ? "⚡ SLOW-MO REPLAY" : "GOAL REPLAY",
                    ],
                  }),
                  d.jsxs("span", {
                    className: "ml-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[11px] font-mono shadow",
                    children: [replayUI.speed || 1, "x"],
                  }),
                ],
              }),
              replayUI.info &&
                d.jsxs("div", {
                  className: "flex items-center gap-2 px-4 py-1.5 rounded-xl border backdrop-blur-md shadow-lg " +
                    (isBlue
                      ? "bg-sky-950/90 border-sky-400/90 text-sky-200 shadow-sky-500/30"
                      : "bg-orange-950/90 border-orange-400/90 text-orange-200 shadow-orange-500/30"),
                  children: [
                    d.jsx("span", { className: "text-xs font-semibold text-slate-300", children: "Scored by:" }),
                    d.jsx("span", { className: "text-sm font-black tracking-tight", children: replayUI.info.scorerName }),
                    d.jsxs("span", {
                      className: "text-xs px-2 py-0.5 rounded-md bg-black/50 font-mono font-black text-amber-300 border border-amber-400/40",
                      children: ["⚡ ", replayUI.info.speedKmh, " KM/H"],
                    }),
                  ],
                }),
            ],
          }),
          d.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              d.jsxs("div", {
                className: "flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 backdrop-blur-md shadow-md",
                children: [
                  d.jsx("span", { className: "text-[10px] font-bold text-slate-400 px-2 uppercase hidden sm:inline", children: "Speed" }),
                  [0.25, 0.5, 0.75, 1.0].map(s =>
                    d.jsxs("button", {
                      key: s,
                      onClick: () => onSpeedToggle(s),
                      className: "px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition cursor-pointer " +
                        ((replayUI.speed || 1) === s
                          ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/80"),
                      children: [s, "x"],
                    })
                  ),
                ],
              }),
              d.jsxs("button", {
                onClick: onSkip,
                className: "flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs md:text-sm rounded-xl shadow-lg shadow-amber-500/40 transition active:scale-95 cursor-pointer border border-amber-300/60",
                children: [
                  d.jsx("span", { children: "Skip" }),
                  d.jsx("kbd", {
                    className: "px-1.5 py-0.5 rounded bg-amber-900/30 font-mono text-[11px] text-amber-950 border border-amber-900/20 font-bold",
                    children: "SPACE",
                  }),
                  d.jsx(SkipForward, { className: "w-4 h-4 text-slate-950 fill-current" }),
                ],
              }),
            ],
          }),
        ],
      }),
      d.jsxs("div", {
        className: "w-full bg-gradient-to-t from-black/95 via-black/85 to-transparent pb-4 pt-8 px-8 flex flex-col gap-2.5 pointer-events-auto border-t border-white/10",
        children: [
          d.jsxs("div", {
            className: "flex items-center justify-between text-xs font-mono text-slate-300 flex-wrap gap-2",
            children: [
              d.jsxs("div", {
                className: "flex items-center gap-3",
                children: [
                  d.jsxs("span", {
                    className: "font-bold flex items-center gap-1.5 text-amber-400",
                    children: [
                      d.jsx(Clock, { className: "w-3.5 h-3.5" }),
                      replayUI.currentSec || "0.0",
                      "s / ",
                      replayUI.totalSec || "5.0",
                      "s",
                    ],
                  }),
                  d.jsx("span", {
                    className: "text-[11px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 font-sans border border-slate-700",
                    children: replayUI.isPaused
                      ? "Replay Paused ⏸"
                      : isSlowMo
                      ? "Slow-Mo " + replayUI.speed + "x ▶"
                      : "Normal Speed (1.0x) ▶",
                  }),
                ],
              }),
              d.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  onRestart &&
                    d.jsxs("button", {
                      onClick: onRestart,
                      className: "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer",
                      title: "Restart from beginning",
                      children: [d.jsx(im, { className: "w-3.5 h-3.5" }), d.jsx("span", { className: "hidden sm:inline", children: "Restart" })],
                    }),
                  onStep &&
                    d.jsxs("button", {
                      onClick: () => onStep(-0.5),
                      className: "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer",
                      title: "-0.5s step",
                      children: [d.jsx(Rewind, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "-0.5s" })],
                    }),
                  onTogglePause &&
                    d.jsx("button", {
                      onClick: onTogglePause,
                      className: "px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow",
                      children: replayUI.isPaused
                        ? d.jsxs(d.Fragment, {
                            children: [d.jsx(Hg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Play" })],
                          })
                        : d.jsxs(d.Fragment, {
                            children: [d.jsx(wg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Pause" })],
                          }),
                    }),
                  onStep &&
                    d.jsxs("button", {
                      onClick: () => onStep(0.5),
                      className: "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer",
                      title: "+0.5s step",
                      children: [d.jsx("span", { children: "+0.5s" }), d.jsx(FastForward, { className: "w-3.5 h-3.5" })],
                    }),
                ],
              }),
            ],
          }),
          d.jsx("div", {
            className: "w-full relative py-1",
            children: d.jsx("input", {
              type: "range",
              min: 0,
              max: 1,
              step: 0.005,
              value: Math.min(1, Math.max(0, replayUI.progress || 0)),
              onChange: (e: any) => {
                onScrub && onScrub(parseFloat(e.target.value));
              },
              className: "w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:accent-amber-300 transition",
            }),
          }),
          d.jsxs("div", {
            className: "flex justify-between items-center text-[10px] text-slate-400 font-sans",
            children: [
              d.jsx("span", { children: "0.0s (Start)" }),
              d.jsx("span", { className: "text-slate-500 hidden sm:inline", children: "Press [SPACE] to skip • [P] Pause • [← / →] Step Back / Forward" }),
              d.jsx("span", { className: "text-rose-400 font-bold", children: "GOAL! ⚽" }),
            ],
          }),
        ],
      }),
    ],
  });
};

const SpectatorDvrBar = ({
  isBotVsBot,
  dvrState,
  onTogglePlay,
  onScrub,
  onStep,
  onJump,
  onGoLive,
  onSpeedChange,
  availableSeconds,
}: any) => {
  const isLive = !dvrState.active || dvrState.offsetSec <= 0.08;
  const maxSec = Math.min(10, Math.max(1, availableSeconds || 10));
  const isSlowMo = (dvrState.speed || 1) < 1;

  return d.jsx("div", {
    className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl select-none pointer-events-auto animate-fade-in",
    children: d.jsxs("div", {
      className: "bg-slate-950/95 backdrop-blur-xl border-2 border-slate-700/90 shadow-[0_12px_45px_rgba(0,0,0,0.85)] rounded-2xl p-3 flex flex-col gap-2.5 text-slate-100",
      children: [
        d.jsxs("div", {
          className: "flex items-center justify-between gap-3 flex-wrap",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-2.5",
              children: [
                isLive
                  ? d.jsxs("div", {
                      className: "flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs tracking-wider",
                      children: [
                        d.jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" }),
                        d.jsx("span", { children: "🔴 LIVE" }),
                      ],
                    })
                  : d.jsxs("div", {
                      className: "flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/25 border border-amber-500/60 text-amber-300 font-black text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse",
                      children: [
                        d.jsx(Rewind, { className: "w-3.5 h-3.5 text-amber-400" }),
                        d.jsxs("span", { children: ["⏪ ", isSlowMo ? "SLOW-MO REPLAY: -" : "DVR REPLAY: -", dvrState.offsetSec.toFixed(1), " сек"] }),
                        d.jsx("span", {
                          className: "text-[10px] px-1.5 py-0.2 rounded font-mono font-bold " +
                            (dvrState.isPlaying ? "bg-amber-500/40 text-amber-200" : "bg-slate-800 text-slate-300"),
                          children: dvrState.isPlaying ? (dvrState.speed + "x ▶") : "PAUSED ⏸",
                        }),
                      ],
                    }),
                d.jsx("span", {
                  className: "text-xs font-semibold text-slate-400 hidden sm:inline",
                  children: isBotVsBot ? "Bot Spectator Mode (DVR up to 10s)" : "Match DVR Replay (up to 10s)",
                }),
              ],
            }),
            d.jsxs("div", {
              className: "flex items-center gap-1.5",
              children: [
                d.jsx("span", { className: "text-[11px] text-slate-400 font-medium hidden md:inline", children: "Rewind:" }),
                [10, 5, 2].map(sec =>
                  d.jsxs("button", {
                    key: sec,
                    onClick: () => onJump(sec),
                    className: "px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-bold font-mono transition cursor-pointer active:scale-95",
                    title: "Rewind " + sec + " seconds ago",
                    children: ["⏪ -", sec, "s"],
                  })
                ),
                d.jsxs("button", {
                  onClick: onGoLive,
                  disabled: isLive,
                  className: "flex items-center gap-1.5 px-3.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer " +
                    (isLive
                      ? "bg-slate-800/40 text-slate-500 border border-slate-800 cursor-default"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/40 border border-red-400 active:scale-95"),
                  children: [
                    d.jsx("span", { className: "w-2 h-2 rounded-full " + (isLive ? "bg-slate-500" : "bg-white animate-ping") }),
                    d.jsx("span", { children: "GO LIVE" }),
                  ],
                }),
              ],
            }),
          ],
        }),
        d.jsxs("div", {
          className: "flex flex-col gap-1 px-1",
          children: [
            d.jsx("input", {
              type: "range",
              min: 0,
              max: maxSec,
              step: 0.05,
              value: Math.max(0, maxSec - dvrState.offsetSec),
              onChange: (e: any) => {
                const val = parseFloat(e.target.value);
                const offset = Math.max(0, maxSec - val);
                onScrub(offset);
              },
              className: "w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition",
            }),
            d.jsxs("div", {
              className: "flex justify-between text-[10px] font-mono font-semibold text-slate-400 select-none",
              children: [
                d.jsxs("span", { children: ["-", maxSec.toFixed(0), "s"] }),
                d.jsxs("span", { children: ["-", (maxSec * 0.75).toFixed(1), "s"] }),
                d.jsxs("span", { children: ["-", (maxSec * 0.5).toFixed(1), "s"] }),
                d.jsxs("span", { children: ["-", (maxSec * 0.25).toFixed(1), "s"] }),
                d.jsx("span", { className: "text-emerald-400 font-bold", children: "LIVE (0s)" }),
              ],
            }),
          ],
        }),
        d.jsxs("div", {
          className: "flex items-center justify-between pt-1 border-t border-slate-800/80 flex-wrap gap-2",
          children: [
            d.jsxs("div", {
              className: "flex items-center gap-2",
              children: [
                d.jsx("button", {
                  onClick: onTogglePlay,
                  className: "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95",
                  children: dvrState.isPlaying
                    ? d.jsxs(d.Fragment, {
                        children: [d.jsx(wg, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "Pause" })],
                      })
                    : d.jsxs(d.Fragment, {
                        children: [
                          d.jsx(Hg, { className: "w-3.5 h-3.5" }),
                          d.jsx("span", { children: isLive ? "Play Replay" : "Воспроизвести" }),
                        ],
                      }),
                }),
                d.jsxs("button", {
                  onClick: () => onStep(0.5),
                  className: "px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95",
                  title: "Step back (-0.5s)",
                  children: [d.jsx(Rewind, { className: "w-3.5 h-3.5" }), d.jsx("span", { children: "-0.5s" })],
                }),
                d.jsxs("button", {
                  onClick: () => onStep(-0.5),
                  className: "px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95",
                  title: "Step forward (+0.5s)",
                  children: [d.jsx("span", { children: "+0.5с" }), d.jsx(FastForward, { className: "w-3.5 h-3.5" })],
                }),
              ],
            }),
            d.jsxs("div", {
              className: "flex items-center gap-1.5",
              children: [
                d.jsx("span", { className: "text-[11px] text-slate-400 font-medium", children: "Speed:" }),
                [0.25, 0.5, 0.75, 1, 1.5].map(sp =>
                  d.jsxs("button", {
                    key: sp,
                    onClick: () => onSpeedChange(sp),
                    className: "px-2 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer " +
                      ((dvrState.speed || 1) === sp
                        ? "bg-amber-500 text-slate-950 font-black shadow"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"),
                    children: [sp, "x"],
                  })
                ),
              ],
            }),
          ],
        }),
      ],
    }),
  });
};


function r2(){const u=st.useRef(null),containerRef=st.useRef(null),replayHistoryRef=st.useRef([]),goalReplayRef=st.useRef(null),lastGoalInfoRef=st.useRef(null),[goalReplayUI,setGoalReplayUI]=st.useState(null),[dvr,setDvr]=st.useState({active:!1,offsetSec:0,isPlaying:!1,speed:1}),dvrRef=st.useRef(dvr);dvrRef.current=dvr;const [isFullscreen,setIsFullscreen]=st.useState(!!document.fullscreenElement);const toggleFullscreen=st.useCallback(()=>{if(!document.fullscreenElement){const el=containerRef.current||document.documentElement;el.requestFullscreen?el.requestFullscreen():(el as any).webkitRequestFullscreen&& (el as any).webkitRequestFullscreen();}else{document.exitFullscreen?document.exitFullscreen():(document as any).webkitExitFullscreen&&(document as any).webkitExitFullscreen();}},[]);st.useEffect(()=>{const onFullChange=()=>setIsFullscreen(!!document.fullscreenElement);document.addEventListener("fullscreenchange",onFullChange);document.addEventListener("webkitfullscreenchange",onFullChange);return()=>{document.removeEventListener("fullscreenchange",onFullChange);document.removeEventListener("webkitfullscreenchange",onFullChange);};},[]);const getInitialSettings = () => {
    let savedPhysics = "rocket_league";
    try {
      const p = localStorage.getItem("rl_physics_mode");
      if (p === "legacy" || p === "rocket_league") savedPhysics = p;
    } catch (e) {}
    return {
      mode: "1v1",
      botDifficulty: "unfair",
      matchDuration: 180,
      arenaTheme: "classic",
      soundEnabled: !0,
      soundVolume: .5,
      showTrajectory: !1,
      showMechanicAlerts: !0,
      jumpKey: "space",
      physicsMode: savedPhysics
    };
  };
  const [f, r] = st.useState(getInitialSettings);
  const handleUpdateSettings = st.useCallback((newSettings: any) => {
    try {
      if (newSettings && newSettings.physicsMode) {
        localStorage.setItem("rl_physics_mode", newSettings.physicsMode);
      }
    } catch (e) {}
    r(newSettings);
  }, []);
  st.useEffect(() => {
    syncPhysicsGlobals(f.physicsMode || "rocket_league");
  }, [f.physicsMode]); const [s,y]=st.useState(!1),[m,g]=st.useState(!1),[p,A]=st.useState("kickoff"),[C,z]=st.useState(0),[N,D]=st.useState(0),[X,tt]=st.useState(180),[I,U]=st.useState(!1),[Tt,at]=st.useState(3),[Ht,ot]=st.useState(null),[Lt,Ft]=st.useState(!1),[J,dt]=st.useState([]),Gt=st.useRef([]),ht=st.useRef($()),ne=st.useRef(Yh()),Yt=st.useRef([]),Te=st.useRef(performance.now()),re=st.useRef(3),Xt=st.useRef(0),[B,W]=st.useState(null),[mechAlerts,setMechAlerts]=st.useState([]),[isControlsOpen,setIsControlsOpen]=st.useState(!1);function $(){return{x:Kt/2,y:k-Cu,vx:0,vy:0,radius:Cu,spin:0,lastTouchTeam:null,lastTouchPlayer:null,lastTouchTime:0,touchEffectTimer:0}}function bt(H,Z){const w=[];if(H==="1v1"){w.push(ut("p1","Player","blue",!1));const q=Z==="unfair"?getRandomMemeName("☠️"):Z==="ssl"?getRandomMemeName("🔥"):getRandomMemeName();w.push(ut("b1",q,"orange",!0,Z))}else if(H==="2v2"){w.push(ut("p1","Player","blue",!1)),w.push(ut("tm",getRandomMemeName("🤝"),"blue",!0,Z));const q=Z==="unfair"?getRandomMemeName("☠️"):Z==="ssl"?getRandomMemeName("👾"):getRandomMemeName(),Wt=Z==="unfair"?getRandomMemeName("👾"):getRandomMemeName();w.push(ut("b1",q,"orange",!0,Z)),w.push(ut("b2",Wt,"orange",!0,Z))}else H==="training"?w.push(ut("p1","Player","blue",!1)):H==="bot_vs_bot"&&(w.push(ut("b1",getRandomMemeName("🔵"),"blue",!0,"ssl")),w.push(ut("b2",getRandomMemeName("🟠"),"orange",!0,"ssl")));return w}function ut(H,Z,w,q,Wt="ssl"){const il=w==="blue",xt=il?At+280:Mt-280;return{id:H,name:Z,team:w,isBot:q,botDifficulty:Wt,x:xt,y:k-ks/2,vx:0,vy:0,angle:il?0:Math.PI,facing:il?1:-1,airRollInverted:!1,angularVel:0,width:zv,height:ks,isGrounded:!0,surfaceNormal:{x:0,y:-1},surfaceType:"floor",boost:33,isBoosting:!1,isSupersonic:!1,supersonicTimer:0,canJump:!0,jumpCount:0,jumpHoldTimer:0,flipWindowTimer:0,isFlipping:!1,flipDirection:{x:0,y:0},flipTimer:0,isDemoed:!1,demoRespawnTimer:0,score:0,goals:0,saves:0,shots:0,demos:0,input:{steerLeft:!1,steerRight:!1,throttleForward:!1,throttleReverse:!1,pitchUp:!1,pitchDown:!1,jump:!1,boost:!1,handbrake:!1}}}const be=st.useCallback(()=>{
    ht.current=$(),Yt.current=[],Xt.current=0,ot(null);
    // Respawn ALL boosts on goal scored / kickoff!
    if(ne.current){
      ne.current.forEach((p:any)=>{p.active=!0;p.cooldownTimer=0;});
    }
    const spawnType=Math.random()<0.5?0:1;
    Gt.current.forEach((H,Z)=>{
      H.vx=0,H.vy=0,H.angularVel=0,H.isSupersonic=!1,H.isFlipping=!1,H.jumpCount=0,H.boost=Lt?100:33,H.isDemoed=!1;
      H.isGrounded=!0,H.surfaceType="floor",H.surfaceNormal={x:0,y:-1},H.airRollInverted=!1;
      const w=H.team==="blue";
      const dist=spawnType===0?(Z>=2?150:260):(Z>=2?260:500);
      H.x=w?At+dist:Mt-dist,H.y=k-ks/2;
      H.angle=w?0:Math.PI;
      H.facing=w?1:-1;
    });
    f.mode!=="training"?(A("kickoff"),re.current=3.2,at(3),Me.playCountdown(!1)):(A("playing"),at(null));
  },[Lt,f.mode]),ie=st.useCallback(()=>{Gt.current=bt(f.mode,f.botDifficulty),ne.current=Yh(),z(0),D(0),tt(f.matchDuration),U(!1),replayHistoryRef.current=[],goalReplayRef.current=null,setGoalReplayUI(null),setDvr({active:!1,offsetSec:0,isPlaying:!1,speed:1}),be()},[f.mode,f.botDifficulty,f.matchDuration,be]);
const getAvailableDvrSeconds=st.useCallback(()=>{const hist=replayHistoryRef.current;if(hist.length<2)return 0;return Math.max(0,(hist[hist.length-1].time-hist[0].time)/1000);},[]),skipGoalReplay=st.useCallback(()=>{goalReplayRef.current=null,setGoalReplayUI(null),I?A("ended"):(X<=0&&f.matchDuration<9e3?(C===N?(U(!0),tt(0),be()):A("ended")):be())},[I,X,f.matchDuration,be,C,N]),handleGoalReplayTogglePause=st.useCallback(()=>{if(!goalReplayRef.current)return;goalReplayRef.current.isPaused=!goalReplayRef.current.isPaused,setGoalReplayUI((prev:any)=>prev?{...prev,isPaused:goalReplayRef.current.isPaused}:null)},[]),handleGoalReplayScrub=st.useCallback((prog:number)=>{if(!goalReplayRef.current)return;const targetSec=Math.max(0,Math.min(goalReplayRef.current.durationSec,prog*goalReplayRef.current.durationSec));goalReplayRef.current.currentSec=targetSec,setGoalReplayUI((prev:any)=>prev?{...prev,progress:prog,currentSec:targetSec.toFixed(1)}:null)},[]),handleGoalReplayStep=st.useCallback((deltaSec:number)=>{if(!goalReplayRef.current)return;const nextSec=Math.max(0,Math.min(goalReplayRef.current.durationSec,goalReplayRef.current.currentSec+deltaSec));goalReplayRef.current.currentSec=nextSec,goalReplayRef.current.isPaused=!0,setGoalReplayUI((prev:any)=>prev?{...prev,isPaused:!0,currentSec:nextSec.toFixed(1),progress:goalReplayRef.current.durationSec>0?nextSec/goalReplayRef.current.durationSec:0}:null)},[]),handleGoalReplayRestart=st.useCallback(()=>{if(!goalReplayRef.current)return;goalReplayRef.current.currentSec=0,setGoalReplayUI((prev:any)=>prev?{...prev,progress:0,currentSec:"0.0"}:null)},[]),handleGoalReplaySpeed=st.useCallback((sp:number)=>{if(!goalReplayRef.current)return;goalReplayRef.current.speed=sp,setGoalReplayUI((prev:any)=>prev?{...prev,speed:sp}:null)},[]),handleDvrScrub=st.useCallback((offsetSec:number)=>{const maxSec=Math.min(12,Math.max(1,getAvailableDvrSeconds())),clamped=Math.max(0,Math.min(maxSec,offsetSec));setDvr(prev=>({...prev,active:clamped>0.05,offsetSec:clamped,isPlaying:!1}))},[getAvailableDvrSeconds]),handleDvrJump=st.useCallback((secondsAgo:number)=>{const maxSec=Math.min(12,Math.max(1,getAvailableDvrSeconds())),target=Math.min(maxSec,secondsAgo);setDvr(prev=>({...prev,active:!0,offsetSec:target,isPlaying:!0}))},[getAvailableDvrSeconds]),handleDvrStep=st.useCallback((deltaSec:number)=>{const maxSec=Math.min(12,Math.max(1,getAvailableDvrSeconds()));setDvr(prev=>{const nextOffset=Math.max(0,Math.min(maxSec,prev.offsetSec+deltaSec));return{...prev,active:nextOffset>0.05,offsetSec:nextOffset,isPlaying:!1}})},[getAvailableDvrSeconds]),handleDvrTogglePlay=st.useCallback(()=>{setDvr(prev=>{if(!prev.active||prev.offsetSec<=0.05){const maxSec=Math.min(12,Math.max(1,getAvailableDvrSeconds()));return{...prev,active:!0,offsetSec:Math.min(5,maxSec),isPlaying:!0}}return{...prev,isPlaying:!prev.isPlaying}})},[getAvailableDvrSeconds]),handleDvrGoLive=st.useCallback(()=>{setDvr({active:!1,offsetSec:0,isPlaying:!1,speed:1}),m&&g(!1)},[m]),handleDvrSpeedChange=st.useCallback((speed:number)=>{setDvr(prev=>({...prev,speed}))},[]);st.useEffect(()=>{ie()},[ie]),st.useEffect(()=>{Me.setMuted(!f.soundEnabled),Me.setVolume(f.soundVolume)},[f.soundEnabled,f.soundVolume]);const Se=st.useRef({});st.useEffect(()=>{const H=xt=>{if(xt.target.tagName==="INPUT")return;const et=xt.code.toLowerCase(),Et=xt.key.toLowerCase();if(et==="keyf"||Et==="f"||Et==="а"){if(p!=="goal_replay"&&!m){xt.preventDefault(),toggleFullscreen();return}}(["space","arrowup","arrowdown","arrowleft","arrowright"].includes(et)||[" ","arrowup","arrowdown","arrowleft","arrowright"].includes(Et))&&xt.preventDefault(),Se.current[et]=!0,Se.current[Et]=!0;if((p==="goal_replay"||goalReplayRef.current)){if(et==="space"||Et===" "||Et==="escape"){xt.preventDefault(),skipGoalReplay();return}if(xt.key==="ArrowLeft"||xt.key==="["){xt.preventDefault(),handleGoalReplayStep(-0.5);return}if(xt.key==="ArrowRight"||xt.key==="]"){xt.preventDefault(),handleGoalReplayStep(0.5);return}if(et==="keyp"||Et==="p"||Et==="з"){xt.preventDefault(),handleGoalReplayTogglePause();return}if(et==="keyr"||Et==="r"||Et==="к"){xt.preventDefault(),handleGoalReplayRestart();return}}if(f.mode==="bot_vs_bot"||m||dvrRef.current.active){if(xt.key==="ArrowLeft"||xt.key==="["){xt.preventDefault(),handleDvrStep(0.5);return}if(xt.key==="ArrowRight"||xt.key==="]"){xt.preventDefault(),handleDvrStep(-0.5);return}if(et==="keyl"||Et==="l"||Et==="д"){handleDvrGoLive();return}if((et==="space"||Et===" ")&&(f.mode==="bot_vs_bot"||dvrRef.current.active)){xt.preventDefault(),handleDvrTogglePlay();return}}if(et==="keyp"||Et==="p"||Et==="з"){g(rt=>!rt);return;}if(f.mode==="training"){const c=xt.code,k=xt.key;if(c==="KeyR"||k==="r"||k==="R"||k==="к"||k==="К"){xt.preventDefault();R();return;}if(c==="Digit1"||c==="Numpad1"||k==="1"||k==="!"){xt.preventDefault();R();return;}if(c==="Digit2"||c==="Numpad2"||k==="2"||k==="@"){xt.preventDefault();V();return;}if(c==="Digit3"||c==="Numpad3"||k==="3"||k==="#"){xt.preventDefault();Q();return;}if(c==="Digit4"||c==="Numpad4"||k==="4"||k==="$"){xt.preventDefault();vt();return;}if(c==="Digit5"||c==="Numpad5"||k==="5"||k==="%"){xt.preventDefault();onMustySetup();return;}if(c==="Digit6"||c==="Numpad6"||k==="6"||k==="^"){xt.preventDefault();onFlipResetSetup();return;}if(c==="Digit7"||c==="Numpad7"||k==="7"||k==="&"){xt.preventDefault();onPinchSetup();return;}if(c==="Digit8"||c==="Numpad8"||k==="8"||k==="*"){xt.preventDefault();onDoubleTapSetup();return;}if(c==="Digit9"||c==="Numpad9"||k==="9"||k==="("){xt.preventDefault();onPsychoSetup();return;}}else if(et==="keyr"||Et==="r"||Et==="к"){ie();return;}},Z=xt=>{const et=xt.code.toLowerCase(),Et=xt.key.toLowerCase();Se.current[et]=!1,Se.current[Et]=!1},w=xt=>{xt.button===0&&(Se.current.mouse0=!0),xt.button===2&&(Se.current.mouse2=!0)},q=xt=>{xt.button===0&&(Se.current.mouse0=!1),xt.button===2&&(Se.current.mouse2=!1)},onCm=xt=>{xt.preventDefault()},Wt=()=>{Se.current={}};window.addEventListener("keydown",H),window.addEventListener("keyup",Z),window.addEventListener("mousedown",w),window.addEventListener("mouseup",q),window.addEventListener("contextmenu",onCm),window.addEventListener("blur",Wt);const il=setInterval(()=>{const xt=Gt.current.find(wn=>!wn.isBot);if(!xt)return;const et=Se.current,
  Et=!!(et.keyw||et.w||et.ц||et.arrowup),
  rt=!!(et.keys||et.s||et.ы||et.arrowdown),
  de=!!(et.keya||et.a||et.ф||et.arrowleft),
  nt=!!(et.keyd||et.d||et.в||et.arrowright),
  isQ=!!(et.keyq||et.q||et.й),
  isE=!!(et.keye||et.e||et.у),
  Rt=f.jumpKey==="rmb"?!!(et.mouse2||et.space||et[" "]):!!(et.space||et[" "]),
  We=!!(et.shiftleft||et.shiftright||et.shift||et.keyj||et.j||et.о||et.mouse0),
  Ge=!!(et.keyk||et.k||et.л||rt),
  Be=de,
  Cn=nt,
  Ga=Et||nt,
  Rn=rt||de,
  Du=Et||de,
  ml=rt||nt,
  Dn=Rt;
xt.input={steerLeft:Be,steerRight:Cn,throttleForward:Ga,throttleReverse:Rn,pitchUp:Du,pitchDown:ml,airRollLeft:isQ,airRollRight:isE,jump:Dn,boost:We,handbrake:Ge},Lt&&(xt.boost=100)},1e3/60);return()=>{window.removeEventListener("keydown",H),window.removeEventListener("keyup",Z),window.removeEventListener("mousedown",w),window.removeEventListener("mouseup",q),window.removeEventListener("contextmenu",onCm),window.removeEventListener("blur",Wt),clearInterval(il)}},[f.mode,ie,Lt,toggleFullscreen,p,m,f.jumpKey]),st.useEffect(()=>{let H;const Z=w=>{var il;const q=(w-Te.current)/1e3;Te.current=w;const Wt=(il=u.current)==null?void 0:il.getContext("2d");if(dvrRef.current.active&&dvrRef.current.offsetSec>0.05){if(dvrRef.current.isPlaying&&q>0){const nextSec=Math.max(0,dvrRef.current.offsetSec-q*dvrRef.current.speed);dvrRef.current.offsetSec=nextSec,nextSec<=0.05&&(dvrRef.current.isPlaying=!1,dvrRef.current.offsetSec=0,dvrRef.current.active=!1),setDvr({...dvrRef.current})}const hist=replayHistoryRef.current;if(hist.length>0&&Wt){const lastTime=hist[hist.length-1].time,targetTime=lastTime-dvrRef.current.offsetSec*1000,snap=getSnapshotAtTime(hist,targetTime);snap&&kv(Wt,snap.cars,snap.ball,ne.current,[],{showTrajectory:!1,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false})}H=requestAnimationFrame(Z);return}if(p==="goal_replay"&&goalReplayRef.current){const gr=goalReplayRef.current;if(!gr.isPaused&&q>0){gr.currentSec+=q*(gr.speed||1)}if(gr.currentSec>=gr.durationSec){goalReplayRef.current=null,setGoalReplayUI(null),I?A("ended"):(X<=0&&f.matchDuration<9e3?(C===N?(U(!0),tt(0),be()):A("ended")):be())}else{const targetTime=gr.startTime+gr.currentSec*1000,snap=getSnapshotAtTime(gr.frames,targetTime);snap&&Wt&&kv(Wt,snap.cars,snap.ball,ne.current,[],{showTrajectory:!1,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false});const nowTs=performance.now();if(!gr._lastUiUpdate||nowTs-gr._lastUiUpdate>35){gr._lastUiUpdate=nowTs,setGoalReplayUI((prev:any)=>prev?{...prev,isPaused:!!gr.isPaused,speed:gr.speed||1,currentSec:gr.currentSec.toFixed(1),progress:gr.durationSec>0?gr.currentSec/gr.durationSec:0}:null)}}H=requestAnimationFrame(Z);return}if(!m&&q>0){if(p==="kickoff"){re.current-=q;const nt=Math.ceil(re.current);nt>0&&nt<=3?Tt!==nt&&(at(nt),Me.playCountdown(!1)):re.current<=0&&(at(0),Me.playCountdown(!0),A("playing"),setTimeout(()=>at(null),800))}const xt=Gt.current,et=ht.current;p==="playing"&&f.mode!=="training"&&f.matchDuration<9e3&&(I?tt(nt=>nt+q):X>0?tt(nt=>Math.max(0,nt-q)):et.y+et.radius>=k-3&&(C===N?(U(!0),tt(0),be()):A("ended")));for(const nt of xt)if(nt.isBot&&p==="playing"){const Rt=xt.filter(Be=>Be.team!==nt.team),We=xt.filter(Be=>Be.team===nt.team&&Be.id!==nt.id),Ge=Yv(nt,et,Rt,We,nt.botDifficulty||f.botDifficulty,q,ne.current);Ge.chatMessage&&x(Ge.chatMessage,nt.name,nt.team)}(p==="playing"||p==="goal_scored")&&(replayHistoryRef.current.push({time:performance.now(),ball:{x:et.x,y:et.y,vx:et.vx,vy:et.vy,radius:et.radius,spin:et.spin,touchEffectTimer:et.touchEffectTimer,trail:et.trail?[...et.trail]:[],lastTouchTeam:et.lastTouchTeam,lastTouchPlayer:et.lastTouchPlayer},cars:xt.map(c=>({id:c.id,name:c.name,team:c.team,isBot:c.isBot,botDifficulty:c.botDifficulty,x:c.x,y:c.y,vx:c.vx,vy:c.vy,angle:c.angle,airRollInverted:!!c.airRollInverted,facing:c.facing||1,width:c.width,height:c.height,isGrounded:c.isGrounded,boost:c.boost,isBoosting:c.isBoosting,isSupersonic:c.isSupersonic,isFlipping:c.isFlipping,hasFlipReset:c.hasFlipReset,isDemoed:c.isDemoed,demoRespawnTimer:c.demoRespawnTimer,score:c.score,goals:c.goals}))}));const _nowTs=performance.now();while(replayHistoryRef.current.length>50&&replayHistoryRef.current[0].time<_nowTs-16000){replayHistoryRef.current.shift()}if(p==="goal_scored"){Xt.current-=q;if(Xt.current<=0){const hist=replayHistoryRef.current;if(hist.length>=10){const lastTime=hist[hist.length-1].time,targetDurationMs=7000,startTime=lastTime-targetDurationMs;let slice=hist.filter((item:any)=>item.time>=startTime);if(slice.length<5)slice=hist.slice(-300);const actualStart=slice[0].time,actualEnd=slice[slice.length-1].time,durationSec=Math.max(1,(actualEnd-actualStart)/1000);goalReplayRef.current={frames:slice,startTime:actualStart,endTime:actualEnd,durationSec,currentSec:0,speed:1,isPaused:!1,info:lastGoalInfoRef.current,_lastUiUpdate:0},setGoalReplayUI({active:!0,progress:0,speed:1,isPaused:!1,info:lastGoalInfoRef.current,currentSec:"0.0",totalSec:durationSec.toFixed(1)}),ot(null),A("goal_replay")}else{I?A("ended"):(X<=0&&f.matchDuration<9e3?(C===N?(U(!0),tt(0),be()):A("ended")):be())}}}const Et=p==="playing"||p==="goal_scored",rt=jv(xt,et,ne.current,q,!Et&&p!=="goal_scored",f.physicsMode);rt.mechanicEvents&&rt.mechanicEvents.length>0&&(()=>{for(const ev of rt.mechanicEvents){setMechAlerts(prev=>[...prev.slice(-2),ev]);setTimeout(()=>{setMechAlerts(prev=>prev.filter(it=>it.id!==ev.id))},2800)}})();rt.newParticles.length>0&&Yt.current.push(...rt.newParticles);for(let nt=Yt.current.length-1;nt>=0;nt--){const Rt=Yt.current[nt];Rt.x+=Rt.vx*q,Rt.y+=Rt.vy*q,Rt.life-=q,Rt.life<=0&&Yt.current.splice(nt,1)}for(const nt of rt.demoEvents){
  if(nt.killer&&nt.killer.isBot){
    const Rt=["💥 BOOM!","Calculated.","Demolition!","EZ","Nice car!","Savage!"];
    const We=Rt[Math.floor(Math.random()*Rt.length)];
    x(We,nt.killer.name,nt.killer.team);
  }
}
if(rt.goalScored&&p==="playing"){
  const nt=rt.goalScored;
  A("goal_scored");
  Xt.current=1.2;
  lastGoalInfoRef.current=nt;
  nt.scoringTeam==="blue"?z(Ge=>Ge+1):D(Ge=>Ge+1);
  ot({scoringTeam:nt.scoringTeam,scorerName:nt.scorerName,speedKmh:nt.speedKmh});
  const lastTouchCar=Gt.current.find(c=>c.name===nt.scorerName);
  if(lastTouchCar&&lastTouchCar.isBot){
    let senderName=nt.scorerName;
    let senderTeam=lastTouchCar.team;
    if(lastTouchCar.team!==nt.scoringTeam){
      const ownGoalChats=["Close one!","OMG!","No problem.","Savage!"];
      x(ownGoalChats[Math.floor(Math.random()*ownGoalChats.length)],senderName,senderTeam);
    }else{
      const Rt=["EZ!","Calculated.","What a save!","Too easy!","Savage!"];
      const We=Rt[Math.floor(Math.random()*Rt.length)];
      x(We,senderName,senderTeam);
    }
  }
}const de=xt.find(nt=>!nt.isBot)||xt[0];W(de?{...de}:null)}Wt&&kv(Wt,Gt.current,ht.current,ne.current,Yt.current,{showTrajectory:f.showTrajectory,arenaTheme:f.arenaTheme,showMechanicAlerts:f.showMechanicAlerts!==false}),H=requestAnimationFrame(Z)};return H=requestAnimationFrame(Z),()=>cancelAnimationFrame(H)},[m,p,Tt,I,X,f,C,N,be]);const x=(H:string,Z:string="Player",w:string="blue")=>{const foundCar=Gt.current?.find(c=>c.name===Z);const actualTeam=foundCar?foundCar.team:w;const q={id:Math.random().toString(),sender:Z,team:actualTeam,text:H,timestamp:Date.now()};dt(Wt=>[...Wt.slice(-6),q])},R=()=>{ht.current.x=Kt/2,ht.current.y=k-Cu,ht.current.vx=0,ht.current.vy=0},
V=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=H.x;
  ht.current.y=isLegacy?(H.y-H.height/2-Cu-4):(H.y-H.height/2-Cu);
  ht.current.vx=H.vx;
  ht.current.vy=0;
},
Q=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=H.x+(H.team==="blue"?(isLegacy?400:350):-(isLegacy?400:350));
  ht.current.y=k-Cu;
  ht.current.vx=(H.x-ht.current.x)*(isLegacy?1.5:1.1);
  ht.current.vy=isLegacy?-650:-450;
},
vt=()=>{
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=Kt/2;
  ht.current.y=200;
  ht.current.vx=isLegacy?150:100;
  ht.current.vy=isLegacy?-300:-200;
};
const onMustySetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue";
  H.x=Kt/2;
  H.y=650;
  H.vx=isB?(isLegacy?240:200):-(isLegacy?240:200);
  H.vy=isLegacy?-60:-45;
  H.angle=isB?.3:Math.PI-.3;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
  ht.current.x=H.x-(isB?18:-18);
  ht.current.y=H.y-42;
  ht.current.vx=H.vx;
  ht.current.vy=H.vy;
},
onFlipResetSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue";
  ht.current.x=Kt/2;
  ht.current.y=480;
  ht.current.vx=isLegacy?40:30;
  ht.current.vy=isLegacy?-40:-30;
  H.x=Kt/2-(isB?(isLegacy?120:100):-(isLegacy?120:100));
  H.y=740;
  H.vx=(ht.current.x-H.x)*(isLegacy?1.2:1.1);
  H.vy=isLegacy?-260:-220;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
},
onPinchSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  ht.current.x=Mt-Cu-8;
  ht.current.y=600;
  ht.current.vx=0;
  ht.current.vy=isLegacy?-340:-240;
  H.x=Mt-(isLegacy?300:240);
  H.y=k-H.height/2;
  H.vx=isLegacy?950:680;
  H.vy=0;
  H.angle=0;
  H.facing=1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!0;
},
onDoubleTapSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue",tgtX=isB?Mt:At;
  ht.current.x=tgtX-(isB?(isLegacy?360:340):-(isLegacy?360:340));
  ht.current.y=520;
  ht.current.vx=isB?(isLegacy?820:620):-(isLegacy?820:620);
  ht.current.vy=isLegacy?-360:-280;
  H.x=tgtX-(isB?(isLegacy?540:480):-(isLegacy?540:480));
  H.y=680;
  H.vx=isB?(isLegacy?520:420):-(isLegacy?520:420);
  H.vy=isLegacy?-280:-220;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
},
onPsychoSetup=()=>{
  const H=Gt.current.find(Z=>!Z.isBot);
  if(!H)return;
  const isLegacy=(f.physicsMode||activePhysicsMode)==="legacy";
  const isB=H.team==="blue",ownX=isB?At:Mt;
  ht.current.x=ownX+(isB?(isLegacy?35:45):-(isLegacy?35:45));
  ht.current.y=isLegacy?480:360;
  ht.current.vx=isB?(isLegacy?680:640):-(isLegacy?680:640);
  ht.current.vy=isLegacy?-200:-120;
  (ht.current as any).psychoCandidate={time:Date.now(),player:H.name,team:H.team,wall:isB?"blue":"orange",sourceWall:isB?"blue":"orange"};
  H.x=ownX+(isB?(isLegacy?220:240):-(isLegacy?220:240));
  H.y=620;
  H.vx=isB?(isLegacy?200:280):-(isLegacy?200:280);
  H.vy=isLegacy?-180:-180;
  H.facing=isB?1:-1;
  H.airRollInverted=!1;
  H.boost=100;
  H.isGrounded=!1;
};return d.jsx("main",{ref:containerRef,className:"relative w-screen h-screen bg-slate-950 overflow-hidden flex items-center justify-center font-sans select-none",children:d.jsxs("div",{className:"relative w-full h-full overflow-hidden",children:[d.jsx("canvas",{ref:u,className:"absolute inset-0 w-full h-full block"}),d.jsx(a2,{blueScore:C,orangeScore:N,timeLeft:X,isOvertime:I,matchState:p,gameMode:f.mode,botDifficulty:f.botDifficulty,physicsMode:f.physicsMode,isPaused:m,onTogglePause:()=>g(H=>!H),onOpenSettings:()=>y(!0),onResetMatch:ie,isFullscreen:isFullscreen,onToggleFullscreen:toggleFullscreen,onOpenControls:()=>setIsControlsOpen(!0)}),d.jsx(u2,{messages:J,onSendMessage:H=>x(H,"Player","blue")}),d.jsx(s2,{jumpKey:f.jumpKey,isOpen:isControlsOpen,onClose:()=>setIsControlsOpen(!1)}),d.jsxs("div",{className:"absolute bottom-3 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] font-medium text-slate-300 backdrop-blur-sm shadow-md",children:[d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-sky-300 font-bold text-[10px]",children:"W A S D"}),d.jsx("span",{children:"Drive"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300 font-bold text-[10px]",children:"Q / E"}),d.jsx("span",{children:"Air Roll (180° Flip)"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-sky-300 font-bold text-[10px]",children:f.jumpKey==="rmb"?"RMB / Space":"Space"}),d.jsx("span",{children:"Jump"})]}),d.jsx("span",{className:"text-slate-600",children:"•"}),d.jsxs("div",{className:"flex items-center gap-1",children:[d.jsx("kbd",{className:"px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300 font-bold text-[10px]",children:"Shift / LMB"}),d.jsx("span",{children:"Boost"})]})]}),d.jsx(n2,{playerCar:B}),f.mode==="training"&&d.jsx(c2,{onResetBall:R,onDribbleSetup:V,onPassToMe:Q,onHighAerialSetup:vt,onMustySetup:onMustySetup,onFlipResetSetup:onFlipResetSetup,onPinchSetup:onPinchSetup,onDoubleTapSetup:onDoubleTapSetup,onPsychoSetup:onPsychoSetup,infiniteBoost:Lt,onToggleInfiniteBoost:()=>Ft(H=>!H)}),d.jsx(v2,{alerts:mechAlerts}),d.jsx(i2,{playerCar:Gt.current.find(H=>!H.isBot)||null}),d.jsx(o2,{goalInfo:Ht,kickoffCountdown:Tt}),d.jsx(GoalReplayOverlay,{replayUI:goalReplayUI,onSkip:skipGoalReplay,onSpeedToggle:handleGoalReplaySpeed,onTogglePause:handleGoalReplayTogglePause,onScrub:handleGoalReplayScrub,onStep:handleGoalReplayStep,onRestart:handleGoalReplayRestart}),(f.mode==="bot_vs_bot"||dvr.active)&&!goalReplayUI?.active&&d.jsx(SpectatorDvrBar,{isBotVsBot:f.mode==="bot_vs_bot",dvrState:dvr,onTogglePlay:handleDvrTogglePlay,onScrub:handleDvrScrub,onStep:handleDvrStep,onJump:handleDvrJump,onGoLive:handleDvrGoLive,onSpeedChange:handleDvrSpeedChange,availableSeconds:getAvailableDvrSeconds()}),m&&d.jsx("div",{className:`absolute inset-0 z-35 flex flex-col items-center justify-center ${dvr.active?"bg-black/35 pointer-events-none":"bg-black/70 backdrop-blur-sm"}`,children:d.jsxs("div",{className:`bg-slate-900/95 border border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 text-center pointer-events-auto ${dvr.active?"opacity-95 scale-95 transition":null}`,children:[d.jsx("h3",{className:"text-2xl md:text-3xl font-black text-white uppercase tracking-wider",children:"MATCH PAUSED"}),d.jsxs("p",{className:"text-xs md:text-sm text-slate-300",children:["Press ",d.jsx("kbd",{className:"px-2 py-0.5 bg-slate-800 rounded border border-slate-600 font-mono text-white",children:"P"})," to resume match or review the last 10 seconds replay"]}),d.jsxs("div",{className:"flex gap-2.5 mt-2 flex-wrap justify-center",children:[d.jsx("button",{onClick:()=>{g(!1),setDvr({active:!1,offsetSec:0,isPlaying:!1,speed:1})},className:"px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition shadow-lg cursor-pointer",children:"Resume Match"}),d.jsxs("button",{onClick:()=>{const maxSec=Math.min(12,Math.max(1,getAvailableDvrSeconds()));setDvr({active:!0,offsetSec:maxSec,isPlaying:!0,speed:1})},className:"px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-sm rounded-xl transition border border-amber-500/50 flex items-center gap-1.5 cursor-pointer shadow-md",children:[d.jsx(Rewind,{className:"w-4 h-4"}),d.jsx("span",{children:"Replay Last 10s (DVR)"})]}),d.jsx("button",{onClick:ie,className:"px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition border border-slate-700 cursor-pointer",children:"Restart Match"})]})]})}),p==="ended"&&d.jsx("div",{className:"absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4",children:d.jsxs("div",{className:"bg-slate-950 border-2 border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-fade-in text-slate-100",children:[d.jsx(Is,{className:"w-16 h-16 text-amber-400 mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]"}),d.jsx("h2",{className:"text-3xl font-black uppercase tracking-tight text-white mb-1",children:C>N?"BLUE WINS!":N>C?"ORANGE WINS!":"OVERTIME DRAW!"}),d.jsxs("div",{className:"my-5 flex items-center justify-center gap-6 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800",children:[d.jsxs("div",{className:"flex flex-col items-center",children:[d.jsx("span",{className:"text-xs font-bold text-sky-400 uppercase",children:"Blue Team"}),d.jsx("span",{className:"text-4xl font-mono font-black text-white",children:C})]}),d.jsx("span",{className:"text-2xl font-bold text-slate-500",children:":"}),d.jsxs("div",{className:"flex flex-col items-center",children:[d.jsx("span",{className:"text-xs font-bold text-orange-400 uppercase",children:"Orange Team"}),d.jsx("span",{className:"text-4xl font-mono font-black text-white",children:N})]})]}),d.jsxs("div",{className:"flex gap-3 w-full mt-2",children:[d.jsxs("button",{onClick:ie,className:"flex-1 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 text-white font-black text-sm uppercase rounded-xl shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2",children:[d.jsx(im,{className:"w-4 h-4"}),d.jsx("span",{children:"Play Again"})]}),d.jsx("button",{onClick:()=>y(!0),className:"px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition",title:"Settings",children:d.jsx(cm,{className:"w-5 h-5"})})]})]})}),d.jsx(f2,{isOpen:s,settings:f,onUpdateSettings:handleUpdateSettings,onClose:()=>y(!1),onApplyAndRestart:()=>{y(!1),ie()}})]})})}

export default function App() {
  return d.jsx(r2, {});
}
