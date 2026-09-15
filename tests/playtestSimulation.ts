import {
  ArenaEnv,
  simulateBallSubstep,
  executeMasterBotBrain,
  updateBotJumpSeq,
  getCarHitboxSpecs
} from "../src/bot/botBrain";

// Standard RL_PRO Physics Arena
const rlEnv: ArenaEnv = {
  Kt: 2000,
  hl: 1000,
  k: 950,
  Qt: 120,
  At: 120,
  Mt: 1880,
  F: 160,
  zn: 14,
  POST_INSET: 18,
  le: { x: 120, yMin: 380, yMax: 680, depth: 100 },
  ae: { x: 1880, yMin: 380, yMax: 680, depth: 100 },
  goalType: "wall",
  isLegacy: false,
  pv: 720,
  Ph: 720,
  Uh: 0.995,
  Hh: 1450,
  Av: 6.0,
  Bh: 440,
  cc: 400,
  Gh: 320,
  Ev: 0.2,
  qh: 0.45,
  wavedashMinSpeed: 1280
};

// Legacy Physics Arena
const legacyEnv: ArenaEnv = {
  ...rlEnv,
  isLegacy: true,
  pv: 1050,
  Ph: 850,
  Uh: 0.992,
  Hh: 1800,
  Bh: 600,
  cc: 520,
  Gh: 400
};

function createSimCar(id: string, name: string, team: "blue" | "orange", startX: number, facing: number) {
  return {
    id,
    name,
    team,
    x: startX,
    y: rlEnv.k - 14.5,
    vx: 0,
    vy: 0,
    angle: facing === 1 ? 0 : Math.PI,
    facing,
    width: 68,
    height: 29,
    wheelbase: 18,
    wheelRadius: 8.5,
    boost: 50,
    isGrounded: true,
    canJump: true,
    jumpCount: 0,
    jumpHoldTimer: 0,
    flipWindowTimer: 0,
    isFlipping: false,
    flipDirection: { x: 0, y: 0 },
    flipTimer: 0,
    hasFlipReset: false,
    airRollInverted: false,
    isSupersonic: false,
    supersonicTimer: 0,
    isDemoed: false,
    surfaceType: "floor",
    surfaceNormal: { x: 0, y: -1 },
    input: {
      steerLeft: false,
      steerRight: false,
      throttleForward: false,
      throttleReverse: false,
      pitchUp: false,
      pitchDown: false,
      airRollLeft: false,
      airRollRight: false,
      jump: false,
      boost: false,
      handbrake: false,
      mouseAim: false,
      mouseTargetAngle: undefined as number | undefined
    },
    botState: {
      action: "idle",
      dribbleTime: 0,
      airDribbleTouches: 0,
      targetPos: { x: 0, y: 0 },
      interceptTime: 0,
      jumpSeq: { stage: "idle", timer: 0, type: "dodge", dodgeX: 0, dodgeY: 0 }
    }
  };
}

