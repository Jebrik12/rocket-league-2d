import { executeMasterBotBrain, checkDefensiveThreat, ArenaEnv } from "../src/bot/botBrain";

const LEGACY_PHYSICS = {
  pv: 1050, Ph: 850, Dh: .998, wh: .985, Uh: .995,
  xv: 650, Tv: 840, bv: 1250, Hh: 1500, ju: 1000,
  Sv: 1600, Nv: 2600, Mv: 33.3, cc: 520, Gh: 400,
  Ev: .2, Bh: 600, qh: .45, _v: 1.35, Av: 6.2,
  reverseDriveSpeed: 1400, wavedashMinSpeed: 1280
};

const RL_PHYSICS = {
  pv: 720, Ph: 720, Dh: .998, wh: .985, Uh: .995,
  xv: 460, Tv: 725, bv: 750, Hh: 1450, ju: 1000,
  Sv: 1100, Nv: 1350, Mv: 33.3, cc: 400, Gh: 320,
  Ev: .2, Bh: 440, qh: .45, _v: 1.35, Av: 6.0,
  reverseDriveSpeed: 1400, wavedashMinSpeed: 1280
};

function createEnv(mode: "rocket_league" | "legacy"): ArenaEnv {
  const p = mode === "legacy" ? LEGACY_PHYSICS : RL_PHYSICS;
  return {
    Kt: 2000, hl: 1000, k: 780, Qt: 120, At: 120, Mt: 1880, F: 140, zn: 65, POST_INSET: 25,
    le: { x: 120, yMin: 380, yMax: 680 },
    ae: { x: 1880, yMin: 380, yMax: 680 },
    goalType: "wall",
    isLegacy: mode === "legacy",
    pv: p.pv, Ph: p.Ph, Uh: p.Uh, Hh: p.Hh, Av: p.Av, Bh: p.Bh,
    cc: p.cc, Gh: p.Gh, Ev: p.Ev, qh: p.qh, wavedashMinSpeed: p.wavedashMinSpeed
  };
}

function createCar(id: string, team: "blue" | "orange", x: number, y: number, angle: number = 0) {
  return {
    id, name: "Bot_" + id, team, isBot: true,
    x, y, vx: 0, vy: 0, angle,
    facing: team === "blue" ? 1 : -1,
    width: 48, height: 28,
    isGrounded: true, canJump: true, jumpCount: 0,
    flipWindowTimer: 0, flipTimer: 0, isFlipping: false,
    hasFlipReset: false, jumpHoldTimer: 0,
    surfaceNormal: { x: 0, y: -1 },
    surfaceType: "floor",
    boost: 100, isBoosting: false, isSupersonic: false, supersonicTimer: 0,
    input: {
      steerLeft: false, steerRight: false,
      throttleForward: false, throttleReverse: false,
      pitchUp: false, pitchDown: false,
      airRollLeft: false, airRollRight: false,
      jump: false, boost: false, handbrake: false
    },
    botState: {
      action: "idle", dribbleTime: 0, airDribbleTouches: 0,
      targetPos: { x: 0, y: 0 }, interceptTime: 0,
      mustyStage: "idle", mustyTimer: 0,
      jumpSeq: { stage: "idle", timer: 0, type: "dodge", dodgeX: 0, dodgeY: 0 }
    }
  };
}

function createBall(x: number, y: number, vx: number = 0, vy: number = 0) {
  return { x, y, vx, vy, radius: 30, spin: 0 };
}

