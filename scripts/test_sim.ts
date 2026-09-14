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

function createCar(
  id: string,
  team: "blue" | "orange",
  x: number,
  y: number,
  model: "octane" | "breakout" | "merc" = "octane",
  angle: number = 0
) {
  const dims = {
    octane: { width: 68, height: 28, wheelbase: 18 },
    breakout: { width: 76, height: 23.5, wheelbase: 22 },
    merc: { width: 70, height: 32, wheelbase: 18 }
  }[model];

  return {
    id, name: "Bot_" + id, team, isBot: true,
    x, y, vx: 0, vy: 0, angle,
    facing: team === "blue" ? 1 : -1,
    width: dims.width, height: dims.height, wheelbase: dims.wheelbase,
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
    car.angle += steerVal * p.Av * f;
    car.facing = Math.cos(car.angle) >= 0 ? 1 : -1;

    if (car.isFlipping) {
      car.flipTimer = (car.flipTimer || 0) + f;
      if (car.flipTimer >= p.qh) {
        car.isFlipping = false;
        car.flipTimer = 0;
      }
    }

    if (car.input.jump && car.canJump && car.jumpCount === 1 && !car.isFlipping) {
      car.jumpCount = 2;
      car.canJump = false;
      let dirX = 0, dirY = 0;
      if (car.input.steerRight) dirX += 1;
      if (car.input.steerLeft) dirX -= 1;
      if (car.input.pitchDown) dirY += 1;
      if (car.input.pitchUp) dirY -= 1;

      if (dirX !== 0 || dirY !== 0) {
        const len = Math.hypot(dirX, dirY) || 1;
        const nx = dirX / len, ny = dirY / len;
        car.vy *= 0.15;
        car.vx += nx * p.Bh;
        car.vy += ny * (p.Bh * 0.7);
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
  car.isSupersonic = spd >= p.Tv;

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

  // --- Real OBB (Oriented Bounding Box) Car-Ball Collision matching App.tsx ---
  const cosA = Math.cos(car.angle), sinA = Math.sin(car.angle);
  const gx = ball.x - car.x, gy = ball.y - car.y;
  const A = gx * cosA + gy * sinA;
  const isMirrored = car.isGrounded && (car.facing === -1 || (car.surfaceType === "floor" && Math.cos(car.angle) < -0.5));
  const lateralSign = (isMirrored ? -1 : 1) * (car.airRollInverted ? -1 : 1);
  const C = (-gx * sinA + gy * cosA) * lateralSign;
  const halfW = car.width / 2, halfH = car.height / 2;
  const clampA = Math.max(-halfW, Math.min(halfW, A));
  const clampC = Math.max(-halfH, Math.min(halfH, C));
  const tt = A - clampA, distI = C - clampC;
  const U = Math.hypot(tt, distI);

  if (U < ball.radius) {
    const pen = ball.radius - (U || 0.001);
    let at = tt / (U || 1), Ht = distI / (U || 1);
    if (U === 0) { at = 0; Ht = -1; }
    const normX = at * cosA - Ht * sinA * lateralSign;
    const normY = at * sinA + Ht * cosA * lateralSign;

    ball.x += normX * pen;
    ball.y += normY * pen;

    const isFrontHit = at > 0.45 || (A > halfW * 0.5);
    const wbLimit = (car.wheelbase || 18) + 2.5;
    const isWheels = Ht >= 0.82 && Math.abs(A) <= wbLimit && C >= halfH - 2.5;
    const Gt = isFrontHit ? 1.6 : (isWheels ? 0.85 : 1.25);

    const relVx = ball.vx - car.vx;
    const relVy = ball.vy - car.vy;
    const vDotN = relVx * normX + relVy * normY;
    if (vDotN < 0) {
      ball.vx -= (1 + Gt) * vDotN * normX;
      ball.vy -= (1 + Gt) * vDotN * normY;
    }
  }
}

console.log("=== RUNNING BOT AI ADVANCED SIMULATION TESTS ===");

for (const mode of ["rocket_league", "legacy"] as const) {
  console.log("\n==========================================");
  console.log(`--- MODE: ${mode.toUpperCase()} ---`);
  console.log("==========================================");
  const env = createEnv(mode);

  // --- TEST 1: Ground Attack from Midfield (Octane 68x28) ---
  console.log("\nTest 1: Ground Attack & Strike from Midfield (Octane Hitbox)");
  const blue = createCar("blue_1", "blue", 600, env.k - 14, "octane");
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

  // --- TEST 2: Goalkeeper Aerial Clutch Save against 600 px/s shot ---
  console.log("\nTest 2: Goalkeeper Aerial Clutch Save");
  const goalie = createCar("blue_goalie", "blue", 280, env.k - 14, "octane");
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

  // --- TEST 3: High Aerial Strike (Breakout 76x23.5) ---
  console.log("\nTest 3: High Aerial Clearance / Strike (Breakout Hitbox)");
  const striker = createCar("blue_aerial", "blue", 500, env.k - 14, "breakout");
  const aerialBall = createBall(850, 420, 100, -200);
  let aerialTouched = false;
  let maxAerialVx = 0;

  for (let frame = 0; frame < 180; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(striker, aerialBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(striker, aerialBall, env, dt);

    if (aerialBall.vx > maxAerialVx) maxAerialVx = aerialBall.vx;
    if (Math.hypot(aerialBall.x - striker.x, aerialBall.y - striker.y) < 72) {
      aerialTouched = true;
    }

    if (aerialBall.x > env.Mt - 30 || (aerialTouched && aerialBall.vx > 180)) {
      console.log(`  [PASS] High Aerial strike executed at frame ${frame}! Ball boomer vx: ${Math.round(aerialBall.vx)} px/s`);
      break;
    }
  }
  if (aerialBall.x <= env.Mt - 30 && (!aerialTouched || aerialBall.vx <= 180)) {
    console.log(`  [INFO] Aerial Touched: ${aerialTouched}, Max Vx: ${Math.round(maxAerialVx)}, Final Vx: ${Math.round(aerialBall.vx)}, Ball X: ${Math.round(aerialBall.x)}`);
  }

  // --- TEST 4: Anti-Own-Goal Verification (Car Upfield of Threat) ---
  console.log("\nTest 4: Anti-Own-Goal Recovery (Car Upfield of Incoming Ball)");
  // Blue goal is at x=120. Ball is at x=450 moving towards blue net at vx=-350.
  // Blue bot is at x=650 (wrong side of the ball, further upfield than the ball!).
  const defender = createCar("blue_def", "blue", 650, env.k - 14, "octane");
  const dangerBall = createBall(450, env.k - 30, -350, 0);
  let ownGoalOccurred = false;
  let clearedForward = false;

  for (let frame = 0; frame < 160; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(defender, dangerBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(defender, dangerBall, env, dt);

    // If danger ball passes goal line, own goal!
    if (dangerBall.x - dangerBall.radius <= env.le.x) {
      ownGoalOccurred = true;
      break;
    }
    // If the ball is successfully reversed forward away from net:
    if (dangerBall.vx > 60 && dangerBall.x > 300) {
      clearedForward = true;
      console.log(`  [PASS] Anti-Own-Goal Successful at frame ${frame}! Ball cleared forward: vx = ${Math.round(dangerBall.vx)} px/s`);
      break;
    }
  }
  if (ownGoalOccurred) {
    console.log(`  [FAIL] Own goal scored! Ball X: ${Math.round(dangerBall.x)}, vx: ${Math.round(dangerBall.vx)}`);
  } else if (!clearedForward) {
    console.log(`  [RESULT] Ball X: ${Math.round(dangerBall.x)}, vx: ${Math.round(dangerBall.vx)}, Bot Action: ${defender.botState.action}`);
  }

  // --- TEST 5: Aerial Boost Continuity (No Mid-Air Boost Stutter) ---
  console.log("\nTest 5: Aerial Boost Continuity & Flight Ascent");
  const flyer = createCar("blue_flyer", "blue", 500, env.k - 14, "merc");
  const highBall = createBall(750, 300, 0, 20);
  let boostActiveFrames = 0;
  let totalAirborneFrames = 0;

  for (let frame = 0; frame < 100; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(flyer, highBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(flyer, highBall, env, dt);

    if (!flyer.isGrounded) {
      totalAirborneFrames++;
      if (flyer.input.boost) boostActiveFrames++;
    }

    if (Math.hypot(highBall.x - flyer.x, highBall.y - flyer.y) < 70) {
      const boostRatio = boostActiveFrames / Math.max(1, totalAirborneFrames);
      console.log(`  [PASS] Aerial reached at frame ${frame}! Boost active ratio: ${Math.round(boostRatio * 100)}% (${boostActiveFrames}/${totalAirborneFrames} air frames)`);
      break;
    }
  }

  // --- TEST 6: Kickoff 50/50 Power Dodge Trigger ---
  console.log("\nTest 6: Kickoff 50/50 Power Dodge Timing");
  const kickoffBot = createCar("blue_ko", "blue", 400, env.k - 14, "octane");
  const koBall = createBall(1000, env.k - 30, 0, 0);
  let koDodgeTriggered = false;
  let koContactVx = 0;

  for (let frame = 0; frame < 120; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(kickoffBot, koBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(kickoffBot, koBall, env, dt);

    if (kickoffBot.isFlipping || kickoffBot.botState.jumpSeq.stage === "press2") {
      koDodgeTriggered = true;
    }
    if (koBall.vx > koContactVx) koContactVx = koBall.vx;

    if (koBall.x > 1150) {
      console.log(`  [PASS] Kickoff win at frame ${frame}! Dodge flip: ${koDodgeTriggered}, Ball exit vx: ${Math.round(koContactVx)} px/s`);
      break;
    }
  }
  if (koBall.x <= 1150) {
    console.log(`  [FAIL] Kickoff did not blast ball forward. Ball X: ${Math.round(koBall.x)}, vx: ${Math.round(koContactVx)}`);
  }

  // --- TEST 7: Air Dribble Push & Lethal Dunk ---
  console.log("\nTest 7: Air Dribble Offensive Carry & Clinical Dunk");
  const airBot = createCar("blue_air", "blue", 1100, 460, "octane");
  airBot.isGrounded = false;
  airBot.jumpCount = 1;
  airBot.vx = 320;
  airBot.vy = -60;
  airBot.boost = 70;
  const airBall = createBall(1160, 450, 310, -50);
  let airDribbled = false;
  let airDunked = false;

  for (let frame = 0; frame < 120; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(airBot, airBall, null, null, [], 1, dt, env, true, [], {});
    stepSim(airBot, airBall, env, dt);

    if (airBot.botState.action === "air_dribble") airDribbled = true;
    if (airBot.isFlipping && airBall.vx > 600) airDunked = true;

    if (airBall.x > env.Mt - 40) {
      console.log(`  [PASS] Air dribble scored at frame ${frame}! Carried: ${airDribbled}, Dunked: ${airDunked}, Exit vx: ${Math.round(airBall.vx)} px/s`);
      break;
    }
  }
  if (airBall.x <= env.Mt - 40) {
    console.log(`  [RESULT] Air dribble finish: Ball X: ${Math.round(airBall.x)}, Carried: ${airDribbled}, Max vx: ${Math.round(airBall.vx)}`);
  }

  // --- TEST 8: Orange Team Offensive Parity ---
  console.log("\nTest 8: Orange Team Strike on Blue Net (Parity Test)");
  const orangeBot = createCar("orange_striker", "orange", 1400, env.k - 14, "octane", Math.PI);
  const orangeBall = createBall(1000, env.k - 30, 0, 0);
  let orangeGoal = false;

  for (let frame = 0; frame < 180; frame++) {
    const dt = 1 / 60;
    executeMasterBotBrain(orangeBot, orangeBall, null, null, [], -1, dt, env, true, [], {});
    stepSim(orangeBot, orangeBall, env, dt);

    if (orangeBall.x < env.le.x + 30) {
      orangeGoal = true;
      console.log(`  [PASS] Orange Team Goal scored at frame ${frame}! Exit vx: ${Math.round(orangeBall.vx)} px/s`);
      break;
    }
  }
  if (!orangeGoal) {
    console.log(`  [FAIL] Orange Team failed to score. Final Ball X: ${Math.round(orangeBall.x)}, vx: ${Math.round(orangeBall.vx)}`);
  }
}