function updateCarKinematics(car: any, dt: number, env: ArenaEnv) {
  const specs = getCarHitboxSpecs(car);
  const floorY = env.k - specs.halfH;
  const maxDriveSpeed = env.isLegacy ? 650 : 460;
  const maxBoostSpeed = env.isLegacy ? 1250 : 750;
  const maxSpeed = car.input.boost ? maxBoostSpeed : maxDriveSpeed;

  // Jump initiation
  if (car.input.jump && car.canJump && car.isGrounded) {
    car.isGrounded = false;
    car.canJump = false;
    car.jumpCount = 1;
    car.jumpHoldTimer = 0;
    car.flipWindowTimer = 0;
    car.vy = -env.cc;
  }

  // Airborne physics
  if (!car.isGrounded) {
    car.vy += env.pv * dt;

    // Fast aerial jump hold force
    if (car.input.jump && car.jumpCount === 1 && car.jumpHoldTimer < env.Ev) {
      car.vy -= env.Gh * dt;
      car.jumpHoldTimer += dt;
    }

    // Mid-air flip window timer
    if (car.jumpCount === 1 && !car.hasFlipReset) {
      car.flipWindowTimer = (car.flipWindowTimer || 0) + dt;
    }

    // Re-arm jump when key released
    if (!car.input.jump) {
      car.canJump = true;
    }

    // 2nd Jump / Dodge Flip Execution
    const canSecondJump = (car.jumpCount === 1 || car.hasFlipReset) && (car.flipWindowTimer < 1.25 || car.hasFlipReset);
    if (car.input.jump && car.canJump && canSecondJump && !car.isFlipping) {
      car.canJump = false;
      car.jumpCount = 2;
      car.hasFlipReset = false;

      let A = 0, C = 0;
      if (car.input.steerRight) A += 1;
      if (car.input.steerLeft) A -= 1;
      const fwdDir = car.facing || (Math.cos(car.angle) >= 0 ? 1 : -1);
      if (car.input.throttleForward) A += fwdDir;
      if (car.input.throttleReverse) A -= fwdDir;
      if (car.input.pitchUp) C -= 1;
      if (car.input.pitchDown) C += 1;
      if (A === 0 && C === 0 && car.input.mouseAim && typeof car.input.mouseTargetAngle === "number") {
        A = Math.cos(car.input.mouseTargetAngle);
        C = Math.sin(car.input.mouseTargetAngle);
      }

      if (A !== 0 || C !== 0) {
        const z = Math.hypot(A, C) || 1, N = A / z, D = C / z;
        car.vy *= 0.15;
        car.vx += N * env.Bh;
        car.vy += D * (env.Bh * 0.7);
        car.isFlipping = true;
        car.flipTimer = 0;
        car.flipDirection = { x: N, y: D };
      } else {
        car.vy = Math.min(car.vy - env.cc * 1.05, -env.cc * 1.15);
      }
    }

    if (car.isFlipping) {
      car.flipTimer = (car.flipTimer || 0) + dt;
      car.angle += (car.flipDirection.x >= 0 ? 1 : -1) * (Math.PI * 2 / env.qh) * dt;
      if (car.flipTimer >= env.qh) {
        car.isFlipping = false;
        car.flipTimer = 0;
      }
    } else if (car.input.mouseAim && typeof car.input.mouseTargetAngle === "number") {
      const diff = Math.atan2(Math.sin(car.input.mouseTargetAngle - car.angle), Math.cos(car.input.mouseTargetAngle - car.angle));
      car.angle += Math.max(-21 * dt, Math.min(21 * dt, diff * 14 * dt));
    }

    // Air drag
    car.vx *= Math.pow(0.998, dt * 60);
    car.vy *= Math.pow(0.998, dt * 60);
  } else {
    // Re-arm jump when grounded
    if (!car.input.jump) {
      car.canJump = true;
    }

    // Ground acceleration
    let steerDir = 0;
    if (car.input.steerRight && !car.input.steerLeft) steerDir = 1;
    else if (car.input.steerLeft && !car.input.steerRight) steerDir = -1;
    else if (car.input.throttleForward) steerDir = car.facing;
    else if (car.input.throttleReverse) {
      if (car.vx * car.facing > 20) {
        // Active brake
        car.vx -= car.facing * 1400 * dt;
      } else {
        steerDir = -car.facing;
      }
    }

    if (steerDir !== 0) {
      car.facing = steerDir;
      car.angle = steerDir > 0 ? 0 : Math.PI;
      car.vx += steerDir * 1000 * dt;
    }

    // Ground friction
    car.vx *= Math.pow(0.985, dt * 60);
  }

  // Boost acceleration
  if (car.input.boost && car.boost > 0) {
    car.boost = Math.max(0, car.boost - 33.3 * dt);
    const boostAngle = car.isGrounded ? (car.facing === 1 ? 0 : Math.PI) : car.angle;
    const boostForce = env.isLegacy ? 1600 : 1100;
    car.vx += Math.cos(boostAngle) * boostForce * dt;
    if (!car.isGrounded) {
      car.vy += Math.sin(boostAngle) * boostForce * dt;
    }
  }

  // Speed cap
  const curSpd = Math.abs(car.vx);
  if (car.isGrounded && curSpd > maxSpeed) {
    car.vx = (car.vx / curSpd) * maxSpeed;
  }

  // Move
  car.x += car.vx * dt;
  car.y += car.vy * dt;

  // Floor collision
  if (car.y >= floorY) {
    car.y = floorY;
    car.vy = 0;
    car.isGrounded = true;
    car.canJump = true;
    car.jumpCount = 0;
    car.isFlipping = false;
    car.hasFlipReset = false;
    car.surfaceType = "floor";
    car.angle = car.facing === 1 ? 0 : Math.PI;
  }

  // Wall clamps
  if (car.x <= env.At + specs.halfW) {
    car.x = env.At + specs.halfW;
    car.vx = Math.max(0, car.vx);
  }
  if (car.x >= env.Mt - specs.halfW) {
    car.x = env.Mt - specs.halfW;
    car.vx = Math.min(0, car.vx);
  }
}

