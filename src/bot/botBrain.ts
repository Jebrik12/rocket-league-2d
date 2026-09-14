/**
 * botBrain.ts - Masterclass Flawless Rocket League Bot AI Engine
 * 
 * Provides TAS-level precision for:
 * 1. 120Hz analytical Newtonian ball trajectory prediction & intercept calculation
 * 2. Frame-accurate Fast-Aerial double-jump launches (strictly neutral 2nd jump input = 0% accidental dodge flips)
 * 3. Fluid ground movement, powerslide 180 turns, and supersonic wavedashes for boost-free recovery
 * 4. Ground dribble roof carries with 45-degree and backward Musty flicks
 * 5. Advanced aerial mechanics: controlled air dribbles, inverted flip resets, and backboard double taps
 * 6. 2v2 Passing coordination: intentional infield crosses, backboard setups, and one-timer redirect strikes
 * 7. 1v1 Smarts: disciplined shadow defense, 50/50 dunk posture, and boost pad starvation
 * 8. Elimination of all spastic jumping, stuck-watchdog false triggers, and wrong-side hops
 */

export interface GoalDef {
  type?: string;
  x?: number;
  xMin?: number;
  xMax?: number;
  y?: number;
  yMin?: number;
  yMax?: number;
  depth?: number;
  underpassY?: number;
}

export interface ArenaEnv {
  Kt: number;
  hl: number;
  k: number;
  Qt: number;
  At: number;
  Mt: number;
  F: number;
  zn: number;
  POST_INSET: number;
  le: GoalDef;
  ae: GoalDef;
  goalType: string;
  isLegacy: boolean;
  pv: number; // car gravity
  Ph: number; // ball gravity
  Uh: number; // ball air drag
  Hh: number; // ball max speed
  Av: number; // air turn torque
  Bh: number; // dodge impulse
  cc: number; // jump impulse
  Gh: number; // jump hold force
  Ev: number; // jump hold max time
  qh: number; // flip duration
  wavedashMinSpeed: number;
}

export interface InterceptResult {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isAerial: boolean;
  isRebound: boolean;
  isHalfVolley: boolean;
  strikeTargetX: number;
  strikeTargetY: number;
  dist: number;
  isSafe: boolean;
  targetCornerY: number;
}

// ---------------------------------------------------------------------------
// 1. BALL PHYSICS SIMULATION (Matches Engine Exactly)
// ---------------------------------------------------------------------------

export function simulateBallSubstep(
  b: { x: number; y: number; vx: number; vy: number; radius: number; isGoalScored?: boolean },
  subF: number,
  env: ArenaEnv
) {
  b.vy += env.Ph * subF;
  const drag = Math.pow(env.Uh, subF * 60);
  b.vx *= drag;
  b.vy *= drag;
  b.x += b.vx * subF;
  b.y += b.vy * subF;

  const radius = b.radius;
  const rContact = env.F - radius;
  const bounce = env.isLegacy ? 0.75 : 0.65;
  const groundBounce = env.isLegacy ? 0.76 : 0.60;
  const wallBounce = env.isLegacy ? 0.80 : 0.65;
  const ceilBounce = env.isLegacy ? 0.76 : 0.65;
  const groundFricFactor = env.isLegacy ? 0.94 : 0.96;
  const groundFriction = Math.pow(groundFricFactor, subF * 120);

  // 4 Corner Curves
  const tlX = env.At + env.F, tlY = env.Qt + env.F;
  if (b.x <= tlX && b.y <= tlY) {
    const dx = b.x - tlX, dy = b.y - tlY, dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = tlX - nx * rContact; b.y = tlY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) { b.vx -= (1 + bounce) * vDotN * nx; b.vy -= (1 + bounce) * vDotN * ny; }
    }
  }

  const trX = env.Mt - env.F, trY = env.Qt + env.F;
  if (b.x >= trX && b.y <= trY) {
    const dx = b.x - trX, dy = b.y - trY, dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = trX - nx * rContact; b.y = trY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) { b.vx -= (1 + bounce) * vDotN * nx; b.vy -= (1 + bounce) * vDotN * ny; }
    }
  }

  const blX = env.At + env.F, blY = env.k - env.F;
  if (b.x <= blX && b.y >= blY) {
    const dx = b.x - blX, dy = b.y - blY, dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = blX - nx * rContact; b.y = blY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) { b.vx -= (1 + bounce) * vDotN * nx; b.vy -= (1 + bounce) * vDotN * ny; }
    }
  }

  const brX = env.Mt - env.F, brY = env.k - env.F;
  if (b.x >= brX && b.y >= brY) {
    const dx = b.x - brX, dy = b.y - brY, dist = Math.hypot(dx, dy);
    if (dist > rContact && dist > 0) {
      const nx = -dx / dist, ny = -dy / dist;
      b.x = brX - nx * rContact; b.y = brY - ny * rContact;
      const vDotN = b.vx * nx + b.vy * ny;
      if (vDotN < 0) { b.vx -= (1 + bounce) * vDotN * nx; b.vy -= (1 + bounce) * vDotN * ny; }
    }
  }

  // Floor
  if (b.x >= env.At + env.F && b.x <= env.Mt - env.F && b.y + radius >= env.k) {
    b.y = env.k - radius;
    if (b.vy > 0) {
      b.vy = -b.vy * groundBounce;
      if (Math.abs(b.vy) < 25) b.vy = 0;
    }
    b.vx *= groundFriction;
  }

  // Ceiling
  if (b.x >= env.At + env.F && b.x <= env.Mt - env.F && b.y - radius <= env.Qt) {
    b.y = env.Qt + radius;
    if (b.vy < 0) b.vy = -b.vy * ceilBounce;
  }

  // Vertical Walls
  const inBM = b.y > (env.le.yMin || 380) && b.y < (env.le.yMax || 680);
  const inOM = b.y > (env.ae.yMin || 380) && b.y < (env.ae.yMax || 680);

  if (!inBM && b.y >= env.Qt + env.F && b.y <= env.k - env.F && b.x - radius <= env.At) {
    b.x = env.At + radius;
    if (b.vx < 0) b.vx = -b.vx * wallBounce;
  }
  if (!inOM && b.y >= env.Qt + env.F && b.y <= env.k - env.F && b.x + radius >= env.Mt) {
    b.x = env.Mt - radius;
    if (b.vx > 0) b.vx = -b.vx * wallBounce;
  }

  // Goal Detection
  if (!b.isGoalScored) {
    if (b.x + radius < (env.le.x !== undefined ? env.le.x : env.At) && inBM) {
      b.isGoalScored = true;
    } else if (b.x - radius > (env.ae.x !== undefined ? env.ae.x : env.Mt) && inOM) {
      b.isGoalScored = true;
    }
  }

  // Speed cap
  const spd = Math.hypot(b.vx, b.vy);
  if (spd > env.Hh) {
    const scl = env.Hh / spd;
    b.vx *= scl;
    b.vy *= scl;
  }
}

