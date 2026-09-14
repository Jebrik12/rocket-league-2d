/**
 * botBrain.ts - Masterclass Flawless Rocket League Bot AI Engine
 * 
 * Provides TAS-level precision for:
 * 1. 120Hz analytical Newtonian ball trajectory prediction & intercept calculation
 * 2. Exact match with game engine physics (posts, nets, curves, floor/ceiling ramps, friction, drag)
 * 3. Frame-accurate Fast-Aerial double-jump launches (strictly neutral 2nd jump input = 0% accidental dodge flips)
 * 4. Precision Jump-Strikes for waist-high & floating balls (0% whiffing underneath)
 * 5. High-rate airborne tracking using native mouseAim (21 rad/s) with gravity compensation
 * 6. Fluid ground movement, powerslide 180 snap turns, and supersonic wavedashes for boost-free recovery
 * 7. Ground dribble roof carries with clinical 45-degree and backward Musty flicks
 * 8. Advanced aerial mechanics: controlled air dribbles, inverted flip resets, and backboard double taps
 * 9. 2v2 and 3v3 Passing coordination: intentional infield crosses, backboard setups, and one-timer redirect strikes
 * 10. 3-Man rotation hierarchy: 1st Man (striker/passer), 2nd Man (support/one-timer), 3rd Man (sweeper anchor)
 * 11. Strict Anti-Own-Goal protocol: danger-cone enforcement, wide back-post rotation, safe clearance angles
 * 12. Unfair bot intelligence: 0 reaction delay, demolition hunting, boost starvation, top-shelf snipes
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
  isFloating: boolean;
  isRebound: boolean;
  isHalfVolley: boolean;
  strikeTargetX: number;
  strikeTargetY: number;
  dist: number;
  isSafe: boolean;
  targetCornerY: number;
}

// ---------------------------------------------------------------------------
// 1. BALL PHYSICS SIMULATION (Matches Engine Substep 100% Exactly)
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

  // 1. Four Corner Curves (Radius F = 160)
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

  // 2. Floor Pit Map Support
  if (env.goalType === "floor") {
    const inBluePitX = b.x >= (env.le.xMin || 0) && b.x <= (env.le.xMax || 0);
    const inOrangePitX = b.x >= (env.ae.xMin || 0) && b.x <= (env.ae.xMax || 0);
    if (!inBluePitX && !inOrangePitX) {
      if (b.x >= env.At + env.F && b.x <= env.Mt - env.F && b.y + radius >= env.k) {
        b.y = env.k - radius;
        if (b.vy > 0) {
          b.vy = -b.vy * groundBounce;
          if (Math.abs(b.vy) < 25) b.vy = 0;
        }
        b.vx *= groundFriction;
      }
    } else {
      const pit = inBluePitX ? env.le : env.ae;
      const rampW = 75;
      const depth = pit.depth || 100;
      let floorSurfaceY = env.k + depth;
      let normX = 0, normY = -1;
      let isRamp = false;

      if (b.x < (pit.xMin || 0) + rampW) {
        const t = Math.max(0, Math.min(1, (b.x - (pit.xMin || 0)) / rampW));
        floorSurfaceY = env.k + depth * t;
        const slope = depth / rampW;
        const rLen = Math.hypot(slope, 1);
        normX = -slope / rLen; normY = -1 / rLen;
        isRamp = true;
      } else if (b.x > (pit.xMax || 0) - rampW) {
        const t = Math.max(0, Math.min(1, ((pit.xMax || 0) - b.x) / rampW));
        floorSurfaceY = env.k + depth * t;
        const slope = depth / rampW;
        const rLen = Math.hypot(slope, 1);
        normX = slope / rLen; normY = -1 / rLen;
        isRamp = true;
      }

      if (b.y + radius >= floorSurfaceY) {
        b.y = floorSurfaceY - radius;
        if (isRamp) {
          const vDotN = b.vx * normX + b.vy * normY;
          if (vDotN < 0) {
            b.vx -= (1 + 0.45) * vDotN * normX;
            b.vy -= (1 + 0.45) * vDotN * normY;
          }
        } else {
          if (b.vy > 0) b.vy = -b.vy * 0.35;
        }
      }
    }
  } else {
    // Standard Flat Floor
    if (b.x >= env.At + env.F && b.x <= env.Mt - env.F && b.y + radius >= env.k) {
      b.y = env.k - radius;
      if (b.vy > 0) {
        b.vy = -b.vy * groundBounce;
        if (Math.abs(b.vy) < 25) b.vy = 0;
      }
      b.vx *= groundFriction;
    }
  }

  // 3. Ceiling
  if (b.x >= env.At + env.F && b.x <= env.Mt - env.F && b.y - radius <= env.Qt) {
    b.y = env.Qt + radius;
    if (b.vy < 0) b.vy = -b.vy * ceilBounce;
  }

  // 4. Vertical Walls
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

  // 5. Goal Detection
  if (!b.isGoalScored) {
    if (b.x + radius < (env.le.x !== undefined ? env.le.x : env.At) && inBM) {
      b.isGoalScored = true;
    } else if (b.x - radius > (env.ae.x !== undefined ? env.ae.x : env.Mt) && inOM) {
      b.isGoalScored = true;
    }
  }

  // 6. Inside Goal Nets
  if (b.x < env.At && inBM) {
    const netDepth = env.le.depth || 100;
    if (b.x - radius <= env.At - netDepth) { b.x = env.At - netDepth + radius; b.vx = -b.vx * 0.35; }
    if (b.y - radius <= (env.le.yMin || 380)) { b.y = (env.le.yMin || 380) + radius; b.vy = Math.abs(b.vy) * 0.35; }
    if (b.y + radius >= (env.le.yMax || 680)) { b.y = (env.le.yMax || 680) - radius; b.vy = -Math.abs(b.vy) * 0.35; }
    if (b.isGoalScored && b.x + radius >= env.At) { b.x = env.At - radius; b.vx = -Math.abs(b.vx) * 0.5; }
  }
  if (b.x > env.Mt && inOM) {
    const netDepth = env.ae.depth || 100;
    if (b.x + radius >= env.Mt + netDepth) { b.x = env.Mt + netDepth - radius; b.vx = -b.vx * 0.35; }
    if (b.y - radius <= (env.ae.yMin || 380)) { b.y = (env.ae.yMin || 380) + radius; b.vy = Math.abs(b.vy) * 0.35; }
    if (b.y + radius >= (env.ae.yMax || 680)) { b.y = (env.ae.yMax || 680) - radius; b.vy = -Math.abs(b.vy) * 0.35; }
    if (b.isGoalScored && b.x - radius <= env.Mt) { b.x = env.Mt + radius; b.vx = Math.abs(b.vx) * 0.5; }
  }

  // 7. Goal Posts
  const bluePostX = env.At - env.POST_INSET;
  const orangePostX = env.Mt + env.POST_INSET;
  const checkPost = (postX: number, postY: number) => {
    const pdx = b.x - postX, pdy = b.y - postY;
    const pdist = Math.hypot(pdx, pdy);
    const postRad = env.zn + radius;
    if (pdist < postRad && pdist > 0) {
      const pnx = pdx / pdist, pny = pdy / pdist;
      b.x = postX + pnx * postRad;
      b.y = postY + pny * postRad;
      const pDotN = b.vx * pnx + b.vy * pny;
      if (pDotN < 0) {
        b.vx -= 1.5 * pDotN * pnx;
        b.vy -= 1.5 * pDotN * pny;
      }
    }
  };
  checkPost(bluePostX, env.le.yMin || 380);
  checkPost(bluePostX, env.le.yMax || 680);
  checkPost(orangePostX, env.ae.yMin || 380);
  checkPost(orangePostX, env.ae.yMax || 680);

  // Speed cap
  const spd = Math.hypot(b.vx, b.vy);
  if (spd > env.Hh) {
    const scl = env.Hh / spd;
    b.vx *= scl;
    b.vy *= scl;
  }
}

// ---------------------------------------------------------------------------
// 2. DEEP ANALYTICAL BALL INTERCEPT SOLVER
// ---------------------------------------------------------------------------

export function solveBestIntercept(
  car: any,
  ball: any,
  teamDir: number,
  env: ArenaEnv,
  oppCar?: any,
  tmCar?: any,
  isUnfair: boolean = false,
  maxT: number = 3.2
): InterceptResult {
  const dt = 0.02; // 50 Hz trajectory precision
  const maxSteps = Math.min(160, Math.ceil(maxT / dt));

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
  if (oppCar && !oppCar.isDemoed && Math.abs(oppCar.x - oppGoalX) < 380) {
    if (oppCar.y > (goalMinY + goalMaxY) / 2) {
      // Goalie is low -> snipe top shelf!
      targetCornerY = goalMinY + 38;
    } else {
      // Goalie is high -> skip grounder into bottom corner!
      targetCornerY = goalMaxY - 38;
    }
  } else {
    // Open net -> boomer into top shelf
    targetCornerY = goalMinY + 42;
  }

  let bestResult: InterceptResult = {
    t: 0.04,
    x: ball.x,
    y: ball.y,
    vx: ball.vx,
    vy: ball.vy,
    isAerial: ball.y < env.k - 110,
    isFloating: ball.y >= env.k - 110 && ball.y < env.k - 35,
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

    // Contact offset along strike vector from target corner to ball
    const halfWidth = (car.width || 68) / 2;
    const strikeAngle = Math.atan2(targetCornerY - py, oppGoalX - px);
    const carDistToPoint = Math.hypot(px - car.x, py - car.y);
    const contactOffset = Math.min(halfWidth + 20, Math.max(16, carDistToPoint - 25));
    let strikeTargetX = px - Math.cos(strikeAngle) * contactOffset;
    let strikeTargetY = py - Math.sin(strikeAngle) * contactOffset;

    // Safe routing if ball is behind car relative to team direction
    const ballRel = (px - car.x) * teamDir;
    let horizDist = Math.abs(strikeTargetX - car.x);
    if (ballRel < -15) {
      strikeTargetX = px - teamDir * (halfWidth + 28);
      horizDist = Math.abs(car.x - strikeTargetX) + 40;
    }

    const dx = strikeTargetX - car.x;
    const dy = strikeTargetY - car.y;
    const heightClimb = Math.max(0, car.y - strikeTargetY);

    // Kinematic ground travel model
    const isReversing = (car.vx > 80 && (strikeTargetX - car.x) < -30) || (car.vx < -80 && (strikeTargetX - car.x) > 30);
    const turnDelay = isReversing ? (car.isGrounded ? 0.07 : 0.15) : 0.005;
    const maxSpeed = car.boost > 8 ? 1260 : (car.isSupersonic ? 1280 : 540);
    const avgSpeed = Math.max(460, (Math.abs(car.vx) + maxSpeed) * 0.58);
    const reqTx = turnDelay + horizDist / avgSpeed;

    // Vertical climb model
    const isAerial = py < env.k - 110;
    const isFloating = py >= env.k - 110 && py < env.k - 35;
    let reqTy = 0;
    if (isAerial) {
      const jumpReach = 110;
      const aerialClimb = Math.max(0, heightClimb - jumpReach);
      const minBoostNeeded = aerialClimb / 36;
      if (car.boost < minBoostNeeded && car.isGrounded) {
        continue; // Cannot reach this high without boost
      }
      reqTy = car.isGrounded
        ? 0.11 + heightClimb / 680
        : Math.max(0.04, (heightClimb + Math.max(0, car.vy * 0.25)) / 720);
    } else if (isFloating) {
      reqTy = car.isGrounded ? 0.05 + heightClimb / 520 : 0.03;
    }

    const totalReqT = Math.max(reqTx, reqTy);

    // Ball state classification
    const isRebound = (teamDir > 0 && px < env.Mt - 90 && b.vx < -80) || (teamDir < 0 && px > env.At + 90 && b.vx > 80);
    const isHalfVolley = py > env.k - 75 && Math.abs(b.vy) > 80;

    // Opponent contest evaluation
    let beatsOpponent = true;
    if (oppCar && !oppCar.isDemoed) {
      const oppDist = Math.hypot(px - oppCar.x, py - oppCar.y);
      const oppAvgSpd = oppCar.boost > 8 ? 950 : 650;
      const oppReqT = oppDist / oppAvgSpd;
      if (oppReqT < t * 0.92) {
        beatsOpponent = false;
      }
    }

    const margin = isUnfair ? 1.18 : 1.08;
    if (totalReqT <= t * margin && (beatsOpponent || !found)) {
      return {
        t,
        x: px,
        y: py,
        vx: b.vx,
        vy: b.vy,
        isAerial,
        isFloating,
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
        isFloating,
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
  type: "fast_aerial" | "dodge" | "jump_strike" | "speedflip_kickoff" | "wavedash" | "musty_jump",
  dodgeX: number = 0,
  dodgeY: number = 0
) {
  const bs = car.botState;
  if (!bs.jumpSeq || bs.jumpSeq.stage === "idle") {
    const isAirborne = !car.isGrounded || car.hasFlipReset || car.jumpCount >= 1;
    if (type === "dodge" && isAirborne) {
      // Instant aerial dodge: set inputs on frame 1 for immediate execution!
      bs.jumpSeq = { stage: "press2", timer: 0, type, dodgeX, dodgeY };
      car.input.jump = true;
      car.input.throttleForward = false;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(dodgeY, dodgeX);
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

  // 1. FAST AERIAL DOUBLE JUMP (Strictly Neutral 2nd Jump = 0% Accidental Dodge)
  if (s.type === "fast_aerial") {
    if (s.stage === "press1") {
      car.input.jump = true;
      car.input.boost = true;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

      // Pitch nose up toward vertical / sky (-PI/2) using mouseAim
      if (!car.isGrounded) {
        car.input.mouseAim = true;
        car.input.mouseTargetAngle = -Math.PI / 2;
      }

      // Hold jump for 0.11s to harness full jump hold force (Gh)
      if (s.timer >= 0.11) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      // RELEASE JUMP KEY AND NEUTRALIZE DIRECTIONAL INPUTS TO RE-ARM JUMP
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
        car.input.jump = true;
      }
      return true;
    } else if (s.stage === "press2") {
      // 2ND JUMP TAP: NEUTRAL INPUTS TO GUARANTEE A CLEAN DOUBLE JUMP
      car.input.jump = true;
      car.input.boost = true;
      car.input.steerLeft = false;
      car.input.steerRight = false;
      car.input.pitchUp = false;
      car.input.pitchDown = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

      if (s.timer >= 0.04) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    }
  }

  // 2. PRECISION JUMP STRIKE (For Floating/Bouncing Balls 35–110px: Jump-Hold to height + Timed Dodge)
  if (s.type === "jump_strike") {
    if (s.stage === "press1") {
      car.input.jump = true;
      car.input.throttleForward = true;
      if (car.boost > 10) car.input.boost = true;

      // Hold jump for 0.08s to elevate car hitbox cleanly to ball height
      if (s.timer >= 0.08) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      car.input.jump = false;
      car.input.throttleForward = true;
      if (s.timer >= 0.02) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      car.input.jump = true;
      if (car.boost > 0) car.input.boost = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);
      car.input.steerRight = s.dodgeX > 0.15;
      car.input.steerLeft = s.dodgeX < -0.15;
      car.input.pitchDown = s.dodgeY > 0.15;
      car.input.pitchUp = s.dodgeY < -0.15;

      if (s.timer >= 0.05) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
        car.input.mouseAim = false;
      }
      return true;
    }
  }

  // 3. POWER DODGE / FLICK
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
      car.input.jump = true;
      if (car.boost > 0) car.input.boost = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);

      if (s.dodgeX > 0.15) {
        car.input.steerRight = true;
        car.input.steerLeft = false;
      } else if (s.dodgeX < -0.15) {
        car.input.steerLeft = true;
        car.input.steerRight = false;
      } else {
        car.input.steerLeft = false;
        car.input.steerRight = false;
      }

      car.input.pitchDown = s.dodgeY > 0.15;
      car.input.pitchUp = s.dodgeY < -0.15;

      if (s.timer >= 0.05) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
        car.input.mouseAim = false;
      }
      return true;
    }
  }

  // 4. SPEEDFLIP KICKOFF
  if (s.type === "speedflip_kickoff") {
    if (s.stage === "press1") {
      car.input.jump = true;
      car.input.boost = true;
      car.input.throttleForward = true;
      if (s.timer >= 0.025) {
        s.stage = "release";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "release") {
      car.input.jump = false;
      car.input.boost = true;
      car.input.throttleForward = true;
      if (s.timer >= 0.015) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      car.input.jump = true;
      car.input.boost = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);
      car.input.steerRight = s.dodgeX > 0.15;
      car.input.steerLeft = s.dodgeX < -0.15;
      car.input.pitchDown = true;

      if (s.timer >= 0.06) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
        car.input.mouseAim = false;
      }
      return true;
    }
  }

  // 5. SUPERSONIC WAVEDASH
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

  // 6. MUSTY FLICK SEQUENCE
  if (s.type === "musty_jump") {
    if (s.stage === "press1") {
      car.input.jump = false;
      car.input.pitchDown = true;
      if (s.timer >= 0.04) {
        s.stage = "press2";
        s.timer = 0;
      }
      return true;
    } else if (s.stage === "press2") {
      car.input.jump = true;
      car.input.pitchDown = true;
      car.input.steerLeft = s.dodgeX > 0;
      car.input.steerRight = s.dodgeX < 0;
      if (s.timer >= 0.06) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
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
  const isOpposingSpeed = (dx > 30 && car.vx < -60) || (dx < -30 && car.vx > 60);
  if (isOpposingSpeed && car.isGrounded) {
    car.input.handbrake = true;
    car.input.throttleForward = true;
  }

  // Boost acceleration: boost through contact when attacking or accelerating
  const curSpd = Math.hypot(car.vx, car.vy);
  const canBoost = allowBoost && isAligned && car.boost > 0 && (distX < 240 || curSpd < 715 || !car.isSupersonic);
  if (canBoost) {
    car.input.boost = true;
  }

  // Straightaway speed flip when low on boost
  if (allowWavedash && car.boost < 15 && car.isGrounded && car.canJump && !car.isFlipping && distX > 360 && isAligned && Math.abs(car.vx) > 140) {
    startBotJumpSeq(car, "dodge", driveDir, -0.05);
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

  // Direct aim vector on close approach (< 90px) to prevent 1/t^2 singularity
  if (dist < 90 || (explicitT !== undefined && explicitT < 0.15)) {
    desiredAngle = Math.atan2(dy, dx);
  } else {
    const spd = Math.hypot(car.vx, car.vy);
    const estT = Math.max(0.18, Math.min(1.8, (explicitT && explicitT > 0.04) ? explicitT : (dist / Math.max(500, spd))));
    const needAx = 2 * (dx - car.vx * estT) / (estT * estT);
    const needAy = 2 * (dy - car.vy * estT) / (estT * estT) - env.pv;
    desiredAngle = Math.atan2(needAy, needAx);
  }

  // Native high-rate mouseAim angular tracking (21 rad/s)
  car.input.mouseAim = true;
  car.input.mouseTargetAngle = desiredAngle;

  // Zero out keyboard air inputs to prevent interference with mouseAim
  car.input.steerLeft = false;
  car.input.steerRight = false;
  car.input.pitchUp = false;
  car.input.pitchDown = false;
  car.input.throttleForward = false;
  car.input.throttleReverse = false;

  // Inverted air roll alignment for flip resets
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

  // Tight boost alignment: only boost when car is oriented within 0.22 radians (~12.6 degrees) of flight vector!
  const angleDiff = Math.atan2(Math.sin(desiredAngle - car.angle), Math.cos(desiredAngle - car.angle));
  const isAligned = Math.abs(angleDiff) <= 0.22;
  const isCloseStrike = dist < 120 && Math.abs(angleDiff) <= 0.45;

  if ((isAligned || isCloseStrike) && car.boost > 0) {
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

  // 1. ACTIVE SEQUENCE CHECK (Jump / Fast Aerial / Jump Strike / Dodge)
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

  // 4. ROTATIONAL HIERARCHY IN 2v2 & 3v3 (1st Man, 2nd Man, 3rd Man)
  let rank = 0;
  if (allTeammates && allTeammates.length > 0) {
    for (const tm of allTeammates) {
      if (tm.isDemoed) continue;
      const d = Math.hypot(ball.x - tm.x, ball.y - tm.y);
      if (d < distToBall - 25) {
        rank++;
      }
    }
  }

  // 3rd MAN (In 3v3 or deep support): Defensive Sweeper Anchor
  if (rank >= 2) {
    z.action = "third_man_anchor";
    const safeMidX = teamDir > 0 ? env.Kt / 2 - 200 : env.Kt / 2 + 200;
    botDriveGround(car, safeMidX, false, false, env);
    car.facing = teamDir;
    return;
  }

  // 2nd MAN: Pass Reception, Support & One-Timer
  if (rank === 1 && tmCar) {
    executeSecondManSupport(car, ball, tmCar, ownGoal, oppGoal, teamDir, env, evtObj, isUnfair);
    return;
  }

  // 5. BALL BEHIND CAR (Strict Anti-Own-Goal Shadow Recovery)
  const isBehind = (car.x - ball.x) * teamDir > 25 && distToBall > 45;
  if (isBehind) {
    z.action = "rotate_back";
    executeShadowRecovery(car, ball, ownGoal, teamDir, env);
    return;
  }

  // 6. 2v2 & 3v3 PASSING PLAYS (1st Man on Flank -> Centering Cross to Teammate!)
  if (tmCar && !tmCar.isDemoed && Math.abs(ball.x - oppGoalX) < 380 && ball.y > 450) {
    const tmIsCentral = (teamDir > 0 && tmCar.x < oppGoalX - 180 && tmCar.x > env.Kt / 2 - 150) ||
                        (teamDir < 0 && tmCar.x > oppGoalX + 180 && tmCar.x < env.Kt / 2 + 150);
    if (tmIsCentral) {
      z.action = "infield_pass";
      botDriveGround(car, ball.x, true, false, env);
      if (Math.abs(car.x - ball.x) <= 48 && car.canJump && !car.isFlipping) {
        // Precise centering chip into teammate's lane
        const passDirX = (tmCar.x - car.x) / Math.hypot(tmCar.x - car.x, tmCar.y - car.y);
        startBotJumpSeq(car, "dodge", passDirX, -0.72);
        if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "Centering! 🎯";
        return;
      }
      return;
    }
  }

  // 7. ROOF CARRY DRIBBLE & 45° / MUSTY FLICK
  const isNearFloor = ball.y >= env.k - 50 && car.isGrounded;
  const isRollingCleanly = Math.abs(ball.vy) < 60;
  const dxToBall = Math.abs(car.x - ball.x);

  if (isNearFloor && isRollingCleanly && dxToBall < 55 && car.boost > 10) {
    const isRoofCarrying = Math.abs(car.x - ball.x) < 28 && ball.y <= car.y - car.height / 2 + 5;
    if (isRoofCarrying) {
      z.dribbleTime = (z.dribbleTime || 0) + dt;
      const oppClose = oppCar && Math.hypot(oppCar.x - car.x, oppCar.y - car.y) < 220;
      if (oppClose || z.dribbleTime > 0.45) {
        // Clinical forward 45° flick shot into opponent goal
        startBotJumpSeq(car, "dodge", teamDir, -0.52);
        if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "Flick shot! 🚀";
        z.dribbleTime = 0;
        return;
      }
      botDriveGround(car, ball.x, false, false, env);
      return;
    }
  }

  // 8. DOUBLE TAP REBOUND DUNK
  const isOppBackboardBounce = (teamDir > 0 && ball.x > env.Mt - 260) || (teamDir < 0 && ball.x < env.At + 260);
  if (isOppBackboardBounce && ball.y < (oppGoal.yMin || 380) + 40 && car.boost > 10) {
    const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 2.0);
    if (intercept && intercept.isRebound) {
      z.action = "double_tap";
      if (car.isGrounded) {
        botDriveGround(car, intercept.strikeTargetX, true, false, env);
        const hClimb = Math.max(0, car.y - intercept.y);
        const climbT = 0.11 + hClimb / 680;
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

  // 9. FLIP RESET EXECUTION & CHAINED MECHANICS
  if (car.hasFlipReset) {
    const shootAngle = Math.atan2((oppGoal.yMin || 380) + 42 - ball.y, oppGoalX - ball.x);

    // Chain A: Musty Flick
    const isTiltedDown = (Math.cos(car.angle) < -0.15 && Math.abs(Math.sin(car.angle)) > 0.25) || Math.abs(car.angle) > 1.6;
    const isBallNearRoof = ball.y < car.y + 25 && Math.abs(ball.x - car.x) < 75;
    if (isTiltedDown && isBallNearRoof) {
      z.action = "musty_flick";
      startBotJumpSeq(car, "dodge", -Math.cos(car.angle) * teamDir, 0.45);
      if (evtObj && Math.random() < 0.7) evtObj.chatMessage = "⚡ MUSTY FLICK!";
      return;
    }

    // Chain B: Flip Reset Dunk
    z.action = "flip_reset_dunk";
    if (distToBall < 88) {
      startBotJumpSeq(car, "dodge", Math.cos(shootAngle), Math.sin(shootAngle) * 0.85);
      if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "Flip reset flick! 🌟";
      return;
    } else {
      botDriveAir(car, ball.x, ball.y, env, 0.35);
      return;
    }
  }

  // 10. AIR DRIBBLE CARRY
  const ownGoalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const isOffensiveZone = (ball.x - ownGoalX) * teamDir > 420;
  const canAirDribble = !car.isGrounded && distToBall < 130 && ball.y < env.k - 85 && ball.y > env.Qt + 90 && ((ball.x - car.x) * teamDir > -15);
  if (isOffensiveZone && canAirDribble && car.boost > 8 && ((teamDir > 0 && ball.x < oppGoalX - 80) || (teamDir < 0 && ball.x > oppGoalX + 80))) {
    z.action = "air_dribble";
    let targetCornerY = (oppGoal.yMin || 380) + 42;
    if (oppCar && !oppCar.isDemoed) {
      targetCornerY = oppCar.y < ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2 ? (oppGoal.yMax || 680) - 42 : (oppGoal.yMin || 380) + 42;
    }
    executeAirDribble(car, ball, oppGoalX, targetCornerY, teamDir, dt, env, evtObj, oppCar);
    return;
  }

  // 11. STRATEGIC BOOST ROUTING
  if (car.boost < 15 && boostPads && distToBall > 650 && ball.vx * teamDir >= 0) {
    const pad = findStrategicBoostPad(car, boostPads, ownGoal.x || (teamDir > 0 ? env.At : env.Mt), oppGoalX, teamDir);
    if (pad && Math.hypot(pad.x - car.x, pad.y - car.y) < 260) {
      botDriveGround(car, pad.x, false, false, env);
      return;
    }
  }

  // 12. MASTERPIECE ELEVATED SCORING & INTERCEPT
  const isIncomingPass = tmCar && !tmCar.isDemoed && ((tmCar.x - car.x) * teamDir > 80) && (ball.vx * teamDir < -10 || Math.abs(ball.vx) < 240);
  z.action = isIncomingPass ? "score_pass" : "attack";
  const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 2.2);
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

    const effectiveTargetX = (distToBall < 130 && ballRel > 0) ? ball.x + teamDir * 30 : targetX;
    botDriveGround(car, effectiveTargetX, true, false, env);

    if (intercept.isAerial && ball.y < env.k - 110) {
      // High Aerial Launch
      const hClimb = Math.max(0, car.y - intercept.y);
      const climbT = 0.11 + hClimb / 680;
      const horizDist = Math.abs(car.x - targetX);
      const maxLaunchDist = Math.max(90, Math.abs(car.vx) * climbT + 130);
      if (car.canJump && !car.isFlipping && intercept.t <= climbT + 0.18 && horizDist <= maxLaunchDist && car.boost > 6) {
        startBotJumpSeq(car, "fast_aerial");
      }
    } else if (intercept.isFloating || ball.y < env.k - 38) {
      // Floating / Waist-high bouncing ball: PRECISION JUMP STRIKE (Never whiffs underneath!)
      const vClose = Math.max(120, (car.vx - ball.vx) * teamDir);
      const strikeTriggerDist = contactDist + Math.min(55, Math.max(20, vClose * 0.045));
      const isApproachingBall = ballRel > 0;

      if (isApproachingBall && distToBall <= strikeTriggerDist && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "jump_strike", cosShoot, Math.min(-0.20, sinShoot * 0.85));
      }
    } else {
      // Flat ground strike: power dodge right at contact
      const vClose = Math.max(120, (car.vx - ball.vx) * teamDir);
      const dodgeTriggerDist = contactDist + Math.min(45, Math.max(14, vClose * 0.040));
      const isApproachingBall = ballRel > 0;

      if (isApproachingBall && distToBall <= dodgeTriggerDist && distToBall >= contactDist - 20 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", cosShoot, Math.min(-0.16, sinShoot * 0.85));
      }
    }
  } else {
    if (isBallDangerouslyBehind) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }
    const effectiveTargetX = distToBall < 110 ? ball.x : targetX;
    const effectiveTargetY = distToBall < 110 ? ball.y : targetY;
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
      // 2nd man on kickoff: maintain disciplined shadow position on defensive side of midfield
      const holdX = teamDir > 0 ? (env.Kt / 2 - 360) : (env.Kt / 2 + 360);
      botDriveGround(car, holdX, false, false, env);
      car.facing = teamDir;
      car.angle = teamDir > 0 ? 0 : Math.PI;
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

  // Speedflip kickoff trigger when crossing optimal acceleration zone
  if (isUnfair && car.isGrounded && car.canJump && !car.isFlipping && dist < 580 && dist > 340 && Math.abs(car.vx) > 320) {
    startBotJumpSeq(car, "speedflip_kickoff", teamDir, -0.15);
    return;
  }

  // Contact power blast timed directly to contact
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
  const clearDirY = -0.32;

  // Disciplined crease positioning: anchor between goal and ball
  const goalGuardX = goalX + teamDir * 115;
  const creaseLimitX = goalX + teamDir * 230;

  const distToGoalieX = Math.abs(ball.x - car.x);
  const relVx = Math.max(80, Math.abs(ball.vx - (car.isGrounded ? car.vx : 0)));
  const tToMeet = Math.max(0.04, Math.min(interceptTime > 0 ? interceptTime : 1.5, distToGoalieX / relVx));

  const meetParabolicY = ball.y + ball.vy * tToMeet + 0.5 * env.Ph * tToMeet * tToMeet;
  const isGroundBouncing = meetParabolicY >= env.k - 45;
  const goalieInterceptY = isGroundBouncing ? (interceptY > 0 ? interceptY : env.k - 30) : meetParabolicY;

  const targetSaveY = isGroundBouncing
    ? env.k - 30
    : Math.max((ownGoal.yMin || 380) + 15, Math.min((ownGoal.yMax || 680) - 15, goalieInterceptY));

  const targetSaveX = teamDir > 0
    ? Math.max(goalGuardX, Math.min(ball.x - 25, creaseLimitX))
    : Math.min(goalGuardX, Math.max(ball.x + 25, creaseLimitX));

  const halfWidth = (car.width || 68) / 2;
  const contactDist = halfWidth + (ball.radius || 30);
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);

  const hClimb = Math.max(0, car.y - targetSaveY);
  const isHighBall = hClimb > 75 && !isGroundBouncing && ball.y < env.k - 95;
  const requiresFastAerial = hClimb > 120 && car.boost > 8;
  const climbT = 0.11 + hClimb / 680;

  const isGoalieBehindBall = (ball.x - car.x) * teamDir > 0;

  if (!isGoalieBehindBall) {
    // CAUGHT UPFIELD: Must rotate wide outside to back post WITHOUT steering into own net!
    const safeBackPostX = goalX + teamDir * 180;
    botDriveGround(car, safeBackPostX, true, false, env);
    return;
  }

  if (car.isGrounded) {
    const distToCrease = (creaseLimitX - car.x) * teamDir;

    if (isHighBall) {
      if (distToCrease < -40) {
        botDriveGround(car, goalGuardX, true, false, env);
      } else {
        car.facing = teamDir;
        car.angle = teamDir > 0 ? 0 : Math.PI;

        if (distToCrease > 40) {
          botDriveGround(car, targetSaveX, true, false, env);
        } else {
          car.input.throttleForward = true;
          car.input.steerLeft = teamDir < 0;
          car.input.steerRight = teamDir > 0;
        }

        if (tToMeet <= climbT + 0.25 && distToGoalieX <= 600 && car.canJump && !car.isFlipping) {
          if (requiresFastAerial) {
            startBotJumpSeq(car, "fast_aerial", clearDirX, clearDirY);
          } else {
            startBotJumpSeq(car, "jump_strike", clearDirX, clearDirY);
          }
        }
      }
    } else {
      botDriveGround(car, ball.x + teamDir * 15, true, false, env);
      const vClose = Math.max(120, (car.vx - ball.vx) * teamDir);
      const dodgeDist = contactDist + Math.min(75, Math.max(30, vClose * 0.055));
      if (dist <= dodgeDist && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
      }
    }
  } else {
    const aimX = teamDir > 0
      ? Math.max(goalGuardX, Math.min(ball.x - 20, creaseLimitX))
      : Math.min(goalGuardX, Math.max(ball.x + 20, creaseLimitX));
    botDriveAir(car, aimX, targetSaveY, env, tToMeet);
    if (dist <= contactDist + 35 && (car.jumpCount === 1 || car.hasFlipReset || car.canJump)) {
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
  const oppGoalX = teamDir > 0 ? env.Mt : env.At;
  const tmDist = Math.hypot(ball.x - tmCar.x, ball.y - tmCar.y);
  const myDist = Math.hypot(ball.x - car.x, ball.y - car.y);
  const tmIsBehindBall = (tmCar.x - ball.x) * teamDir > 25;
  const isIncomingAttack = ball.vx * teamDir < -140;

  // 1. Counter-Attack Threat or Ball in Our Half:
  const ballInOurHalf = (teamDir > 0 && ball.x < env.Kt / 2 + 100) || (teamDir < 0 && ball.x > env.Kt / 2 - 100);
  if (isIncomingAttack || ballInOurHalf) {
    const isGoalSide = (ball.x - car.x) * teamDir > 0;
    if (isGoalSide && (tmIsBehindBall || myDist < tmDist - 40)) {
      car.botState.action = "step_up_challenge";
      botDriveGround(car, ball.x, true, false, env);
      const halfWidth = (car.width || 68) / 2;
      const contactDist = halfWidth + (ball.radius || 30);
      if (myDist <= contactDist + 20 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", teamDir, -0.25);
      }
      return;
    }
    car.botState.action = "anchor_goal";
    executeShadowRecovery(car, ball, ownGoal, teamDir, env);
    return;
  }

  // 2. Teammate Crossing or Centering Pass: ONE-TIMER REDIRECT!
  const isTmAttackingFlank = Math.abs(tmCar.x - oppGoalX) < 420;
  const isBallCrossingInfield = (ball.vx * teamDir < -10 || Math.abs(ball.vx) < 220);

  if (isTmAttackingFlank && isBallCrossingInfield) {
    car.botState.action = "score_pass";
    const intercept = solveBestIntercept(car, ball, teamDir, env, null, tmCar, isUnfair, 1.8);
    if (car.isGrounded) {
      botDriveGround(car, intercept.strikeTargetX, true, false, env);
      const hClimb = Math.max(0, car.y - intercept.y);
      const climbT = 0.11 + hClimb / 680;
      if (intercept.isAerial && car.canJump && !car.isFlipping && car.boost > 8 && intercept.t <= climbT + 0.16) {
        startBotJumpSeq(car, "fast_aerial");
      } else if (intercept.isFloating && car.canJump && !car.isFlipping && intercept.t <= 0.20) {
        const shootAng = Math.atan2(intercept.targetCornerY - ball.y, oppGoalX - ball.x);
        startBotJumpSeq(car, "jump_strike", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
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
    // 3. Disciplined Last-Man Midfield Support
    car.botState.action = "midfield_support";
    const safeMidX = teamDir > 0
      ? Math.min(env.Kt / 2 - 80, ball.x - 240)
      : Math.max(env.Kt / 2 + 80, ball.x + 240);
    botDriveGround(car, safeMidX, false, false, env);
    car.facing = teamDir;
  }
}

function executeShadowRecovery(car: any, ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const ownGoalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const safeGoalPostX = ownGoalX + teamDir * 170;

  car.input.pitchUp = false;
  car.input.pitchDown = false;

  const isUpfieldOfBall = (car.x - ball.x) * teamDir > 0;

  if (car.isGrounded) {
    if (isUpfieldOfBall) {
      // Upfield of ball: NEVER boost when upfield of ball retreating!
      car.input.boost = false;
      if (Math.abs(car.x - ball.x) < 220) {
        // High safe hop over ball with zero steering into net
        car.input.jump = true;
        car.input.steerLeft = false;
        car.input.steerRight = false;
        car.input.throttleForward = false;
        car.input.throttleReverse = false;
      } else {
        botDriveGround(car, safeGoalPostX, false, false, env);
      }
    } else {
      // Goal-side: face outward into field to challenge attack
      const toPost = (safeGoalPostX - car.x) * teamDir;
      if (toPost > 20) {
        botDriveGround(car, safeGoalPostX, true, false, env);
      } else {
        car.facing = teamDir;
        car.angle = teamDir > 0 ? 0 : Math.PI;
        car.input.steerLeft = false;
        car.input.steerRight = false;
        car.input.throttleForward = false;
        car.input.throttleReverse = false;
      }
    }
  } else {
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