function checkBallCarCollision(ball: any, car: any, stats: any, env: ArenaEnv) {
  const specs = getCarHitboxSpecs(car);
  const dx = ball.x - car.x;
  const dy = ball.y - car.y;
  const dist = Math.hypot(dx, dy);
  const contactDist = specs.halfW + ball.radius;

  if (dist <= contactDist + 2 && dist > 0) {
    const nx = dx / dist;
    const ny = dy / dist;

    // Relative velocity
    const rvx = ball.vx - car.vx;
    const rvy = ball.vy - car.vy;
    const vDotN = rvx * nx + rvy * ny;

    if (vDotN < 0) {
      const isRoofContact = dy < -10 && Math.abs(dx) < specs.halfW * 0.85;
      if (isRoofContact) {
        // Damped roof collision allows carrying and flicking
        ball.vy = car.vy;
        ball.vx = car.vx;
        ball.y = car.y - specs.halfH - ball.radius;
      } else {
        const flipBonus = car.isFlipping ? env.Bh * 1.3 : 0;
        const impulse = -(1 + 0.70) * vDotN + (car.input.boost ? 320 : 180) + flipBonus;
        ball.vx += nx * Math.max(140, impulse);
        ball.vy += ny * Math.max(140, impulse);
      }

      ball.lastTouchTeam = car.team;
      ball.lastTouchId = car.id;
      stats.totalTouches++;

      // Check Wheel Contact for Flip Reset
      if (!car.isGrounded && !car.hasFlipReset && !car.isFlipping) {
        const isCarBelowBall = car.y > ball.y && Math.abs(car.x - ball.x) < specs.halfW * 0.85;
        const isCarInverted = Math.cos(car.angle) < -0.3 || car.airRollInverted;
        if (isCarBelowBall && isCarInverted) {
          car.hasFlipReset = true;
          stats.mechanics.flipResets++;
        }
      }
    }
  }
}