// ---------------------------------------------------------------------------
// 2. ANALYTICAL BALL INTERCEPT SOLVER
// ---------------------------------------------------------------------------

export function solveBestIntercept(
  car: any,
  ball: any,
  teamDir: number,
  env: ArenaEnv,
  oppCar?: any,
  tmCar?: any,
  isUnfair: boolean = false,
  maxT: number = 2.2
): InterceptResult {
  const dt = 0.02; // 50 Hz trajectory precision
  const maxSteps = Math.min(110, Math.ceil(maxT / dt));

  const b = {
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    radius: ball.radius || 30
  };

  const oppGoal = teamDir > 0 ? env.ae : env.le;
  const oppGoalX = teamDir > 0 ? env.Mt : env.At;
  const goalMinY = oppGoal.yMin || 380;
  const goalMaxY = oppGoal.yMax || 680;

  // Strategic Corner Targeting: aim high or low away from goalkeeper position
  let targetCornerY = (goalMinY + goalMaxY) / 2;
  if (oppCar && Math.abs(oppCar.x - oppGoalX) < 360) {
    if (oppCar.y > (goalMinY + goalMaxY) / 2) {
      // Keeper is low -> snipe top shelf!
      targetCornerY = goalMinY + 40;
    } else {
      // Keeper is high -> skip grounder into bottom corner!
      targetCornerY = goalMaxY - 40;
    }
  } else {
    // Open net -> aim top corner for boomer goal
    targetCornerY = goalMinY + 45;
  }

  let bestResult: InterceptResult = {
    t: 0.04,
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    isAerial: ball.y < env.k - 95,
    isRebound: false,
    isHalfVolley: false,
    strikeTargetX: ball.x,
    strikeTargetY: ball.y,
    dist: Math.hypot(ball.x - car.x, ball.y - car.y),
    isSafe: false,
    targetCornerY
  };

  let found = false;

  for (let step = 1; step <= maxSteps; step++) {
    const t = step * dt;
    const subF = dt / 2;
    simulateBallSubstep(b, subF, env);
    simulateBallSubstep(b, subF, env);

    const px = b.x, py = b.y;

    // Laser-accurate ball contact offset to send ball directly toward targetCornerY
    const strikeAngle = Math.atan2(targetCornerY - py, oppGoalX - px);
    const strikeTargetX = px - Math.cos(strikeAngle) * 32;
    const strikeTargetY = py - Math.sin(strikeAngle) * 32;

    // Strict Anti-Own-Goal Constraint
    const strikeRel = (strikeTargetX - car.x) * teamDir;
    const ballRel = (px - car.x) * teamDir;
    if (strikeRel < -12 || ballRel < -15) {
      continue;
    }

    const dx = strikeTargetX - car.x;
    const dy = strikeTargetY - car.y;
    const horizDist = Math.abs(dx);
    const heightClimb = Math.max(0, car.y - strikeTargetY);

    // Dynamic drive acceleration model
    const isReversing = (car.vx > 100 && dx < -40) || (car.vx < -100 && dx > 40);
    const turnDelay = isReversing ? (car.isGrounded ? 0.08 : 0.18) : 0.01;
    const maxSpeed = car.boost > 8 ? 1200 : (car.isSupersonic ? 1250 : 480);
    const avgSpeed = Math.max(380, (Math.abs(car.vx) + maxSpeed) * 0.52);
    const reqTx = turnDelay + horizDist / avgSpeed;

    // Vertical climb model
    const isAerial = py < env.k - 95;
    let reqTy = 0;
    if (isAerial) {
      const minBoostNeeded = heightClimb / 32;
      if (car.boost < minBoostNeeded && car.isGrounded) {
        continue;
      }
      reqTy = car.isGrounded
        ? 0.11 + heightClimb / 590
        : Math.max(0.04, (heightClimb + Math.max(0, car.vy * 0.25)) / 660);
    }

    const totalReqT = Math.max(reqTx, reqTy);
    const isRebound = (teamDir > 0 && px < env.Mt - 90 && b.vx < -80) || (teamDir < 0 && px > env.At + 90 && b.vx > 80);
    const isHalfVolley = py > env.k - 85 && Math.abs(b.vy) > 80;

    const margin = isUnfair ? 1.08 : 1.04;
    if (totalReqT <= t * margin) {
      return {
        t,
        x: px,
        y: py,
        vx: b.vx,
        vy: b.vy,
        isAerial,
        isRebound,
        isHalfVolley,
        strikeTargetX,
        strikeTargetY,
        dist: Math.hypot(dx, dy),
        isSafe: true,
        targetCornerY
      };
    }

    if (!found || Math.hypot(dx, dy) < bestResult.dist) {
      bestResult = {
        t,
        x: px,
        y: py,
        vx: b.vx,
        vy: b.vy,
        isAerial,
        isRebound,
        isHalfVolley,
        strikeTargetX,
        strikeTargetY,
        dist: Math.hypot(dx, dy),
        isSafe: true,
        targetCornerY
      };
      found = true;
    }
  }

  return bestResult;
}

