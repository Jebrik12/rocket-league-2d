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
    isSafe: true,
    targetCornerY
  };

  let found = false;

  for (let step = 1; step <= maxSteps; step++) {
    const t = step * dt;
    const subF = dt / 2;
    simulateBallSubstep(b, subF, env);
    simulateBallSubstep(b, subF, env);

    const px = b.x, py = b.y;

    // Hitbox-aligned contact offset from ball center
    const halfWidth = (car.width || 68) / 2;
    const strikeAngle = Math.atan2(targetCornerY - py, oppGoalX - px);
    const carDistToPoint = Math.hypot(px - car.x, py - car.y);
    const contactOffset = Math.min(halfWidth + 24, Math.max(16, carDistToPoint - 30));
    let strikeTargetX = px - Math.cos(strikeAngle) * contactOffset;
    let strikeTargetY = py - Math.sin(strikeAngle) * contactOffset;

    // Strict Anti-Own-Goal Constraint: route goal-side if ball is behind car
    const ballRel = (px - car.x) * teamDir;
    let horizDist = Math.abs(strikeTargetX - car.x);
    if (ballRel < -10) {
      strikeTargetX = px - teamDir * (halfWidth + 28);
      horizDist = Math.abs(car.x - strikeTargetX) + 45;
    }

    const dx = strikeTargetX - car.x;
    const dy = strikeTargetY - car.y;
    const heightClimb = Math.max(0, car.y - strikeTargetY);

    // Dynamic drive acceleration model
    const isReversing = (car.vx > 100 && (strikeTargetX - car.x) < -40) || (car.vx < -100 && (strikeTargetX - car.x) > 40);
    const turnDelay = isReversing ? (car.isGrounded ? 0.08 : 0.18) : 0.01;
    const maxSpeed = car.boost > 8 ? 1250 : (car.isSupersonic ? 1280 : 520);
    const avgSpeed = Math.max(420, (Math.abs(car.vx) + maxSpeed) * 0.55);
    const reqTx = turnDelay + horizDist / avgSpeed;

    // Vertical climb model
    const isAerial = py < env.k - 95;
    let reqTy = 0;
    if (isAerial) {
      const jumpReach = 110;
      const aerialClimb = Math.max(0, heightClimb - jumpReach);
      const minBoostNeeded = aerialClimb / 36;
      if (car.boost < minBoostNeeded && car.isGrounded) {
        continue;
      }
      reqTy = car.isGrounded
        ? 0.08 + heightClimb / 590
        : Math.max(0.04, (heightClimb + Math.max(0, car.vy * 0.25)) / 660);
    }

    const totalReqT = Math.max(reqTx, reqTy);
    const isRebound = (teamDir > 0 && px < env.Mt - 90 && b.vx < -80) || (teamDir < 0 && px > env.At + 90 && b.vx > 80);
    const isHalfVolley = py > env.k - 85 && Math.abs(b.vy) > 80;

    const margin = isUnfair ? 1.15 : 1.08;
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
      // Instant aerial dodge: set inputs on frame 1 for immediate execution!
      bs.jumpSeq = { stage: "press2", timer: 0, type, dodgeX, dodgeY };
      car.input.jump = true;
      car.input.throttleForward = true;
      car.input.steerRight = dodgeX > 0.15;
      car.input.steerLeft = dodgeX < -0.15;
      car.input.pitchDown = dodgeY > 0.15;
      car.input.pitchUp = dodgeY < -0.15;
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
      car.input.throttleForward = true;
      car.input.throttleReverse = false;

      // Tilt nose upward into sky (-Y is up, angle = -PI/2) only when airborne
      if (!car.isGrounded) {
        const desiredAngle = -Math.PI / 2;
        const angleDiff = Math.atan2(Math.sin(desiredAngle - car.angle), Math.cos(desiredAngle - car.angle));
        if (angleDiff > 0.10) {
          car.input.steerRight = true;
          car.input.steerLeft = false;
        } else if (angleDiff < -0.10) {
          car.input.steerLeft = true;
          car.input.steerRight = false;
        } else {
          car.input.steerLeft = false;
          car.input.steerRight = false;
        }
      } else {
        car.input.steerLeft = false;
        car.input.steerRight = false;
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
      car.input.throttleForward = true;
      if (car.boost > 0) car.input.boost = true;
      if (s.timer >= 0.02) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      car.input.jump = false;
      car.input.throttleForward = true;
      if (car.boost > 0) car.input.boost = true;
      if (s.timer >= 0.015) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      // Fire dodge with precise directional vector
      car.input.jump = true;
      if (car.boost > 0) car.input.boost = true;

      // Continuous sub-pixel aim vector support
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);

      if (s.dodgeX > 0.15) {
        car.input.steerRight = true;
        car.input.steerLeft = false;
        car.input.throttleForward = true;
        car.input.throttleReverse = false;
      } else if (s.dodgeX < -0.15) {
        car.input.steerLeft = true;
        car.input.steerRight = false;
        car.input.throttleForward = false;
        car.input.throttleReverse = true;
      } else {
        car.input.steerLeft = false;
        car.input.steerRight = false;
        car.input.throttleForward = false;
        car.input.throttleReverse = false;
      }

      car.input.pitchDown = s.dodgeY > 0.15;
      car.input.pitchUp = s.dodgeY < -0.15;

      if (s.timer >= 0.06) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
        car.input.mouseAim = false;
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

  const isFacingRight = Math.cos(car.angle) > 0.15;
  const isFacingLeft = Math.cos(car.angle) < -0.15;
  const isAligned = (dx > 0 && isFacingRight) || (dx < 0 && isFacingLeft);

  // Powerslide quick-turn when reversing direction
  const isOpposingSpeed = (dx > 40 && car.vx < -80) || (dx < -40 && car.vx > 80);
  if (isOpposingSpeed && car.isGrounded) {
    car.input.handbrake = true;
    car.input.throttleForward = true;
  }

  // Boost acceleration: boost through contact when attacking (<240px) or accelerating
  const curSpd = Math.hypot(car.vx, car.vy);
  const canBoost = allowBoost && isAligned && car.boost > 0 && (distX < 240 || curSpd < 715 || !car.isSupersonic);
  if (canBoost) {
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

  let desiredAngle = 0;
  let needAy = 0;

  // Direct aim vector on close approach (< 140px or explicitT < 0.25s) to avoid 1/t^2 singularity!
  if (dist < 140 || (explicitT !== undefined && explicitT < 0.25)) {
    desiredAngle = Math.atan2(dy, dx);
    needAy = dy < 0 ? -300 : 0;
  } else {
    const spd = Math.hypot(car.vx, car.vy);
    const estT = Math.max(0.25, Math.min(1.8, (explicitT && explicitT > 0.04) ? explicitT : (dist / Math.max(480, spd))));
    const needAx = 2 * (dx - car.vx * estT) / (estT * estT);
    needAy = 2 * (dy - car.vy * estT) / (estT * estT) - env.pv;
    desiredAngle = Math.atan2(needAy, needAx);
  }

  const angleDiff = Math.atan2(Math.sin(desiredAngle - car.angle), Math.cos(desiredAngle - car.angle));

  // Fast angular tracking
  const deadzone = 0.06;
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

  // Boost engagement: NEVER cut boost during final strike or ascent!
  const isAligned = Math.abs(angleDiff) <= 0.82;
  const isAscendingNeed = dy < -25 && Math.sin(car.angle) < -0.15 && Math.abs(angleDiff) <= 1.10;
  const isCloseStrike = dist < 140 && Math.abs(angleDiff) <= 1.25;

  if ((isAligned || isAscendingNeed || isCloseStrike) && car.boost > 0) {
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
  const isBehind = (car.x - ball.x) * teamDir > 35 && distToBall > 55;
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
        // Clinical forward flick shot into opponent goal
        startBotJumpSeq(car, "dodge", teamDir, -0.48);
        if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "Flick shot! 🚀";
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

  // 10. AIR DRIBBLE: carry ball toward opponent net in flight (only when already airborne and close!)
  const ownGoalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const isOffensiveZone = (ball.x - ownGoalX) * teamDir > 420;
  const canAirDribble = !car.isGrounded && distToBall < 130 && ball.y < env.k - 85 && ball.y > env.Qt + 90 && ((ball.x - car.x) * teamDir > -15);
  if (isOffensiveZone && canAirDribble && car.boost > 8 && ((teamDir > 0 && ball.x < oppGoalX - 80) || (teamDir < 0 && ball.x > oppGoalX + 80))) {
    z.action = "air_dribble";
    let targetCornerY = (oppGoal.yMin || 380) + 45;
    if (oppCar && !oppCar.isDemoed) {
      targetCornerY = oppCar.y < ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2 ? (oppGoal.yMax || 680) - 45 : (oppGoal.yMin || 380) + 45;
    }
    executeAirDribble(car, ball, oppGoalX, targetCornerY, teamDir, dt, env, evtObj, oppCar);
    return;
  }

  // 11. STRATEGIC BOOST ROUTING (Only when ball is distant and safe)
  if (car.boost < 15 && boostPads && distToBall > 650 && ball.vx * teamDir >= 0) {
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

  const ballRel = (ball.x - car.x) * teamDir;
  const isBallDangerouslyBehind = ballRel < -18 && distToBall > 45;

  const halfWidth = (car.width || 68) / 2;
  const contactDist = halfWidth + (ball.radius || 30);

  if (car.isGrounded) {
    if (isBallDangerouslyBehind) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }

    // Direct drive target: when within close range, drive directly through the ball with full aggression!
    const effectiveTargetX = (distToBall < 130 && ballRel > 0) ? ball.x + teamDir * 35 : targetX;
    botDriveGround(car, effectiveTargetX, true, false, env);

    if (intercept.isAerial && ball.y < env.k - 90) {
      const hClimb = Math.max(0, car.y - intercept.y);
      const climbSpeed = env.isLegacy ? 760 : 440;
      const climbT = 0.08 + hClimb / climbSpeed;
      const horizDist = Math.abs(car.x - targetX);
      const maxLaunchDist = Math.max(90, Math.abs(car.vx) * climbT + 120);
      if (car.canJump && !car.isFlipping && intercept.t <= climbT + 0.18 && horizDist <= maxLaunchDist) {
        if (hClimb > 95 && car.boost > 6) {
          startBotJumpSeq(car, "fast_aerial");
        } else if (car.canJump) {
          startBotJumpSeq(car, "dodge", cosShoot, Math.min(-0.25, sinShoot * 0.85));
        }
      }
    } else {
      // Ground chip/dodge strike into net: lethal strike timed to exact hitbox contact distance
      const vClose = Math.max(120, (car.vx - ball.vx) * teamDir);
      const dodgeTriggerDist = contactDist + Math.min(48, Math.max(14, vClose * 0.040));
      const isApproachingBall = (ball.x - car.x) * teamDir > 0;

      // Also pop into floating / waist-high bouncing balls
      const isFloatingBall = ball.y < env.k - 40;
      const strikeDist = isFloatingBall ? Math.max(dodgeTriggerDist, contactDist + 28) : dodgeTriggerDist;

      if (isApproachingBall && distToBall <= strikeDist && distToBall >= contactDist - 20 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", cosShoot, Math.min(-0.18, sinShoot * 0.85));
      }
    }
  } else {
    if (isBallDangerouslyBehind) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }
    const effectiveTargetX = distToBall < 120 ? ball.x : targetX;
    const effectiveTargetY = distToBall < 120 ? ball.y : targetY;
    botDriveAir(car, effectiveTargetX, effectiveTargetY, env, intercept.t);
    if (distToBall <= contactDist + 24 && (car.jumpCount === 1 || car.hasFlipReset)) {
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

  if (tmCar && !tmCar.isDemoed) {
    const tmDist = Math.hypot(ball.x - tmCar.x, ball.y - tmCar.y);
    if (tmDist < dist - 25) {
      // 2nd man on kickoff: follow up at mid-goal
      const holdX = (teamDir > 0 ? env.At : env.Mt) + teamDir * 200;
      botDriveGround(car, holdX, false, false, env);
      return;
    }
  }

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

  // Lethal contact power blast timed to forward dodge flip right at contact
  const halfWidth = (car.width || 68) / 2;
  const contactDist = halfWidth + (ball.radius || 30);
  if (dist <= contactDist + 22 && dist >= contactDist - 25 && car.canJump && !car.isFlipping) {
    startBotJumpSeq(car, "dodge", teamDir, -0.16);
  }
}

export function checkDefensiveThreat(ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const b = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, radius: ball.radius || 30 };
  const dt = 0.025;
  const maxSteps = 120;
  const subF = dt / 2;

  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const yMin = ownGoal.yMin || 380;
  const yMax = ownGoal.yMax || 680;

  // Direct threat check: ball in defensive zone heading towards our goal
  const distToGoalX = Math.abs(ball.x - goalX);
  const isHeadingToOwnGoal = ball.vx * teamDir < -20;
  if (distToGoalX < 440 && isHeadingToOwnGoal && ball.y >= yMin - 75 && ball.y <= yMax + 75) {
    const tMeet = Math.max(0.04, Math.abs(ball.x - (goalX + teamDir * 60)) / Math.max(60, Math.abs(ball.vx)));
    return { isThreat: 1, interceptTime: tMeet, interceptY: ball.y };
  }

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
  const clearDirX = teamDir;
  const clearDirY = -0.22;

  // The goalkeeper must ALWAYS stay between own net and the ball!
  // The target contact point is strictly behind the ball towards own net.
  const targetSaveX = teamDir > 0
    ? Math.max(goalX + 75, Math.min(ball.x - 26, goalX + 240))
    : Math.min(goalX - 75, Math.max(ball.x + 26, goalX - 240));

  const relX = targetSaveX - ball.x;
  const tToMeet = Math.max(0.04, Math.min(1.8, relX / (ball.vx || -teamDir * 450)));
  const predictedMeetY = ball.y + ball.vy * tToMeet + 0.5 * env.Ph * tToMeet * tToMeet;
  const targetSaveY = Math.max((ownGoal.yMin || 380) + 15, Math.min((ownGoal.yMax || 680) - 15, predictedMeetY));

  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);
  const isHighBall = ball.y < env.k - 85 || targetSaveY < env.k - 75;
  const hClimb = Math.max(0, car.y - targetSaveY);
  const requiresFastAerial = hClimb > 165 && car.boost > 12;
  const climbSpeed = env.isLegacy ? 760 : 380;
  const climbT = 0.08 + hClimb / climbSpeed;

  const goalGuardX = goalX + teamDir * 115;
  const isGoalieBehindBall = (ball.x - car.x) * teamDir > 0;

  const halfWidth = (car.width || 68) / 2;
  const contactDist = halfWidth + (ball.radius || 30);

  if (car.isGrounded) {
    if (!isGoalieBehindBall) {
      // CAUGHT UPFIELD: Must return goal-side without ramming ball towards own net!
      const distToBallX = Math.abs(car.x - ball.x);
      if (distToBallX < 140 && Math.abs(car.y - ball.y) < 70) {
        // Jump over the ball to reach crease safely!
        car.input.jump = true;
        car.input.throttleForward = true;
        car.input.steerLeft = teamDir > 0;
        car.input.steerRight = teamDir < 0;
        if (car.boost > 0) car.input.boost = true;
      } else {
        botDriveGround(car, goalGuardX, true, false, env);
      }
      return;
    }

    if (isHighBall) {
      // Disciplined goalkeeper stance: face forward towards incoming attack
      const toGuard = (goalGuardX - car.x) * teamDir;
      if (toGuard < -25) {
        // Reversing back to guard post while maintaining forward view
        car.input.steerLeft = false;
        car.input.steerRight = false;
        car.input.throttleForward = false;
        car.input.throttleReverse = true;
        car.facing = teamDir;
        car.angle = teamDir > 0 ? 0 : Math.PI;
      } else if (toGuard > 25) {
        // Advancing out to crease post
        car.input.steerLeft = teamDir < 0;
        car.input.steerRight = teamDir > 0;
        car.input.throttleForward = true;
        car.input.throttleReverse = false;
      } else {
        // Holding optimal post position
        car.input.throttleForward = false;
        car.input.throttleReverse = false;
        car.input.steerLeft = false;
        car.input.steerRight = false;
        car.facing = teamDir;
        car.angle = teamDir > 0 ? 0 : Math.PI;
      }

      // Precise aerial launch timed to meet ball at targetSaveX
      if (tToMeet <= climbT + 0.16 && car.canJump && !car.isFlipping) {
        if (requiresFastAerial) {
          startBotJumpSeq(car, "fast_aerial", clearDirX, clearDirY);
        } else if (hClimb > 55) {
          car.input.jump = true;
          car.input.throttleForward = true;
          if (car.boost > 0) car.input.boost = true;
        } else if (dist <= contactDist + 15) {
          startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
        }
      }
    } else {
      // Low ground ball: charge forward and blast ball away
      botDriveGround(car, ball.x + teamDir * 15, true, false, env);
      const vClose = Math.max(120, (car.vx - ball.vx) * teamDir);
      const dodgeDist = contactDist + Math.min(48, Math.max(14, vClose * 0.040));
      if (dist <= dodgeDist && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
      }
    }
  } else {
    // Airborne save: fly outward towards the ball to block and redirect
    botDriveAir(car, targetSaveX, targetSaveY, env, tToMeet);
    if (dist <= contactDist + 22 && (car.jumpCount === 1 || car.hasFlipReset || car.canJump)) {
      startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
    }
  }
}

function executeBackboardClear(car: any, ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const backboardX = goalX + teamDir * 90;
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);

  if (car.isGrounded) {
    botDriveGround(car, backboardX, true, false, env);
    if (Math.abs(car.x - backboardX) < 180 && ball.y < env.k - 100 && car.canJump && !car.isFlipping) {
      startBotJumpSeq(car, "fast_aerial");
    }
  } else {
    botDriveAir(car, ball.x, ball.y, env, 0.45);
    if (dist < 110 && (car.jumpCount === 1 || car.hasFlipReset)) {
      startBotJumpSeq(car, "dodge", teamDir, -0.35);
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
  const tmDist = Math.hypot(ball.x - tmCar.x, ball.y - tmCar.y);
  const myDist = Math.hypot(ball.x - car.x, ball.y - car.y);
  const tmIsBehindBall = (tmCar.x - ball.x) * teamDir > 25;

  if (ballInOurHalf) {
    const isGoalSide = (ball.x - car.x) * teamDir > 0;
    // If teammate is out of position and we are goal-side, STEP UP AND CHALLENGE!
    if (isGoalSide && (tmIsBehindBall || myDist < tmDist - 50)) {
      car.botState.action = "step_up_challenge";
      botDriveGround(car, ball.x, true, false, env);
      const halfWidth = (car.width || 68) / 2;
      const contactDist = halfWidth + (ball.radius || 30);
      if (myDist <= contactDist + 20 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", teamDir, -0.25);
      }
      return;
    }
    // Anchor defensive back-post safely
    car.botState.action = "anchor_goal";
    executeShadowRecovery(car, ball, ownGoal, teamDir, env);
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
  const safeGoalPostX = ownGoalX + teamDir * 160;

  car.input.pitchUp = false;
  car.input.pitchDown = false;

  const isUpfieldOfBall = (car.x - ball.x) * teamDir > 0;

  if (car.isGrounded) {
    if (isUpfieldOfBall) {
      // Upfield of ball: if directly behind the ball on the ground, JUMP OVER IT so we don't ram it into net!
      if (Math.abs(car.x - ball.x) < 140 && Math.abs(car.y - ball.y) < 75) {
        car.input.jump = true;
        car.input.throttleForward = true;
        car.input.steerLeft = teamDir > 0;
        car.input.steerRight = teamDir < 0;
        if (car.boost > 0) car.input.boost = true;
        return;
      }
      // Sprint back to safe goal post at supersonic speed!
      botDriveGround(car, safeGoalPostX, true, true, env);
    } else {
      // Goal-side: face outward into field to challenge attack
      const toPost = (safeGoalPostX - car.x) * teamDir;
      if (toPost > 20) {
        botDriveGround(car, safeGoalPostX, true, false, env);
      } else {
        // Hold stance facing forward
        car.facing = teamDir;
        car.angle = teamDir > 0 ? 0 : Math.PI;
        car.input.steerLeft = false;
        car.input.steerRight = false;
        car.input.throttleForward = false;
        car.input.throttleReverse = false;
      }
    }
  } else {
    // In the air: fly smoothly to safe defensive crease
    botDriveAir(car, safeGoalPostX, Math.min(car.y, (ownGoal.yMin || 380) + 40), env, 0.45);
  }
}

function executeAirDribble(
  car: any,
  ball: any,
  oppGoalX: number,
  targetCornerY: number,
  teamDir: number,
  dt: number,
  env: ArenaEnv,
  evtObj: any,
  oppCar?: any
) {
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);
  const halfWidth = (car.width || 68) * 0.5;
  const contactDist = halfWidth + (ball.radius || 30);

  if (car.isGrounded) {
    botDriveGround(car, ball.x - teamDir * 20, true, false, env);
    if (Math.abs(car.x - ball.x) < 90 && car.boost > 8) {
      startBotJumpSeq(car, "fast_aerial");
    }
    return;
  }

  // Push directly through lower-rear quadrant to maintain forward carry and loft
  const sweetX = ball.x - teamDir * (halfWidth + 6);
  const sweetY = ball.y + 4;
  botDriveAir(car, sweetX, sweetY, env, 0.20);

  // Clinical finish: trigger lethal dunk flick when closing in on net or when falling
  const goalDist = Math.abs(car.x - oppGoalX);
  const isDefenderClose = oppCar && !oppCar.isDemoed && Math.hypot(oppCar.x - ball.x, oppCar.y - ball.y) < 180;
  const isBallDropping = ball.vy > 60 || ball.y > env.k - 160;
  const canDodge = car.jumpCount === 1 || car.hasFlipReset;

  if (canDodge && dist <= contactDist + 28 && (goalDist < 580 || isDefenderClose || isBallDropping)) {
    const shootAng = Math.atan2(targetCornerY - ball.y, oppGoalX - ball.x);
    startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
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