function stepSim(car: any, ball: any, env: ArenaEnv, dt: number) {
  const p = env.isLegacy ? LEGACY_PHYSICS : RL_PHYSICS;
  const f = dt;

  if (car.isGrounded) {
    let driveDir = 0;
    if (car.input.steerRight && !car.input.steerLeft) driveDir = 1;
    else if (car.input.steerLeft && !car.input.steerRight) driveDir = -1;
    else if (car.input.throttleForward) driveDir = car.facing;
    else if (car.input.throttleReverse) driveDir = -car.facing;

    if (driveDir !== 0) {
      car.vx += driveDir * p.ju * f;
      if (car.input.steerRight || car.input.steerLeft) {
        car.angle = driveDir > 0 ? 0 : Math.PI;
        car.facing = driveDir;
      }
    } else {
      car.vx *= Math.pow(p.wh, f * 60);
    }

    if (car.input.jump && car.canJump) {
      car.canJump = false;
      car.isGrounded = false;
      car.jumpCount = 1;
      car.jumpHoldTimer = 0;
      car.vy = -p.cc;
      car.surfaceType = "air";
    }
  } else {
    car.vy += p.pv * f;
    car.vx *= Math.pow(p.Dh, f * 60);
    car.vy *= Math.pow(p.Dh, f * 60);

    let steerVal = 0;
    if (car.input.steerLeft || car.input.pitchUp) steerVal -= 1;
    if (car.input.steerRight || car.input.pitchDown) steerVal += 1;
    if (!car.isFlipping) {
      car.angle += steerVal * p.Av * f;
      car.facing = Math.cos(car.angle) >= 0 ? 1 : -1;
    }

    if (car.input.jump && car.jumpCount === 1 && car.jumpHoldTimer < p.Ev) {
      car.jumpHoldTimer += f;
      car.vy += -p.Gh * f;
    }

    if (car.input.jump && car.canJump && car.jumpCount === 1) {
      car.canJump = false;
      car.jumpCount = 2;
      let ax = 0, ay = 0;
      if (car.input.steerRight || car.input.throttleForward) ax += 1;
      if (car.input.steerLeft || car.input.throttleReverse) ax -= 1;
      if (car.input.pitchUp) ay -= 1;
      if (car.input.pitchDown) ay += 1;
      if (ax !== 0 || ay !== 0) {
        const len = Math.hypot(ax, ay) || 1;
        car.vx += (ax / len) * p.Bh;
        car.vy = (ay / len) * p.Bh * 0.7;
        car.isFlipping = true;
        car.flipTimer = 0;
      } else {
        car.vy = Math.min(car.vy - p.cc * 1.05, -p.cc * 1.15);
      }
    }
    if (!car.input.jump) {
      car.canJump = true;
    }
  }

  if (car.input.boost && car.boost > 0) {
    car.boost = Math.max(0, car.boost - p.Mv * f);
    const ang = car.angle;
    const accel = car.isGrounded ? p.Sv : p.Nv;
    car.vx += Math.cos(ang) * accel * f;
    car.vy += Math.sin(ang) * accel * f;
  }

  const topSpd = car.input.boost ? p.bv : p.xv;
  const spd = Math.hypot(car.vx, car.vy);
  if (spd > topSpd) {
    const scale = topSpd / spd;
    car.vx *= scale;
    car.vy *= scale;
  }

  car.x += car.vx * f;
  car.y += car.vy * f;

  if (car.y + car.height / 2 >= env.k) {
    car.y = env.k - car.height / 2;
    car.vy = 0;
    car.isGrounded = true;
    car.canJump = true;
    car.jumpCount = 0;
    car.isFlipping = false;
  }

  ball.vy += env.Ph * f;
  const bDrag = Math.pow(env.Uh, f * 60);
  ball.vx *= bDrag;
  ball.vy *= bDrag;
  ball.x += ball.vx * f;
  ball.y += ball.vy * f;

  if (ball.y + ball.radius >= env.k) {
    ball.y = env.k - ball.radius;
    ball.vy = -ball.vy * 0.65;
    if (Math.abs(ball.vy) < 20) ball.vy = 0;
    ball.vx *= 0.96;
  }

  const dx = ball.x - car.x;
  const dy = ball.y - car.y;
  const dist = Math.hypot(dx, dy);
  if (dist < ball.radius + car.width / 2) {
    const nx = dx / (dist || 1);
    const ny = dy / (dist || 1);
    const relVx = ball.vx - car.vx;
    const relVy = ball.vy - car.vy;
    const vDotN = relVx * nx + relVy * ny;
    if (vDotN < 0) {
      ball.vx -= 1.6 * vDotN * nx;
      ball.vy -= 1.6 * vDotN * ny;
    }
  }
}