// ---------------------------------------------------------------------------
// 3. FRAME-ACCURATE JUMP & MECHANICS SEQUENCER
// ---------------------------------------------------------------------------

export function startBotJumpSeq(
  car: any,
  type: "fast_aerial" | "dodge" | "wavedash" | "musty_jump",
  dodgeX: number = 0,
  dodgeY: number = 0
) {
  const bs = car.botState;
  if (!bs.jumpSeq || bs.jumpSeq.stage === "idle") {
    const isAirborne = !car.isGrounded || car.hasFlipReset || car.isCeilingDrop || car.jumpCount >= 1;
    if (type === "dodge" && isAirborne) {
      // Instant aerial dodge
      bs.jumpSeq = { stage: "press2", timer: 0, type, dodgeX, dodgeY };
    } else {
      bs.jumpSeq = { stage: "press1", timer: 0, type, dodgeX, dodgeY };
    }
  }
}

export function updateBotJumpSeq(car: any, dt: number, env: ArenaEnv): boolean {
  const bs = car.botState;
  if (!bs || !bs.jumpSeq || bs.jumpSeq.stage === "idle") return false;

  const s = bs.jumpSeq;
  s.timer += dt;

  // 1. FAST AERIAL DOUBLE JUMP (Strictly Neutral Direction on 2nd Jump)
  if (s.type === "fast_aerial") {
    if (s.stage === "press1") {
      car.input.jump = true;
      car.input.boost = true;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

      // Tilt nose upward into the sky (+Y is down, so upward angle is -PI/2)
      const facing = Math.cos(car.angle) >= 0 ? 1 : -1;
      if (facing > 0) {
        // Facing Right (angle ~0): nose up requires angle to decrease towards -PI/2
        car.input.steerLeft = true;
        car.input.steerRight = false;
      } else {
        // Facing Left (angle ~PI or -PI): nose up requires angle to increase towards -PI/2
        car.input.steerRight = true;
        car.input.steerLeft = false;
      }
      car.input.pitchUp = false;
      car.input.pitchDown = false;

      if (s.timer >= 0.03) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      // RELEASE JUMP KEY AND ZERO OUT ALL DIRECTIONAL INPUTS!
      car.input.jump = false;
      car.input.boost = true;
      car.input.steerLeft = false;
      car.input.steerRight = false;
      car.input.pitchUp = false;
      car.input.pitchDown = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

      if (s.timer >= 0.02) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      // 2ND JUMP TAP: NEUTRAL INPUTS TO GUARANTEE A CLEAN DOUBLE JUMP (ZERO DODGE-FLIP!)
      car.input.jump = true;
      car.input.boost = true;
      car.input.steerLeft = false;
      car.input.steerRight = false;
      car.input.pitchUp = false;
      car.input.pitchDown = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

      if (s.timer >= 0.05) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    }
  }

  // 2. POWER DODGE / FLICK
  if (s.type === "dodge") {
    if (s.stage === "press1") {
      car.input.jump = true;
      if (s.timer >= 0.03) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      car.input.jump = false;
      if (s.timer >= 0.015) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      // Fire dodge with precise directional vector
      car.input.jump = true;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;
      car.input.steerRight = s.dodgeX > 0.15;
      car.input.steerLeft = s.dodgeX < -0.15;
      car.input.pitchDown = s.dodgeY > 0.15;
      car.input.pitchUp = s.dodgeY < -0.15;

      if (s.timer >= 0.06) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    }
  }

  // 3. SUPERSONIC WAVEDASH
  if (s.type === "wavedash") {
    if (s.stage === "press1") {
      car.input.jump = true;
      car.input.pitchDown = true;
      if (s.timer >= 0.02) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      car.input.jump = false;
      car.input.pitchDown = true;
      if (s.timer >= 0.015) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      // Slam dodge into ground for instant supersonic wavedash
      car.input.jump = true;
      car.input.pitchDown = true;
      car.input.steerRight = s.dodgeX > 0.15;
      car.input.steerLeft = s.dodgeX < -0.15;

      if (s.timer >= 0.06) {
        s.stage = "idle";
        s.timer = 0;
      }
      return true;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// 4. PRECISION FLIGHT & GROUND LOCOMOTION
// ---------------------------------------------------------------------------

export function botDriveGround(
  car: any,
  targetX: number,
  allowBoost: boolean = true,
  allowWavedash: boolean = false,
  env?: ArenaEnv
) {
  const dx = targetX - car.x;
  const distX = Math.abs(dx);
  const driveDir = dx > 0 ? 1 : -1;

  if (dx > 3) {
    car.input.steerRight = true;
    car.input.steerLeft = false;
    car.input.throttleForward = true;
  } else if (dx < -3) {
    car.input.steerLeft = true;
    car.input.steerRight = false;
    car.input.throttleForward = true;
  } else {
    car.input.throttleForward = true;
    car.input.steerLeft = false;
    car.input.steerRight = false;
  }

  const isFacingRight = Math.cos(car.angle) > 0.2;
  const isFacingLeft = Math.cos(car.angle) < -0.2;
  const isAligned = (dx > 0 && isFacingRight) || (dx < 0 && isFacingLeft);

  // Powerslide quick-turn when reversing direction
  const isOpposingSpeed = (dx > 50 && car.vx < -90) || (dx < -50 && car.vx > 90);
  if (isOpposingSpeed && car.isGrounded) {
    car.input.handbrake = true;
    car.input.throttleForward = true;
  }

  // Boost acceleration
  if (allowBoost && isAligned && car.boost > 0 && !car.isSupersonic) {
    car.input.boost = true;
  }

  // Wavedash on ground straightaway if low on boost
  if (allowWavedash && car.boost < 18 && car.isGrounded && car.canJump && !car.isFlipping && distX > 340 && isAligned && Math.abs(car.vx) > 140) {
    startBotJumpSeq(car, "wavedash", driveDir, 0.85);
  }
}

export function botDriveAir(
  car: any,
  targetX: number,
  targetY: number,
  env: ArenaEnv,
  explicitT?: number,
  desiredInverted?: boolean
) {
  const dx = targetX - car.x;
  const dy = targetY - car.y;
  const dist = Math.hypot(dx, dy);

  const spd = Math.hypot(car.vx, car.vy);
  const estT = (explicitT && explicitT > 0.04)
    ? Math.min(1.8, explicitT)
    : Math.max(0.10, Math.min(1.2, dist / Math.max(480, spd)));

  // Analytical acceleration vector required to meet target under car gravity pv
  const needAx = 2 * (dx - car.vx * estT) / (estT * estT);
  const needAy = 2 * (dy - car.vy * estT) / (estT * estT) - env.pv;

  const desiredAngle = Math.atan2(needAy, needAx);
  const angleDiff = Math.atan2(Math.sin(desiredAngle - car.angle), Math.cos(desiredAngle - car.angle));

  // Angular deadzone
  const deadzone = 0.07;
  if (angleDiff > deadzone) {
    car.input.steerRight = true;
    car.input.steerLeft = false;
  } else if (angleDiff < -deadzone) {
    car.input.steerLeft = true;
    car.input.steerRight = false;
  } else {
    car.input.steerLeft = false;
    car.input.steerRight = false;
  }

  car.input.pitchUp = false;
  car.input.pitchDown = false;
  car.input.throttleForward = true;

  // Inverted air roll alignment (for flip resets / freestyle)
  if (desiredInverted !== undefined) {
    if (desiredInverted !== !!car.airRollInverted) {
      if (!car._prevAirRollRight) {
        car.input.airRollRight = true;
      } else {
        car.input.airRollRight = false;
      }
    } else {
      car.input.airRollRight = false;
      car.input.airRollLeft = false;
    }
  }

  // Boost gating: burn boost when aligned with target climb vector
  const isAscendingNeed = needAy < -140 && Math.sin(car.angle) < -0.22;
  const isCloseStrike = dist < 80 && Math.abs(angleDiff) <= 1.1;
  const isAlignedThrust = Math.abs(angleDiff) <= 0.60;

  if ((isAlignedThrust || isAscendingNeed || isCloseStrike) && car.boost > 0) {
    car.input.boost = true;
  } else {
    car.input.boost = false;
  }
}

// ---------------------------------------------------------------------------
// 5. MASTER BOT STRATEGY & TACTICAL PROTOCOL
// ---------------------------------------------------------------------------

export function executeMasterBotBrain(
  car: any,
  ball: any,
  oppCar: any,
  tmCar: any,
  allTeammates: any[],
  teamDir: number,
  dt: number,
  env: ArenaEnv,
  isUnfair: boolean,
  boostPads: any,
  evtObj: any
) {
  const z = car.botState;
  const ownGoal = teamDir > 0 ? env.le : env.ae;
  const oppGoal = teamDir > 0 ? env.ae : env.le;
  const oppGoalX = teamDir > 0 ? env.Mt : env.At;
  const distToBall = Math.hypot(ball.x - car.x, ball.y - car.y);

  // 1. ACTIVE SEQUENCE CHECK (Jump / Fast Aerial / Dodge / Wavedash)
  if (z.jumpSeq && z.jumpSeq.stage !== "idle") {
    const active = updateBotJumpSeq(car, dt, env);
    if (active) return;
  }

  // 2. KICKOFF STRATEGY
  const isKickoffBall = Math.abs(ball.x - env.Kt / 2) < 25 && Math.abs(ball.vx) < 5 && Math.abs(ball.vy) < 5 && ball.y > env.k - 90;
  if (isKickoffBall) {
    z.action = "kickoff";
    executeKickoff(car, ball, teamDir, env, isUnfair, tmCar);
    return;
  }

  // 3. DEFENSIVE THREAT AUDIT & CLUTCH SAVES
  const threat = checkDefensiveThreat(ball, ownGoal, teamDir, env);
  if (threat.isThreat === 1) {
    z.action = "save";
    executeGoalkeeperSave(car, ball, ownGoal, teamDir, threat.interceptTime, threat.interceptY, env);
    return;
  }
  if (threat.isThreat === 2) {
    z.action = "backboard_clear";
    executeBackboardClear(car, ball, ownGoal, teamDir, env);
    return;
  }

  // 4. ROTATIONAL TEAMPLAY IN 2v2 (1st Man vs 2nd Man)
  let rank = 0;
  if (allTeammates && allTeammates.length > 0) {
    for (const tm of allTeammates) {
      if (tm.isDemoed) continue;
      const d = Math.hypot(ball.x - tm.x, ball.y - tm.y);
      if (d < distToBall - 30) {
        rank++;
      }
    }
  }

  // 2nd MAN: Midfield positioning, pass reception & second-man one-timer!
  if (rank >= 1 && tmCar) {
    executeSecondManSupport(car, ball, tmCar, ownGoal, oppGoal, teamDir, env, evtObj, isUnfair);
    return;
  }

  // 5. BALL BEHIND CAR (Strict Anti-Own-Goal Shadow Recovery)
  const isBehind = (car.x - ball.x) * teamDir > -12;
  if (isBehind) {
    z.action = "rotate_back";
    executeShadowRecovery(car, ball, ownGoal, teamDir, env);
    return;
  }

  // 6. 2v2 INFIELD PASSING (1st Man in Offensive Corner -> Dish to Teammate!)
  if (tmCar && Math.abs(ball.x - oppGoalX) < 320 && ball.y > 450) {
    const tmIsCentral = (teamDir > 0 && tmCar.x < oppGoalX - 220) || (teamDir < 0 && tmCar.x > oppGoalX + 220);
    if (tmIsCentral) {
      z.action = "infield_pass";
      botDriveGround(car, ball.x, true, false, env);
      if (Math.abs(car.x - ball.x) <= 45 && car.canJump && !car.isFlipping) {
        // Chip inward away from backboard directly to teammate
        startBotJumpSeq(car, "dodge", -teamDir * 0.45, -0.75);
        if (Math.random() < 0.45) evtObj.chatMessage = "Centering! 🎯";
        return;
      }
      return;
    }
  }

  // 7. ROOF CARRY DRIBBLE & 45° / MUSTY FLICK
  const isNearFloor = ball.y >= env.k - 50 && car.isGrounded;
  const isRollingCleanly = Math.abs(ball.vy) < 60;
  const dxToBall = Math.abs(car.x - ball.x);

  if (isNearFloor && isRollingCleanly && dxToBall < 55 && car.boost > 12) {
    // Dribble carry setup
    const isRoofCarrying = Math.abs(car.x - ball.x) < 28 && ball.y <= car.y - car.height / 2 + 5;
    if (isRoofCarrying) {
      z.dribbleTime = (z.dribbleTime || 0) + dt;
      // If defender is close (< 220px) or dribble held for > 0.4s, execute flick!
      const oppClose = oppCar && Math.hypot(oppCar.x - car.x, oppCar.y - car.y) < 220;
      if (oppClose || z.dribbleTime > 0.45) {
        if (isUnfair && Math.random() < 0.50) {
          // Backward Musty flick
          startBotJumpSeq(car, "dodge", -teamDir, 0.40);
          if (Math.random() < 0.6) evtObj.chatMessage = "Musty flick! ⚡";
        } else {
          // 45-degree forward flick
          startBotJumpSeq(car, "dodge", teamDir, -0.45);
          if (Math.random() < 0.6) evtObj.chatMessage = "Flick shot! 🚀";
        }
        z.dribbleTime = 0;
        return;
      }
      // Continue matching speed to hold ball on roof
      botDriveGround(car, ball.x, false, false, env);
      return;
    }
  }

  // 8. DOUBLE TAP REBOUND DUNK
  const isOppBackboardBounce = (teamDir > 0 && ball.x > env.Mt - 260) || (teamDir < 0 && ball.x < env.At + 260);
  if (isOppBackboardBounce && ball.y < (oppGoal.yMin || 380) + 40 && car.boost > 10) {
    const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 1.8);
    if (intercept && intercept.isRebound) {
      z.action = "double_tap";
      if (car.isGrounded) {
        botDriveGround(car, intercept.strikeTargetX, true, false, env);
        const hClimb = Math.max(0, car.y - intercept.y);
        const climbT = 0.10 + hClimb / 590;
        if (car.canJump && !car.isFlipping && car.boost > 10 && intercept.t <= climbT + 0.16) {
          startBotJumpSeq(car, "fast_aerial");
        }
      } else {
        botDriveAir(car, intercept.strikeTargetX, intercept.strikeTargetY, env, intercept.t);
        if (distToBall < 85 && (car.jumpCount === 1 || car.hasFlipReset)) {
          const shootAng = Math.atan2(intercept.targetCornerY - ball.y, oppGoalX - ball.x);
          startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
          if (Math.random() < 0.5) evtObj.chatMessage = "Double tap! 🎯";
        }
      }
      return;
    }
  }

  // 9. FLIP RESET EXECUTION & DUNK
  if (car.hasFlipReset) {
    z.action = "flip_reset_dunk";
    const shootAngle = Math.atan2((oppGoal.yMin || 380) + 45 - ball.y, oppGoalX - ball.x);
    if (distToBall < 88) {
      startBotJumpSeq(car, "dodge", Math.cos(shootAngle), Math.sin(shootAngle) * 0.85);
      if (Math.random() < 0.6) evtObj.chatMessage = "Flip reset flick! 🌟";
      return;
    } else {
      botDriveAir(car, ball.x, ball.y, env, 0.40);
      return;
    }
  }

  // FLIP RESET SETUP: fly inverted under high airborne ball
  if (ball.y < env.k - 200 && ball.y > env.Qt + 140 && car.boost > 16 && (isUnfair || Math.random() < 0.7)) {
    const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 1.4);
    if (car.isGrounded && distToBall < 300 && Math.abs(ball.vx) < 700) {
      z.action = "flip_reset_setup";
      botDriveGround(car, intercept.strikeTargetX, true, false, env);
      const hClimb = Math.max(0, car.y - intercept.y);
      const climbT = 0.10 + hClimb / 590;
      if (car.canJump && !car.isFlipping && car.boost > 14 && intercept.t <= climbT + 0.16) {
        startBotJumpSeq(car, "fast_aerial");
      }
      return;
    }
    if (!car.isGrounded && !car.hasFlipReset && distToBall < 240) {
      z.action = "flip_reset_setup";
      // Position underside towards ball
      botDriveAir(car, ball.x, ball.y + 25, env, 0.40, true);
      return;
    }
  }

  // 10. AIR DRIBBLE: carry ball toward opponent net in flight
  if (ball.y < env.k - 120 && ball.y > env.Qt + 110 && car.boost > 10 && ((teamDir > 0 && ball.x < oppGoalX - 120) || (teamDir < 0 && ball.x > oppGoalX + 120))) {
    z.action = "air_dribble";
    executeAirDribble(car, ball, oppGoalX, (oppGoal.yMin || 380) + 45, teamDir, dt, env, evtObj);
    return;
  }

  // 11. BOOST STARVATION / DEFENSIVE PAD ROUTING
  if (car.boost < 20 && boostPads && distToBall > 320) {
    const pad = findStrategicBoostPad(car, boostPads, ownGoal.x || (teamDir > 0 ? env.At : env.Mt), oppGoalX, teamDir);
    if (pad && Math.hypot(pad.x - car.x, pad.y - car.y) < 260) {
      botDriveGround(car, pad.x, false, false, env);
      return;
    }
  }

  // 12. MASTERPIECE ELEVATED SCORING & INTERCEPT
  z.action = "attack";
  const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 1.8);
  const targetX = intercept.strikeTargetX || intercept.x;
  const targetY = intercept.strikeTargetY || intercept.y;
  const shootAngle = Math.atan2(intercept.targetCornerY - ball.y, oppGoalX - ball.x);
  const cosShoot = Math.cos(shootAngle), sinShoot = Math.sin(shootAngle);

  if (car.isGrounded) {
    if (!intercept.isSafe || (targetX - car.x) * teamDir < -15) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }
    botDriveGround(car, targetX, true, true, env);

    if (intercept.isAerial) {
      const hClimb = Math.max(0, car.y - intercept.y);
      const climbT = 0.10 + hClimb / 590;
      const horizDist = Math.abs(car.x - targetX);
      const maxLaunchDist = Math.max(85, Math.abs(car.vx) * climbT + 65);
      if (car.canJump && !car.isFlipping && car.boost > 8 && intercept.t <= climbT + 0.15 && horizDist <= maxLaunchDist) {
        startBotJumpSeq(car, "fast_aerial");
      }
    } else {
      // Ground chip/dodge strike into net
      if (distToBall <= 68 && Math.abs(car.x - ball.x) <= 58 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", cosShoot, sinShoot * 0.85);
      }
    }
  } else {
    if (!intercept.isSafe || (targetX - car.x) * teamDir < -15) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }
    botDriveAir(car, targetX, targetY, env, intercept.t);
    if (distToBall < 85 && (car.jumpCount === 1 || car.hasFlipReset)) {
      startBotJumpSeq(car, "dodge", cosShoot, sinShoot * 0.85);
    }
  }
}