export function runPlaytestSimulation(ticks: number = 2400, mode: "rl_pro" | "legacy" = "rl_pro") {
  const env = mode === "rl_pro" ? rlEnv : legacyEnv;
  const dt = 0.016;

  console.log(`\n======================================================`);
  console.log(`RUNNING HEADLESS BOT PLAYTEST SIMULATION (${mode.toUpperCase()}, ${ticks} TICKS / ${(ticks * dt).toFixed(1)}s)`);
  console.log(`======================================================\n`);

  const stats: any = {
    currentTick: 0,
    blueGoals: 0,
    orangeGoals: 0,
    ownGoals: 0,
    totalTouches: 0,
    whiffs: 0,
    mechanics: {
      airDribbles: 0,
      flipResets: 0,
      flicks: 0,
      mustyFlicks: 0,
      wallPinches: 0,
      doubleTaps: 0,
      repossessions: 0,
      saves: 0
    }
  };

  const blueCar = createSimCar("bot-blue", "AlphaBot", "blue", env.At + 280, 1);
  const orangeCar = createSimCar("bot-orange", "BetaBot", "orange", env.Mt - 280, -1);

  let ball = {
    x: env.Kt / 2,
    y: env.k - 30,
    vx: 0,
    vy: 0,
    radius: 30,
    lastTouchTeam: null as string | null,
    lastTouchId: null as string | null
  };

  const resetKickoff = () => {
    ball.x = env.Kt / 2;
    ball.y = env.k - 30;
    ball.vx = 0;
    ball.vy = 0;
    ball.lastTouchTeam = null;

    blueCar.x = env.At + 280;
    blueCar.y = env.k - 14.5;
    blueCar.vx = 0;
    blueCar.vy = 0;
    blueCar.angle = 0;
    blueCar.facing = 1;
    blueCar.boost = 33;
    blueCar.botState.action = "idle";
    blueCar.botState.jumpSeq.stage = "idle";

    orangeCar.x = env.Mt - 280;
    orangeCar.y = env.k - 14.5;
    orangeCar.vx = 0;
    orangeCar.vy = 0;
    orangeCar.angle = Math.PI;
    orangeCar.facing = -1;
    orangeCar.boost = 33;
    orangeCar.botState.action = "idle";
    orangeCar.botState.jumpSeq.stage = "idle";
  };

  for (let tick = 0; tick < ticks; tick++) {
    stats.currentTick = tick;
    const evtBlue: any = {};
    const evtOrange: any = {};

    if (tick % 600 === 0) {
      console.log(`[${mode}] Tick ${tick}: Ball (${Math.round(ball.x)}, ${Math.round(ball.y)}), Blue: ${blueCar.botState.action}, Orange: ${orangeCar.botState.action}`);
    }

    // 1. Bot Decisions
    executeMasterBotBrain(blueCar, ball, orangeCar, null, [], 1, dt, env, true, [], evtBlue);
    executeMasterBotBrain(orangeCar, ball, blueCar, null, [], -1, dt, env, true, [], evtOrange);

    // Track mechanic events
    if (blueCar.botState.action === "air_dribble" || orangeCar.botState.action === "air_dribble") stats.mechanics.airDribbles++;
    if (blueCar.botState.action === "flip_reset_dunk" || orangeCar.botState.action === "flip_reset_dunk") stats.mechanics.flipResets++;
    if (blueCar.botState.action === "wall_pinch" || orangeCar.botState.action === "wall_pinch") stats.mechanics.wallPinches++;
    if (blueCar.botState.action === "double_tap" || orangeCar.botState.action === "double_tap" || blueCar.botState.action === "double_tap_setup" || orangeCar.botState.action === "double_tap_setup") stats.mechanics.doubleTaps++;
    if (blueCar.botState.action === "repossess" || orangeCar.botState.action === "repossess") stats.mechanics.repossessions = (stats.mechanics.repossessions || 0) + 1;
    if (blueCar.botState.action === "save" || orangeCar.botState.action === "save") stats.mechanics.saves++;

    // Track flicks
    if (blueCar.botState.jumpSeq.type === "musty_jump" || orangeCar.botState.jumpSeq.type === "musty_jump") {
      stats.mechanics.mustyFlicks++;
    }

    // 2. Physics updates
    updateCarKinematics(blueCar, dt, env);
    updateCarKinematics(orangeCar, dt, env);

    simulateBallSubstep(ball, dt / 2, env);
    simulateBallSubstep(ball, dt / 2, env);

    // 3. Collisions
    checkBallCarCollision(ball, blueCar, stats, env);
    checkBallCarCollision(ball, orangeCar, stats, env);

    // 4. Boost replenishment
    if (blueCar.isGrounded) blueCar.boost = Math.min(100, blueCar.boost + 8 * dt);
    if (orangeCar.isGrounded) orangeCar.boost = Math.min(100, orangeCar.boost + 8 * dt);

    // 5. Goal detection
    const inBlueGoal = ball.x <= env.At && ball.y >= (env.le.yMin || 380) && ball.y <= (env.le.yMax || 680);
    const inOrangeGoal = ball.x >= env.Mt && ball.y >= (env.ae.yMin || 380) && ball.y <= (env.ae.yMax || 680);

    if (inBlueGoal) {
      if (ball.lastTouchTeam === "blue") {
        console.warn(`[OWN GOAL ALERT] Blue scored into own net at tick ${tick}!`);
        stats.ownGoals++;
      } else {
        stats.orangeGoals++;
      }
      resetKickoff();
    } else if (inOrangeGoal) {
      if (ball.lastTouchTeam === "orange") {
        console.warn(`[OWN GOAL ALERT] Orange scored into own net at tick ${tick}!`);
        stats.ownGoals++;
      } else {
        stats.blueGoals++;
      }
      resetKickoff();
    }
  }

  console.log(`MATCH RESULT: Blue ${stats.blueGoals} - ${stats.orangeGoals} Orange`);
  console.log(`TOTAL BALL TOUCHES: ${stats.totalTouches}`);
  console.log(`OWN GOALS: ${stats.ownGoals} (Expected: 0)`);
  console.log(`MECHANICS TRIGGERED:`);
  console.log(`  - Air Dribble actions: ${stats.mechanics.airDribbles}`);
  console.log(`  - Flip Reset actions:  ${stats.mechanics.flipResets}`);
  console.log(`  - Musty Flick jumps:   ${stats.mechanics.mustyFlicks}`);
  console.log(`  - Wall Pinch attempts: ${stats.mechanics.wallPinches}`);
  console.log(`  - Double Tap tracking: ${stats.mechanics.doubleTaps}`);
  console.log(`  - Repossessions:       ${stats.mechanics.repossessions || 0}`);
  console.log(`  - Saves / Clearances:  ${stats.mechanics.saves}`);

  if (stats.ownGoals > 0) {
    throw new Error(`Playtest failed with ${stats.ownGoals} own goals!`);
  }

  return stats;
}