console.log("=== RUNNING BOT AI SIMULATION TESTS ===");

for (const mode of ["rocket_league", "legacy"] as const) {
  console.log("\n==========================================");
  console.log(`--- MODE: ${mode.toUpperCase()} ---`);
  console.log("==========================================");
  const env = createEnv(mode);

  // --- TEST 1: Ground Attack from Midfield ---
  console.log("\nTest 1: Ground Attack & Strike from Midfield");
  const blue = createCar("blue_1", "blue", 600, env.k - 14);
  const ball1 = createBall(1000, env.k - 30);
  let goal1 = false;
  let maxBallVx1 = 0;

  for (let frame = 0; frame < 180; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(blue, ball1, null, null, [], 1, dt, env, true, [], {});
    stepSim(blue, ball1, env, dt);

    if (ball1.vx > maxBallVx1) maxBallVx1 = ball1.vx;

    if (ball1.x > env.Mt - 30) {
      goal1 = true;
      console.log(`  [PASS] Goal Scored at frame ${frame}! Exit speed: ${Math.round(maxBallVx1)} px/s`);
      break;
    }
  }
  if (!goal1) {
    console.log(`  [FAIL] Final Ball X: ${Math.round(ball1.x)}, Blue X: ${Math.round(blue.x)}, Max Vx: ${Math.round(maxBallVx1)}`);
  }

  // --- TEST 2: Goalkeeper Aerial Clutch Save ---
  console.log("\nTest 2: Goalkeeper Aerial Clutch Save");
  const goalie = createCar("blue_goalie", "blue", 280, env.k - 14);
  const shotBall = createBall(700, 500, -600, -320);
  let saved2 = false;

  for (let frame = 0; frame < 120; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(goalie, shotBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(goalie, shotBall, env, dt);

    if (shotBall.vx > 50) {
      saved2 = true;
      console.log(`  [PASS] Shot saved at frame ${frame}! Ball deflected forward: vx = ${Math.round(shotBall.vx)} px/s`);
      break;
    }
  }
  if (!saved2) {
    console.log(`  [FAIL] Goalie did not save shot. Final Ball X: ${Math.round(shotBall.x)}, Goalie X: ${Math.round(goalie.x)}`);
  }

  // --- TEST 3: High Aerial Interception & Strike ---
  console.log("\nTest 3: High Aerial Clearance / Strike");
  const striker = createCar("blue_aerial", "blue", 500, env.k - 14);
  const aerialBall = createBall(850, 420, 100, -200);
  let aerialTouched = false;
  let maxAerialVx = 0;

  for (let frame = 0; frame < 120; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(striker, aerialBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(striker, aerialBall, env, dt);

    if (aerialBall.vx > maxAerialVx) maxAerialVx = aerialBall.vx;
    if (Math.hypot(aerialBall.x - striker.x, aerialBall.y - striker.y) < 55) {
      aerialTouched = true;
    }

    if (aerialBall.x > env.Mt - 30 || (aerialTouched && aerialBall.vx > 250)) {
      console.log(`  [PASS] High Aerial strike executed at frame ${frame}! Ball boomer vx: ${Math.round(aerialBall.vx)} px/s`);
      break;
    }
  }
  if (!aerialTouched && aerialBall.x <= env.Mt - 30) {
    console.log(`  [RESULT] Ball X: ${Math.round(aerialBall.x)}, Y: ${Math.round(aerialBall.y)}, Car X: ${Math.round(striker.x)}, Y: ${Math.round(striker.y)}, Action: ${striker.botState.action}`);
  }
}