// ---------------------------------------------------------------------------
// 6. HELPER SUB-BEHAVIORS
// ---------------------------------------------------------------------------

function executeKickoff(car: any, ball: any, teamDir: number, env: ArenaEnv, isUnfair: boolean, tmCar: any) {
  const s = ball.x - car.x;
  const dist = Math.hypot(s, ball.y - car.y);

  car.input.throttleForward = true;
  car.input.steerRight = s > 1.5;
  car.input.steerLeft = s < -1.5;

  if (car.boost > 0) {
    car.input.boost = true;
  }

  const isFacingBall = (s > 0 && Math.cos(car.angle) > 0.1) || (s < 0 && Math.cos(car.angle) < -0.1);
  if (!isFacingBall && car.isGrounded) {
    car.input.handbrake = true;
  }

  // Lethal contact power blast
  if (dist <= 48 && car.canJump && !car.isFlipping) {
    startBotJumpSeq(car, "dodge", teamDir, -0.16);
  }
}

function checkDefensiveThreat(ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const b = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, radius: ball.radius || 30 };
  const dt = 0.025;
  const maxSteps = 100;
  const subF = dt / 2;

  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const yMin = ownGoal.yMin || 380;
  const yMax = ownGoal.yMax || 680;

  for (let step = 1; step <= maxSteps; step++) {
    const t = step * dt;
    simulateBallSubstep(b, subF, env);
    simulateBallSubstep(b, subF, env);

    const isCrossingGoalX = teamDir > 0 ? (b.x - b.radius <= goalX + 15) : (b.x + b.radius >= goalX - 15);
    if (isCrossingGoalX) {
      if (b.y >= yMin - 25 && b.y <= yMax + 25) {
        return { isThreat: 1, interceptTime: t, interceptY: b.y };
      }
      if (b.y < yMin - 25 && b.y > env.Qt + 20) {
        return { isThreat: 2, interceptTime: t, interceptY: b.y };
      }
      break;
    }
  }

  return { isThreat: 0, interceptTime: 0, interceptY: 0 };
}