export function run2v2PlaytestSimulation(ticks: number = 2000) {
  const env = rlEnv;
  const dt = 0.016;

  console.log(`\n======================================================`);
  console.log(`RUNNING 2v2 BOT PLAYTEST SIMULATION (${ticks} TICKS)`);
  console.log(`======================================================\n`);

  const blue1 = createSimCar("blue-1", "Alpha1", "blue", env.At + 350, 1);
  const blue2 = createSimCar("blue-2", "Alpha2", "blue", env.At + 200, 1);
  const orange1 = createSimCar("orange-1", "Beta1", "orange", env.Mt - 350, -1);
  const orange2 = createSimCar("orange-2", "Beta2", "orange", env.Mt - 200, -1);

  const cars = [blue1, blue2, orange1, orange2];

  let ball = {
    x: env.Kt / 2,
    y: env.k - 30,
    vx: 0,
    vy: 0,
    radius: 30,
    lastTouchTeam: null as string | null,
    lastTouchId: null as string | null
  };

  const stats: any = {
    blueGoals: 0,
    orangeGoals: 0,
    ownGoals: 0,
    passes: 0,
    oneTimers: 0,
    totalTouches: 0,
    mechanics: {}
  };

  for (let tick = 0; tick < ticks; tick++) {
    stats.currentTick = tick;
    const evt: any = {};

    executeMasterBotBrain(blue1, ball, orange1, blue2, [blue2], 1, dt, env, true, [], evt, [orange1, orange2]);
    executeMasterBotBrain(blue2, ball, orange1, blue1, [blue1], 1, dt, env, true, [], evt, [orange1, orange2]);
    executeMasterBotBrain(orange1, ball, blue1, orange2, [orange2], -1, dt, env, true, [], evt, [blue1, blue2]);
    executeMasterBotBrain(orange2, ball, blue1, orange1, [orange1], -1, dt, env, true, [], evt, [blue1, blue2]);

    if (blue1.botState.action === "infield_pass" || orange1.botState.action === "infield_pass") stats.passes++;
    if (blue2.botState.action === "score_pass" || orange2.botState.action === "score_pass") stats.oneTimers++;
    if (blue1.botState.action === "crease_demo" || blue2.botState.action === "crease_demo" || orange1.botState.action === "crease_demo" || orange2.botState.action === "crease_demo") {
      stats.creaseDemos = (stats.creaseDemos || 0) + 1;
    }

    for (const car of cars) {
      updateCarKinematics(car, dt, env);
    }
    simulateBallSubstep(ball, dt / 2, env);
    simulateBallSubstep(ball, dt / 2, env);

    for (const car of cars) checkBallCarCollision(ball, car, stats, env);

    // Goal detection
    if (ball.x <= env.At && ball.y >= 380 && ball.y <= 680) {
      if (ball.lastTouchTeam === "blue") {
        console.warn(`[2v2 OWN GOAL ALERT] Blue scored into own net at tick ${tick} by ${ball.lastTouchId}! ball: (${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}), vx: ${ball.vx.toFixed(1)}`);
        stats.ownGoals++;
      } else {
        stats.orangeGoals++;
      }
      ball.x = env.Kt / 2; ball.y = env.k - 30; ball.vx = 0; ball.vy = 0; ball.lastTouchTeam = null;
      blue1.x = env.At + 350; blue1.vx = 0; blue1.vy = 0; blue1.facing = 1; blue1.angle = 0;
      blue2.x = env.At + 200; blue2.vx = 0; blue2.vy = 0; blue2.facing = 1; blue2.angle = 0;
      orange1.x = env.Mt - 350; orange1.vx = 0; orange1.vy = 0; orange1.facing = -1; orange1.angle = Math.PI;
      orange2.x = env.Mt - 200; orange2.vx = 0; orange2.vy = 0; orange2.facing = -1; orange2.angle = Math.PI;
    } else if (ball.x >= env.Mt && ball.y >= 380 && ball.y <= 680) {
      if (ball.lastTouchTeam === "orange") {
        console.warn(`[2v2 OWN GOAL ALERT] Orange scored into own net at tick ${tick} by ${ball.lastTouchId}! ball: (${ball.x.toFixed(1)}, ${ball.y.toFixed(1)}), vx: ${ball.vx.toFixed(1)}`);
        stats.ownGoals++;
      } else {
        stats.blueGoals++;
      }
      ball.x = env.Kt / 2; ball.y = env.k - 30; ball.vx = 0; ball.vy = 0; ball.lastTouchTeam = null;
      blue1.x = env.At + 350; blue1.vx = 0; blue1.vy = 0; blue1.facing = 1; blue1.angle = 0;
      blue2.x = env.At + 200; blue2.vx = 0; blue2.vy = 0; blue2.facing = 1; blue2.angle = 0;
      orange1.x = env.Mt - 350; orange1.vx = 0; orange1.vy = 0; orange1.facing = -1; orange1.angle = Math.PI;
      orange2.x = env.Mt - 200; orange2.vx = 0; orange2.vy = 0; orange2.facing = -1; orange2.angle = Math.PI;
    }
  }

  console.log(`2v2 MATCH RESULT: Blue ${stats.blueGoals} - ${stats.orangeGoals} Orange`);
  console.log(`INFIELD PASSES INITIATED: ${stats.passes}`);
  console.log(`ONE-TIMER REDIRECT ATTEMPTS: ${stats.oneTimers}`);
  console.log(`CREASE DEMO ATTEMPTS: ${stats.creaseDemos || 0}`);
  console.log(`OWN GOALS: ${stats.ownGoals} (Expected: 0)`);

  if (stats.ownGoals > 0) {
    throw new Error(`2v2 Playtest failed with ${stats.ownGoals} own goals!`);
  }
}

runPlaytestSimulation(4000, "rl_pro");
runPlaytestSimulation(4000, "legacy");
run2v2PlaytestSimulation(4000);