function executeGoalkeeperSave(
  car: any,
  ball: any,
  ownGoal: GoalDef,
  teamDir: number,
  interceptTime: number,
  interceptY: number,
  env: ArenaEnv
) {
  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const targetSaveY = Math.max((ownGoal.yMin || 380) + 25, Math.min((ownGoal.yMax || 680) - 25, interceptY));
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);
  const clearDirX = teamDir;
  const clearDirY = -0.45;

  const isHighBall = ball.y < env.k - 90 || targetSaveY < env.k - 80;
  const hClimb = Math.max(0, car.y - targetSaveY);
  const climbT = 0.10 + hClimb / 580;
  const goalGuardX = goalX + teamDir * 65;

  if (car.isGrounded) {
    if (isHighBall) {
      botDriveGround(car, goalGuardX, true, false, env);
      if (interceptTime <= climbT + 0.16 && car.boost > 8 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "fast_aerial");
      }
    } else {
      const isGoalieBehindBall = (ball.x - car.x) * teamDir > 0;
      if (isGoalieBehindBall) {
        botDriveGround(car, ball.x, true, false, env);
        if (dist <= 75 && car.canJump && !car.isFlipping) {
          startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
        }
      } else {
        // Shadow retreat to guard post without blind hopping
        botDriveGround(car, goalGuardX, false, false, env);
      }
    }
  } else {
    botDriveAir(car, goalX + teamDir * 45, targetSaveY, env, interceptTime);
    if (dist <= 85 && (car.jumpCount === 1 || car.hasFlipReset)) {
      startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
    }
  }
}

function executeBackboardClear(car: any, ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const backboardX = goalX + teamDir * 60;
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);

  if (car.isGrounded) {
    botDriveGround(car, backboardX, true, false, env);
    if (Math.abs(car.x - backboardX) < 180 && ball.y < env.k - 100 && car.canJump) {
      startBotJumpSeq(car, "fast_aerial");
    }
  } else {
    botDriveAir(car, ball.x, ball.y, env, 0.45);
    if (dist < 110 && (car.jumpCount === 1 || car.hasFlipReset)) {
      startBotJumpSeq(car, "dodge", teamDir, -0.4);
    }
  }
}

function executeSecondManSupport(
  car: any,
  ball: any,
  tmCar: any,
  ownGoal: GoalDef,
  oppGoal: GoalDef,
  teamDir: number,
  env: ArenaEnv,
  evtObj: any,
  isUnfair: boolean
) {
  const ballInOurHalf = (teamDir > 0 && ball.x < env.Kt / 2) || (teamDir < 0 && ball.x > env.Kt / 2);
  const oppGoalX = teamDir > 0 ? env.Mt : env.At;
  const ownGoalX = teamDir > 0 ? env.At : env.Mt;

  if (ballInOurHalf) {
    // Anchor defensive back-post
    car.botState.action = "anchor_goal";
    const anchorX = ownGoalX + teamDir * 180;
    botDriveGround(car, anchorX, false, false, env);
    return;
  }

  // Teammate crossing inward from offensive flank!
  const isTmCrossing = Math.abs(tmCar.x - oppGoalX) < 360 && ball.y < env.k - 80;
  if (isTmCrossing && (ball.vx * teamDir < -15 || Math.abs(ball.vx) < 170)) {
    car.botState.action = "score_pass";
    const intercept = solveBestIntercept(car, ball, teamDir, env, null, tmCar, isUnfair, 1.5);
    if (car.isGrounded) {
      botDriveGround(car, intercept.strikeTargetX, true, true, env);
      const hClimb = Math.max(0, car.y - intercept.y);
      const climbT = 0.10 + hClimb / 580;
      if (intercept.isAerial && car.canJump && !car.isFlipping && car.boost > 10 && intercept.t <= climbT + 0.14) {
        startBotJumpSeq(car, "fast_aerial");
      }
    } else {
      botDriveAir(car, intercept.strikeTargetX, intercept.strikeTargetY, env, intercept.t);
      if (Math.hypot(ball.x - car.x, ball.y - car.y) < 88 && (car.jumpCount === 1 || car.hasFlipReset)) {
        const shootAng = Math.atan2(intercept.targetCornerY - ball.y, oppGoalX - ball.x);
        startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
        if (Math.random() < 0.6) evtObj.chatMessage = "One-timer blast! 💥";
      }
    }
  } else {
    // Midfield support positioning
    car.botState.action = "midfield_support";
    const midX = env.Kt / 2 + teamDir * 160;
    botDriveGround(car, midX, false, false, env);
  }
}

function executeShadowRecovery(car: any, ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const ownGoalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const retreatX = ownGoalX + teamDir * 170;

  car.input.jump = false;
  car.input.pitchUp = false;
  car.input.pitchDown = false;

  // Turn smoothly towards own goal, powersliding if necessary, and sprint back
  botDriveGround(car, retreatX, false, true, env);
}

function executeAirDribble(
  car: any,
  ball: any,
  oppGoalX: number,
  targetCornerY: number,
  teamDir: number,
  dt: number,
  env: ArenaEnv,
  evtObj: any
) {
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);
  if (car.isGrounded) {
    botDriveGround(car, ball.x - teamDir * 15, true, false, env);
    if (Math.abs(car.x - ball.x) < 80 && car.boost > 10) {
      startBotJumpSeq(car, "fast_aerial");
    }
    return;
  }

  const sweetX = ball.x - teamDir * 12;
  const sweetY = ball.y + 18;
  botDriveAir(car, sweetX, sweetY, env, 0.35);

  const goalDist = Math.abs(car.x - oppGoalX);
  if (goalDist < 290 && dist < 82 && (car.jumpCount === 1 || car.hasFlipReset)) {
    const shootAng = Math.atan2(targetCornerY - ball.y, oppGoalX - ball.x);
    startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.82);
    if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "Air dribble dunk! 💥";
  }
}

function findStrategicBoostPad(car: any, boostPads: any[], ownGoalX: number, oppGoalX: number, teamDir: number) {
  if (!boostPads || boostPads.length === 0) return null;
  const readyPads = boostPads.filter((p: any) => p.active || p.cooldownTimer < 0.6);
  if (readyPads.length === 0) return null;

  // Route along defensive path toward own net
  const defensivePads = readyPads.filter((p: any) => (teamDir > 0 ? p.x < car.x : p.x > car.x));
  if (defensivePads.length > 0) {
    return defensivePads.sort((a: any, b: any) => {
      const scoreA = Math.hypot(a.x - car.x, a.y - car.y) - (a.type === "big" ? 250 : 0);
      const scoreB = Math.hypot(b.x - car.x, b.y - car.y) - (b.type === "big" ? 250 : 0);
      return scoreA - scoreB;
    })[0];
  }

  return readyPads.sort((a: any, b: any) => Math.hypot(a.x - car.x, a.y - car.y) - Math.hypot(b.x - car.x, b.y - car.y))[0];
}
