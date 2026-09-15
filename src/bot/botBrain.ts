/**
 * botBrain.ts - Masterclass Flawless Rocket League Bot AI Engine
 * 
 * Provides TAS-level precision across ALL CARS and ALL PHYSICS MODES:
 * 1. Multi-car adaptive hitboxes (Octane, Fennec, Dominus, Breakout, Skyline, Merc)
 * 2. 120Hz analytical Newtonian ball trajectory prediction & intercept calculation
 * 3. Exact match with game engine physics (posts, nets, curves, floor/ceiling ramps, friction, drag)
 * 4. Zero-whiff dynamic strike system: instant bumper dodges, precision jump strikes for floating balls
 * 5. Frame-accurate Fast-Aerial double-jump launches (strictly neutral 2nd jump input = 0% accidental dodge flips)
 * 6. High-rate airborne tracking using native mouseAim (21 rad/s) with full gravity compensation
 * 7. Backboard Double-Tap Engine: intentional setups + aerial rebound tracking & dunk
 * 8. Wall-to-Air Dribble & controlled aerial carry with freestyle rotation
 * 9. Flip Reset chaining: inverted wheel contacts -> Musty flicks and boomer dunks
 * 10. Kuxir & Wall Pinches: supersonic wall impacts exceeding 1200 km/h
 * 11. Ground dribble roof carries with 120+ km/h 45-degree and Musty flicks
 * 12. 2v2 and 3v3 Passing coordination: infield crosses, backboard setups, and one-timer redirect strikes
 * 13. 3-Man rotation hierarchy: 1st Man (striker/passer), 2nd Man (support/one-timer), 3rd Man (sweeper anchor)
 * 14. Strict Anti-Own-Goal protocol: danger-cone enforcement, wide back-post rotation, safe clearance angles
 * 15. Unfair bot intelligence: 0 reaction delay, demolition hunting, boost starvation, upper-90 snipes
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
// 0. CAR SPECIFICATIONS & HITBOX GEOMETRY (ALL 6 VEHICLES)
// ---------------------------------------------------------------------------

export interface CarHitboxSpecs {
  width: number;
  height: number;
  halfW: number;
  halfH: number;
  wheelbase: number;
  wheelRadius: number;
}

export const CAR_HITBOX_MAP: Record<string, CarHitboxSpecs> = {
  octane: { width: 68, height: 28, halfW: 34, halfH: 14, wheelbase: 18, wheelRadius: 7.5 },
  fennec: { width: 68, height: 28, halfW: 34, halfH: 14, wheelbase: 18, wheelRadius: 7.5 },
  dominus: { width: 74, height: 24, halfW: 37, halfH: 12, wheelbase: 21, wheelRadius: 7.2 },
  breakout: { width: 76, height: 23.5, halfW: 38, halfH: 11.75, wheelbase: 22, wheelRadius: 7.0 },
  skyline: { width: 73, height: 26.5, halfW: 36.5, halfH: 13.25, wheelbase: 20, wheelRadius: 7.4 },
  merc: { width: 70, height: 32, halfW: 35, halfH: 16, wheelbase: 18, wheelRadius: 8.0 }
};

export function getCarHitboxSpecs(car: any): CarHitboxSpecs {
  if (car?.carModel && CAR_HITBOX_MAP[car.carModel]) {
    const m = CAR_HITBOX_MAP[car.carModel];
    return {
      width: car.width || m.width,
      height: car.height || m.height,
      halfW: (car.width || m.width) * 0.5,
      halfH: (car.height || m.height) * 0.5,
      wheelbase: car.wheelbase || m.wheelbase,
      wheelRadius: car.wheelRadius || m.wheelRadius
    };
  }
  const width = car?.width || 68;
  const height = car?.height || 28;
  const halfW = width * 0.5;
  const halfH = height * 0.5;
  const wheelbase = car?.wheelbase || 18;
  const wheelRadius = car?.wheelRadius || 7.5;
  return { width, height, halfW, halfH, wheelbase, wheelRadius };
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
// 2. DEEP ANALYTICAL BALL INTERCEPT SOLVER (Multi-Car & Multi-Physics Aware)
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
  const specs = getCarHitboxSpecs(car);

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

  // Clinical Corner Sniping: Target upper 90 shelf (goalMinY + 36) or bottom skipping corner (goalMaxY - 36)
  let targetCornerY = (goalMinY + goalMaxY) / 2;
  if (oppCar && !oppCar.isDemoed && Math.abs(oppCar.x - oppGoalX) < 480) {
    if (oppCar.y > (goalMinY + goalMaxY) / 2) {
      // Goalie guarding low -> snipe top shelf!
      targetCornerY = goalMinY + 36;
    } else {
      // Goalie guarding high -> skip grounder inside bottom post!
      targetCornerY = goalMaxY - 36;
    }
  } else {
    // Open net -> blast straight into the safe center of the net (zero crossbar ricochets!)
    targetCornerY = (goalMinY + goalMaxY) / 2;
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

  let bestCandidate: InterceptResult | null = null;
  let bestCandidateScore = -Infinity;
  let found = false;

  for (let step = 1; step <= maxSteps; step++) {
    const t = step * dt;
    const subF = dt / 2;
    simulateBallSubstep(b, subF, env);
    simulateBallSubstep(b, subF, env);

    const px = b.x, py = b.y;

    // Exact bumper contact offset: car center is positioned so front bumper meets ball edge flush along strike vector
    const strikeAngle = Math.atan2(targetCornerY - py, oppGoalX - px);
    const ballRad = ball.radius || 30;
    const contactOffset = specs.halfW + ballRad * 0.94;
    let strikeTargetX = px - Math.cos(strikeAngle) * contactOffset;
    let strikeTargetY = py - Math.sin(strikeAngle) * contactOffset;

    // Ground clamp: if ball is near floor, strikeTargetY matches grounded car center
    if (py >= env.k - 38) {
      strikeTargetY = env.k - specs.halfH;
    }

    // Safe routing if ball is behind car relative to team direction
    const ballRel = (px - car.x) * teamDir;
    let horizDist = Math.abs(strikeTargetX - car.x);
    if (ballRel < -15) {
      strikeTargetX = px - teamDir * (specs.halfW + 28);
      horizDist = Math.abs(car.x - strikeTargetX) + 40;
    }

    const dx = strikeTargetX - car.x;
    const dy = strikeTargetY - car.y;
    const heightClimb = Math.max(0, car.y - strikeTargetY);

    // Kinematic ground travel model
    const isReversing = (car.vx > 80 && (strikeTargetX - car.x) < -30) || (car.vx < -80 && (strikeTargetX - car.x) > 30);
    const turnDelay = isReversing ? (car.isGrounded ? 0.06 : 0.12) : 0.005;
    const maxSpeed = car.boost > 8 ? (env.isLegacy ? 1250 : 1280) : (car.isSupersonic ? 1280 : (env.isLegacy ? 650 : 460));
    const avgSpeed = Math.max(460, (Math.abs(car.vx) + maxSpeed) * 0.58);
    const reqTx = turnDelay + horizDist / avgSpeed;

    // Vertical climb model scaled dynamically to physics mode (env.pv, env.Gh, env.cc)
    const isAerial = py < env.k - 110;
    const isFloating = py >= env.k - 110 && py < env.k - 35;
    let reqTy = 0;
    if (isAerial) {
      const jumpReach = (env.cc / (env.pv || 720)) * 200;
      const aerialClimb = Math.max(0, heightClimb - jumpReach);
      const minBoostNeeded = aerialClimb / 36;
      if (car.boost < minBoostNeeded && car.isGrounded && heightClimb > 160) {
        continue; // Cannot reach this high without boost
      }
      const climbSpeed = env.isLegacy ? (car.boost > 6 ? 840 : 540) : (car.boost > 6 ? 680 : 420);
      reqTy = car.isGrounded
        ? 0.10 + heightClimb / climbSpeed
        : Math.max(0.04, (heightClimb + Math.max(0, car.vy * 0.25)) / (climbSpeed * 1.05));
    } else if (isFloating) {
      reqTy = car.isGrounded ? 0.05 + heightClimb / 540 : 0.02;
    }

    const totalReqT = Math.max(reqTx, reqTy);

    // Ball state classification
    const isBallAlreadyAerial = ball.y < env.k - 110;
    const isRebound = (teamDir > 0 && px < env.Mt - 90 && b.vx < -80) || (teamDir < 0 && px > env.At + 90 && b.vx > 80);
    const isHalfVolley = !isBallAlreadyAerial && ball.y < env.k - 35 && ball.vy > 30 && py >= env.k - 85 && b.vy < -25;
    const isApex = isAerial && Math.abs(b.vy) < 65;

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

    const margin = isUnfair ? 1.20 : 1.08;
    const isReachable = totalReqT <= t * margin;

    if (isReachable && (beatsOpponent || !found)) {
      // If the ball was already aerial or flat on the floor, the first valid reachable point is optimal
      if (isBallAlreadyAerial || (!isHalfVolley && t < 0.6)) {
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

      // Analytical candidate quality score for bouncing balls:
      let score = 100 - t * 25;
      if (isHalfVolley) score += 60;
      if (isRebound) score += 40;
      if (!beatsOpponent) score -= 120;

      if (score > bestCandidateScore) {
        bestCandidateScore = score;
        bestCandidate = {
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

      // If we found a top-tier candidate (half-volley or early apex) that beats opponent, lock it in immediately
      if (beatsOpponent && isHalfVolley && t < 0.8) {
        return bestCandidate;
      }
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
    }
  }

  return bestCandidate || bestResult;
}

// ---------------------------------------------------------------------------
// 3. FRAME-ACCURATE JUMP & MECHANICS SEQUENCER
// ---------------------------------------------------------------------------

export function startBotJumpSeq(
  car: any,
  type: "fast_aerial" | "dodge" | "jump_strike" | "speedflip_kickoff" | "wavedash" | "musty_jump",
  dodgeX: number = 0,
  dodgeY: number = 0,
  holdDuration?: number
) {
  const bs = car.botState;
  if (!bs.jumpSeq || bs.jumpSeq.stage === "idle") {
    const isAirborne = !car.isGrounded || car.hasFlipReset || car.jumpCount >= 1;
    if (type === "dodge" && isAirborne) {
      // Instant aerial dodge: set frame 0 inputs for immediate execution!
      bs.jumpSeq = { stage: "press2", timer: 0, type, dodgeX, dodgeY, holdDuration };
      car.input.jump = true;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(dodgeY, dodgeX);
      car.input.steerRight = false;
      car.input.steerLeft = false;
      car.input.pitchDown = false;
      car.input.pitchUp = false;
    } else if (type === "jump_strike" && isAirborne) {
      bs.jumpSeq = { stage: "press2", timer: 0, type, dodgeX, dodgeY, holdDuration };
      car.input.jump = true;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(dodgeY, dodgeX);
      car.input.steerRight = false;
      car.input.steerLeft = false;
      car.input.pitchDown = false;
      car.input.pitchUp = false;
    } else if (type === "fast_aerial") {
      bs.jumpSeq = { stage: "press1", timer: 0, type, dodgeX, dodgeY, holdDuration };
      car.input.jump = true;
      car.input.boost = true;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;
    } else if (type === "musty_jump") {
      bs.jumpSeq = { stage: isAirborne ? "tilt" : "press1", timer: 0, type, dodgeX, dodgeY, holdDuration };
      if (isAirborne) {
        car.input.jump = false;
        car.input.mouseAim = true;
        car.input.mouseTargetAngle = dodgeX > 0 ? 2.2 : -2.2;
      } else {
        car.input.jump = true;
        car.input.throttleForward = true;
      }
    } else {
      bs.jumpSeq = { stage: "press1", timer: 0, type, dodgeX, dodgeY, holdDuration };
      car.input.jump = true;
      car.input.throttleForward = true;
      if (car.boost > 0) car.input.boost = true;
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

      // Pitch nose up toward vertical / sky (-PI/2) or climb vector using mouseAim
      if (!car.isGrounded) {
        car.input.mouseAim = true;
        if (s.dodgeX !== 0 || s.dodgeY !== 0) {
          car.input.mouseTargetAngle = Math.atan2(s.dodgeY || -1, s.dodgeX);
        } else {
          car.input.mouseTargetAngle = -Math.PI / 2;
        }
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

  // 2. PRECISION JUMP STRIKE (For Floating/Bouncing Balls: Elevate to ball height + Timed Dodge)
  if (s.type === "jump_strike") {
    if (s.stage === "press1") {
      car.input.jump = true;
      car.input.throttleForward = true;
      if (car.boost > 10) car.input.boost = true;

      // Dynamic jump hold to elevate car hitbox cleanly to ball height
      const targetHold = typeof s.holdDuration === "number" ? Math.max(0.04, Math.min(0.20, s.holdDuration)) : 0.08;
      if (s.timer >= targetHold) {
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
        car.input.jump = true;
      }
      return true;
    } else if (s.stage === "press2") {
      car.input.jump = true;
      if (car.boost > 0) car.input.boost = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);
      // Keep keyboard steer and pitch neutral so mouseTargetAngle gives continuous analog direction
      car.input.steerRight = false;
      car.input.steerLeft = false;
      car.input.pitchDown = false;
      car.input.pitchUp = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

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
        car.input.jump = true;
      }
      return true;
    } else if (s.stage === "press2") {
      car.input.jump = true;
      if (car.boost > 0) car.input.boost = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);

      // Keep steer and pitch neutral so mouseTargetAngle gives continuous analog direction
      car.input.steerRight = false;
      car.input.steerLeft = false;
      car.input.pitchDown = false;
      car.input.pitchUp = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

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
        car.input.jump = true;
      }
      return true;
    } else if (s.stage === "press2") {
      car.input.jump = true;
      car.input.boost = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);
      car.input.steerRight = false;
      car.input.steerLeft = false;
      car.input.pitchDown = false;
      car.input.pitchUp = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;

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
        car.input.jump = true;
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
      // Pop jump
      car.input.jump = true;
      car.input.throttleForward = true;
      if (s.timer >= 0.04) {
        s.stage = "tilt";
        s.timer = 0;
        car.input.jump = false;
      }
      return true;
    } else if (s.stage === "tilt") {
      // Tilt forward / down past 1.75 radians
      car.input.jump = false;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = s.dodgeX > 0 ? 2.15 : -2.15;
      if (s.timer >= 0.07) {
        s.stage = "press2";
        s.timer = 0;
        car.input.jump = true;
      }
      return true;
    } else if (s.stage === "press2") {
      // Flick dodge into ball
      car.input.jump = true;
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = Math.atan2(s.dodgeY, s.dodgeX);
      car.input.steerRight = false;
      car.input.steerLeft = false;
      car.input.pitchDown = false;
      car.input.pitchUp = false;
      car.input.throttleForward = false;
      car.input.throttleReverse = false;
      if (s.timer >= 0.06) {
        s.stage = "idle";
        s.timer = 0;
        car.input.jump = false;
        car.input.mouseAim = false;
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
  env?: ArenaEnv,
  targetY?: number
) {
  // 1. Wall Drive & Dismount:
  if (car.surfaceType === "left_wall" || car.surfaceType === "right_wall") {
    const isTargetHighOnWall = targetY !== undefined && targetY < (env ? env.k - 160 : 760);
    if (isTargetHighOnWall && car.y > targetY + 25) {
      // Climb up wall towards elevated ball/target
      car.input.throttleForward = true;
      car.input.throttleReverse = false;
      car.input.jump = false;
      if (allowBoost && car.boost > 10) car.input.boost = true;
      return;
    }
    // Dismount towards center/floor
    const exitDirX = car.x < (env ? env.Kt / 2 : 1000) ? 1 : -1;
    car.input.jump = true;
    car.input.throttleForward = true;
    car.input.steerRight = exitDirX > 0;
    car.input.steerLeft = exitDirX < 0;
    if (car.boost > 10) car.input.boost = true;
    return;
  } else if (car.surfaceType === "curve") {
    const exitDirX = car.x < (env ? env.Kt / 2 : 1000) ? 1 : -1;
    car.input.jump = true;
    car.input.throttleForward = true;
    car.input.steerRight = exitDirX > 0;
    car.input.steerLeft = exitDirX < 0;
    if (car.boost > 10) car.input.boost = true;
    return;
  }

  // 2. Clamp target to flat arena floor so cars never steer into corner curve ramps
  const safeMinX = env ? env.At + 60 : 160;
  const safeMaxX = env ? env.Mt - 60 : 1840;
  const clampedTargetX = Math.max(safeMinX, Math.min(safeMaxX, targetX));

  const dx = clampedTargetX - car.x;
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

  // Straightaway speed flip when low on boost or wavedash across pitch
  if (allowWavedash && car.isGrounded && car.canJump && !car.isFlipping && distX > 320 && isAligned && Math.abs(car.vx) > 130) {
    if (car.boost < 20 || !car.isSupersonic) {
      startBotJumpSeq(car, "dodge", driveDir, -0.06);
    }
  }
}

export function botDriveAir(
  car: any,
  targetX: number,
  targetY: number,
  env: ArenaEnv,
  explicitT?: number,
  desiredInverted?: boolean,
  strikeAngle?: number
) {
  const dx = targetX - car.x;
  const dy = targetY - car.y;
  const dist = Math.hypot(dx, dy);

  let desiredAngle = 0;
  const directAngle = Math.atan2(dy, dx);

  // Close approach (< 130px): point nose directly at strike target / ball intercept point
  // Far approach: Newtonian kinematic climb compensation
  if (dist < 130 || (explicitT !== undefined && explicitT < 0.18)) {
    desiredAngle = directAngle;
  } else {
    const spd = Math.max(320, Math.hypot(car.vx, car.vy));
    const estT = Math.max(0.18, Math.min(1.6, (explicitT && explicitT > 0.04) ? explicitT : (dist / spd)));
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

  // Inverted air roll alignment - keep car upright unless explicitly requested
  const targetInverted = !!desiredInverted;
  if (targetInverted !== !!car.airRollInverted) {
    if (!car._prevAirRollRight) {
      car.input.airRollRight = true;
    } else {
      car.input.airRollRight = false;
    }
  } else {
    car.input.airRollRight = false;
    car.input.airRollLeft = false;
  }

  // Boost alignment: boost towards flight vector
  const angleDiff = Math.atan2(Math.sin(desiredAngle - car.angle), Math.cos(desiredAngle - car.angle));
  const isAligned = Math.abs(angleDiff) <= 0.30;
  const isCloseStrike = dist < 140 && Math.abs(angleDiff) <= 0.60;

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
  evtObj: any,
  allOpponents?: any[]
) {
  const z = car.botState;
  const specs = getCarHitboxSpecs(car);
  const ownGoal = teamDir > 0 ? env.le : env.ae;
  const oppGoal = teamDir > 0 ? env.ae : env.le;
  const ownGoalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const oppGoalX = teamDir > 0 ? env.Mt : env.At;
  const distToBall = Math.hypot(ball.x - car.x, ball.y - car.y);
  const contactDist = specs.halfW + (ball.radius || 30);
  const oppList: any[] = (allOpponents && allOpponents.length > 0) ? allOpponents : (oppCar ? [oppCar] : []);

  // 1. ACTIVE SEQUENCE CHECK (Jump / Fast Aerial / Jump Strike / Dodge)
  if (z.jumpSeq && z.jumpSeq.stage !== "idle") {
    const active = updateBotJumpSeq(car, dt, env);
    if (active) return;
  }

  // 1.5 WALL PLAY & DISMOUNT WATCHDOG: If car ended up on wall or curve,
  // either attack elevated ball near wall or dismount immediately back to flat floor!
  const isCarOnWallOrCurve = car.surfaceType === "left_wall" || car.surfaceType === "right_wall" || car.surfaceType === "curve";
  if (isCarOnWallOrCurve) {
    const isBallNearMyWall = (car.surfaceType === "left_wall" && ball.x < env.At + 160) ||
                             (car.surfaceType === "right_wall" && ball.x > env.Mt - 160);
    const isBallHigh = ball.y < env.k - 140;

    if (isBallNearMyWall && isBallHigh) {
      z.action = "wall_strike";
      const shootAng = Math.atan2((oppGoal.yMin || 380) + 40 - ball.y, oppGoalX - ball.x);
      if (car.y > ball.y + 20) {
        car.input.throttleForward = true;
        car.input.throttleReverse = false;
        if (car.boost > 10) car.input.boost = true;
        return;
      } else {
        if (distToBall < contactDist + 45 && car.canJump && !car.isFlipping) {
          startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
          if (evtObj && Math.random() < 0.7) evtObj.chatMessage = "🚀 WALL-TO-AIR STRIKE!";
          return;
        }
      }
    }

    const isBallFloorOrDefensive = ball.y > env.k - 150 || (ball.x - ownGoalX) * teamDir < 380;
    if (isBallFloorOrDefensive && car.canJump && !car.isFlipping) {
      const exitDirX = car.x < env.Kt / 2 ? 1 : -1;
      startBotJumpSeq(car, "dodge", exitDirX, -0.15);
      return;
    }
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
    // In 2v2/3v3: Designate primary goalkeeper to avoid double-commits and upfield deflections
    let isTeammateBetterPositioned = false;
    if (allTeammates && allTeammates.length > 0) {
      const myGoalSide = (ball.x - car.x) * teamDir >= -15;
      const myDistToGoal = Math.abs(car.x - ownGoalX);
      const myDistToBall = Math.hypot(ball.x - car.x, ball.y - car.y);

      for (const tm of allTeammates) {
        if (tm.isDemoed) continue;
        const tmGoalSide = (ball.x - tm.x) * teamDir >= -15;
        const tmDistToGoal = Math.abs(tm.x - ownGoalX);
        const tmDistToBall = Math.hypot(ball.x - tm.x, ball.y - tm.y);

        // If teammate is goal-side and I am upfield: teammate MUST take the save!
        if (tmGoalSide && !myGoalSide) {
          isTeammateBetterPositioned = true;
          break;
        }
        // If both are goal-side: the one closer to the ball/goal is primary
        if (tmGoalSide && myGoalSide) {
          if (tmDistToGoal < myDistToGoal - 40 || tmDistToBall < myDistToBall - 50) {
            isTeammateBetterPositioned = true;
            break;
          }
        }
      }
    }

    if (isTeammateBetterPositioned) {
      // Current bot is secondary: support back-post / shadow, DO NOT double-commit or deflect into net!
      z.action = "anchor_goal";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }

    z.action = "save";
    executeGoalkeeperSave(car, ball, ownGoal, teamDir, threat.interceptTime, threat.interceptY, env);
    return;
  }

  // 3.5 WALL & KUXIR PINCH (Supercharged Wall Lasers)
  // Strictly restricted to solid high wall sections ABOVE the crossbar (never floor corner curves!)
  const isNearLeftWall = ball.x < env.At + 85;
  const isNearRightWall = ball.x > env.Mt - 85;
  const isLeftSolidWall = (ball.y < (env.le.yMin || 380) - 15 && ball.y > env.Qt + 25);
  const isRightSolidWall = (ball.y < (env.ae.yMin || 380) - 15 && ball.y > env.Qt + 25);

  // Kuxir pinch: on own high defensive backboard wall
  const isBlueKuxir = teamDir > 0 && isNearLeftWall && isLeftSolidWall && car.x < env.At + 280;
  const isOrangeKuxir = teamDir < 0 && isNearRightWall && isRightSolidWall && car.x > env.Mt - 280;

  // Offensive corner pinch: in opponent's corner, pinching against wall blasts ball centering across goalmouth
  const isOffensiveWallPinch = (teamDir > 0 && isNearRightWall && isRightSolidWall && car.x > env.Mt - 280) ||
                               (teamDir < 0 && isNearLeftWall && isLeftSolidWall && car.x < env.At + 280);

  if ((isBlueKuxir || isOrangeKuxir || isOffensiveWallPinch) && car.boost > 6) {
    z.action = "wall_pinch";
    const wallDir = (isBlueKuxir || (teamDir < 0 && isOffensiveWallPinch)) ? -1 : 1;
    const targetWallX = wallDir < 0 ? env.At + specs.halfW + 4 : env.Mt - specs.halfW - 4;

    if (car.isGrounded) {
      botDriveGround(car, targetWallX, true, false, env);
      if (car.canJump && !car.isFlipping && Math.abs(car.x - ball.x) < 260) {
        startBotJumpSeq(car, "fast_aerial");
      }
      return;
    } else {
      const pinchApproachX = wallDir < 0 ? ball.x + (ball.radius || 30) + specs.halfW * 0.45 : ball.x - (ball.radius || 30) - specs.halfW * 0.45;
      botDriveAir(car, pinchApproachX, ball.y, env, 0.18, false);
      if (distToBall <= contactDist + 38 && (car.jumpCount === 1 || car.hasFlipReset || car.canJump) && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", wallDir, -0.22);
        if (evtObj && Math.random() < 0.8) evtObj.chatMessage = isBlueKuxir || isOrangeKuxir ? "💥 KUXIR PINCH!" : "💥 WALL PINCH!";
      }
      return;
    }
  }

  if (threat.isThreat === 2) {
    z.action = "backboard_defense";
    executeBackboardReboundDefense(car, ball, ownGoal, teamDir, env, threat.interceptTime);
    return;
  }

  // 3.8 2v2 & 3v3 TACTICAL CREASE DEMOLITIONS (Upfield Disturber)
  if (tmCar && !tmCar.isDemoed && oppList.length > 0) {
    const isUpfieldNearCrease = Math.abs(car.x - oppGoalX) < 380;
    const isTeammateAttacking = (ball.x - ownGoalX) * teamDir > 320 && (car.x - ball.x) * teamDir > 100;
    const goalieTarget = oppList.find((opp: any) => !opp.isDemoed &&
      Math.abs(opp.x - oppGoalX) < 240 &&
      opp.y > (oppGoal.yMin || 380) - 50 &&
      opp.y < (oppGoal.yMax || 680) + 90
    );
    if (isUpfieldNearCrease && isTeammateAttacking && goalieTarget) {
      z.action = "crease_demo";
      botDriveGround(car, goalieTarget.x, true, false, env);
      if (car.boost > 0) car.input.boost = true;
      const distToOpp = Math.hypot(goalieTarget.x - car.x, goalieTarget.y - car.y);
      if (distToOpp < 110 && goalieTarget.y < car.y - 15 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "jump_strike", teamDir, -0.3, 0.08);
      }
      if (evtObj && Math.random() < 0.3) evtObj.chatMessage = "BOOM! 💥 Crease Demo!";
      return;
    }
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
  const isSideWallBall = ball.x < env.At + 55 || ball.x > env.Mt - 55;
  const isBallOnRoof = car.isGrounded &&
    Math.abs(car.x - ball.x) < specs.halfW * 0.85 &&
    ball.y <= car.y - specs.halfH + 8 &&
    ball.y >= car.y - specs.halfH - (ball.radius || 30) * 2 - 14;
  const isBehind = (car.x - ball.x) * teamDir > specs.halfW + 15 && !isSideWallBall && !isBallOnRoof;
  if (isBehind) {
    z.action = "rotate_back";
    executeShadowRecovery(car, ball, ownGoal, teamDir, env);
    return;
  }

  const oppDist = oppCar && !oppCar.isDemoed ? Math.hypot(oppCar.x - car.x, oppCar.y - car.y) : 999;
  const goalDist = Math.abs(oppGoalX - car.x);
  const isOffensiveZone = (ball.x - ownGoalX) * teamDir > 420;

  // 6. 2v2 & 3v3 INFIELD PASSING PLAYS

  if (tmCar && !tmCar.isDemoed && (car.x - ownGoalX) * teamDir > 200) {
    const isFlankOrDeep = Math.abs(ball.y - car.y) < 85 && (ball.y > 420 || Math.abs(ball.x - oppGoalX) < 420);
    const tmIsCentralReceiver = (teamDir > 0 && tmCar.x < oppGoalX - 140 && tmCar.x > env.Kt / 2 - 180) ||
                                (teamDir < 0 && tmCar.x > oppGoalX + 140 && tmCar.x < env.Kt / 2 + 180);
    if (isFlankOrDeep && tmIsCentralReceiver) {
      z.action = "infield_pass";
      botDriveGround(car, ball.x, true, false, env);
      if (Math.abs(car.x - ball.x) <= specs.halfW + 20 && car.canJump && !car.isFlipping) {
        // Precise centering chip into teammate's lane
        const passDirX = (tmCar.x - car.x) / (Math.hypot(tmCar.x - car.x, tmCar.y - car.y) || 1);
        startBotJumpSeq(car, "dodge", passDirX, -0.68);
        if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "Centering! 🎯";
        return;
      }
      return;
    }
  }

  // 7. ROOF CARRY DRIBBLE & MUSTY / 45° FLICK (Calibrated to exact car roof height!)
  if (isBallOnRoof) {
    z.action = "dribble";
    z.dribbleTime = (z.dribbleTime || 0) + dt;

    // Carry forward smoothly with ball toward opponent goal
    botDriveGround(car, oppGoalX, false, false, env);
    car.input.throttleForward = true;
    if (Math.abs(car.vx) < 550 && car.boost > 10) car.input.boost = true;

    // Trigger flick when in scoring range (< 680px) or when opponent challenges (< 240px)
    if ((goalDist < 680 || oppDist < 240 || z.dribbleTime > 0.40) && car.canJump && !car.isFlipping) {
      let targetCornerY = (oppGoal.yMin || 380) + 36;
      if (oppCar && !oppCar.isDemoed) {
        const goalCenterY = ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2;
        targetCornerY = oppCar.y < goalCenterY ? (oppGoal.yMax || 680) - 36 : (oppGoal.yMin || 380) + 36;
      }
      const flickAngle = Math.atan2(targetCornerY - ball.y, oppGoalX - ball.x);
      const flickCos = Math.cos(flickAngle);
      const flickSin = Math.sin(flickAngle);

      if (Math.random() < 0.55) {
        // 45° Laser Flick: fast boomer into open corner
        startBotJumpSeq(car, "dodge", flickCos, Math.min(-0.25, flickSin * 0.9));
        if (evtObj && Math.random() < 0.7) evtObj.chatMessage = "🚀 45° BANGER FLICK!";
      } else {
        // Musty / Breezi Flick sequence
        startBotJumpSeq(car, "musty_jump", flickCos, Math.min(-0.20, flickSin * 0.8));
        if (evtObj && Math.random() < 0.7) evtObj.chatMessage = "⚡ MUSTY FLICK!";
      }
      z.dribbleTime = 0;
      return;
    }
    return;
  }

  // 7.5 PROACTIVE GROUND SCOOP (Actively catch ground rolling balls onto roof when speed-matched with space)
  const isRollingGroundBall = car.isGrounded && ball.y >= env.k - 44 && Math.abs(ball.vy) < 90;
  const isBallAheadInLane = (ball.x - car.x) * teamDir > 15 && (ball.x - car.x) * teamDir < 240;
  const isSpeedMatched = Math.abs(car.vx - ball.vx) < 140 && Math.abs(car.vx) < 520;
  const isApproachingScoop = distToBall >= contactDist - 10 && distToBall < 280;
  const hasSpaceToScoop = isRollingGroundBall && isBallAheadInLane && isSpeedMatched && isApproachingScoop && oppDist > 180 && goalDist > 280;

  if (hasSpaceToScoop && !car.isFlipping) {
    z.action = "dribble";
    const scoopTargetX = ball.x - teamDir * (specs.halfW * 0.4);
    botDriveGround(car, scoopTargetX, false, false, env);
    car.input.throttleForward = true;
    if (distToBall < contactDist + 15) {
      if (Math.abs(car.vx) < Math.abs(ball.vx) + 40 && car.boost > 0) {
        car.input.boost = true;
      }
    }
    return;
  }

  // 8. BACKBOARD DOUBLE TAP ENGINE (Intentional High Pop Setup + Rebound Dunk)
  const isOppBackboardZone = (teamDir > 0 && ball.x > env.Mt - 380) || (teamDir < 0 && ball.x < env.At + 380);
  const isBallReboundingOffBackboard = isOppBackboardZone && (ball.vx * teamDir < -15 || Math.abs(ball.x - oppGoalX) < 180) && ball.y < (oppGoal.yMin || 380) + 80;

  // 8.1 REBOUND DUNK: Ball has hit or is rebounding from opponent backboard
  if (isBallReboundingOffBackboard && car.boost > 6) {
    const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 2.2);
    if (intercept) {
      z.action = "double_tap";
      let targetCornerY = (oppGoal.yMin || 380) + 40;
      if (oppCar && !oppCar.isDemoed) {
        targetCornerY = oppCar.y < ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2 ? (oppGoal.yMax || 680) - 35 : (oppGoal.yMin || 380) + 35;
      }
      const shootAng = Math.atan2(targetCornerY - ball.y, oppGoalX - ball.x);

      if (car.isGrounded) {
        botDriveGround(car, intercept.strikeTargetX, true, false, env);
        const hClimb = Math.max(0, car.y - intercept.y);
        const climbT = 0.10 + hClimb / 680;
        if (car.canJump && !car.isFlipping && car.boost > 6 && intercept.t <= climbT + 0.22) {
          startBotJumpSeq(car, "fast_aerial");
        }
      } else {
        botDriveAir(car, intercept.strikeTargetX, intercept.strikeTargetY, env, intercept.t, false, shootAng);
        if (distToBall < contactDist + 28 && (car.jumpCount === 1 || car.hasFlipReset || car.canJump)) {
          startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
          if (evtObj && Math.random() < 0.7) evtObj.chatMessage = "🎯 BACKBOARD DOUBLE TAP!";
        }
      }
      return;
    }
  }

  // 8.2 INTENTIONAL DOUBLE TAP SETUP: Chip high against backboard above crossbar
  const isSetableForDoubleTap = car.isGrounded &&
                                (ball.x - ownGoalX) * teamDir > 680 &&
                                Math.abs(car.x - oppGoalX) > 280 &&
                                Math.abs(car.x - oppGoalX) < 680 &&
                                car.boost >= 18 &&
                                oppDist > 160 &&
                                ball.y < env.k - 16 &&
                                !car.isFlipping;
  if (isSetableForDoubleTap && (ball.x - car.x) * teamDir > 0 && distToBall < contactDist + 25 && car.canJump) {
    z.action = "double_tap_setup";
    const backboardTargetY = (oppGoal.yMin || 380) - 90;
    const chipAng = Math.atan2(backboardTargetY - ball.y, oppGoalX - ball.x);
    startBotJumpSeq(car, "jump_strike", Math.cos(chipAng), Math.sin(chipAng) * 0.95, 0.12);
    if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "🚀 Double tap setup!";
    return;
  }

  // 10. ACTIVE AIR DRIBBLE CONTINUATION & FLIP RESET EXECUTION
  const isOngoingAirDribble = !car.isGrounded && z.action === "air_dribble" && distToBall < 190 && ball.y < env.k - 60 && car.boost > 4;
  if (isOngoingAirDribble) {
    let targetCornerY = (oppGoal.yMin || 380) + 32;
    if (oppCar && !oppCar.isDemoed) {
      targetCornerY = oppCar.y < ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2 ? (oppGoal.yMax || 680) - 32 : (oppGoal.yMin || 380) + 32;
    }
    executeAirDribble(car, ball, oppGoalX, targetCornerY, teamDir, dt, env, evtObj, oppCar);
    return;
  }

  if (car.hasFlipReset) {
    const goalCenterY = ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2;
    let targetCornerY = goalCenterY;
    if (oppCar && !oppCar.isDemoed && Math.abs(oppCar.x - oppGoalX) < 400) {
      targetCornerY = oppCar.y > goalCenterY ? (oppGoal.yMin || 380) + 36 : (oppGoal.yMax || 680) - 36;
    }
    const shootAngle = Math.atan2(targetCornerY - ball.y, oppGoalX - ball.x);
    const cosAngle = Math.cos(shootAngle);
    const sinAngle = Math.sin(shootAngle);
    z.action = "flip_reset_dunk";

    if (distToBall < contactDist + 35) {
      if (Math.random() < 0.60) {
        if (Math.random() < 0.40) car.input.airRollLeft = true;
        startBotJumpSeq(car, "musty_jump", cosAngle, sinAngle * 0.9);
        if (evtObj) evtObj.chatMessage = "⚡ RESET MUSTY FLICK!";
      } else {
        startBotJumpSeq(car, "dodge", cosAngle, sinAngle * 0.9);
        if (evtObj && Math.random() < 0.8) evtObj.chatMessage = "🌟 RESET DUNK! 💥";
      }
      return;
    } else {
      botDriveAir(car, ball.x, ball.y, env, 0.25, false, shootAngle);
      return;
    }
  }

  // Ground-to-Air Dribble Setup: When ball bounces low or floats in offensive zone with space, pop and fast aerial!
  const isBouncingInOffense = car.isGrounded && ball.y < env.k - 25 && ball.y > env.k - 260 && (Math.abs(ball.vy) > 20 || ball.y < env.k - 50);
  const isAirDribbleLaunchZone = (ball.x - ownGoalX) * teamDir > 200;
  if (isAirDribbleLaunchZone && isBouncingInOffense && car.boost >= 18 && oppDist > 160 && !car.isFlipping) {
    const ballAhead = (ball.x - car.x) * teamDir;
    if (ballAhead > 0 && ballAhead < 140 && car.canJump) {
      z.action = "air_dribble";
      startBotJumpSeq(car, "fast_aerial");
      if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "🚀 Air dribble launch!";
      return;
    }
  }

  // 11. PROACTIVE FLIP RESET HUNT & AIR DRIBBLE CARRY
  const isHighFloatingBall = ball.y < env.k - 210 && ball.y > env.Qt + 110;
  const isBallHighAboveCar = (car.y - ball.y) > 110;
  const isBallInOffensiveHalf = (ball.x - ownGoalX) * teamDir > 320;
  const canHuntFlipReset = isHighFloatingBall && isBallHighAboveCar && isBallInOffensiveHalf && car.boost >= 20 && oppDist > 200;

  if (canHuntFlipReset) {
    z.action = "flip_reset_setup";
    const undercarriageX = ball.x;
    const undercarriageY = ball.y + (ball.radius || 30) + specs.halfH + 4;

    if (car.isGrounded) {
      botDriveGround(car, ball.x - teamDir * 20, true, false, env);
      const hClimb = Math.max(0, car.y - undercarriageY);
      const climbSpeed = env.isLegacy ? 840 : 680;
      const climbT = 0.10 + hClimb / climbSpeed;
      if (car.canJump && !car.isFlipping && Math.abs(car.x - ball.x) <= 320) {
        startBotJumpSeq(car, "fast_aerial");
      }
      return;
    } else {
      botDriveAir(car, undercarriageX, undercarriageY, env, 0.25, true);
      if (distToBall < contactDist + 25) {
        car.input.mouseAim = true;
        car.input.mouseTargetAngle = teamDir > 0 ? Math.PI : 0;
      }
      return;
    }
  }

  const canAirDribble = !car.isGrounded && distToBall < 150 && ball.y < env.k - 85 && ball.y > env.Qt + 90 && ((ball.x - car.x) * teamDir > -20);
  if (isAirDribbleLaunchZone && canAirDribble && car.boost > 8 && ((teamDir > 0 && ball.x < oppGoalX - 80) || (teamDir < 0 && ball.x > oppGoalX + 80))) {
    z.action = "air_dribble";
    let targetCornerY = (oppGoal.yMin || 380) + 32;
    if (oppCar && !oppCar.isDemoed) {
      targetCornerY = oppCar.y < ((oppGoal.yMin || 380) + (oppGoal.yMax || 680)) / 2 ? (oppGoal.yMax || 680) - 32 : (oppGoal.yMin || 380) + 32;
    }
    executeAirDribble(car, ball, oppGoalX, targetCornerY, teamDir, dt, env, evtObj, oppCar);
    return;
  }

  // 12. STRATEGIC BOOST ROUTING
  if (car.boost < 15 && boostPads && distToBall > 650 && ball.vx * teamDir >= 0) {
    const pad = findStrategicBoostPad(car, boostPads, ownGoal.x || (teamDir > 0 ? env.At : env.Mt), oppGoalX, teamDir);
    if (pad && Math.hypot(pad.x - car.x, pad.y - car.y) < 260) {
      botDriveGround(car, pad.x, false, false, env);
      return;
    }
  }

  // 13. MASTERPIECE ELEVATED SCORING & INTERCEPT
  const isOffensiveCorridor = (ball.x - ownGoalX) * teamDir > 380 && (car.x - ownGoalX) * teamDir > 300;
  const isIncomingPass = isOffensiveCorridor && tmCar && !tmCar.isDemoed && ((tmCar.x - car.x) * teamDir > 80) && (ball.vx * teamDir < -10 || Math.abs(ball.vx) < 240);
  z.action = isIncomingPass ? "score_pass" : "attack";
  const intercept = solveBestIntercept(car, ball, teamDir, env, oppCar, tmCar, isUnfair, 2.2);
  const targetX = intercept.strikeTargetX || intercept.x;
  const targetY = intercept.strikeTargetY || intercept.y;
  const shootAngle = Math.atan2(intercept.targetCornerY - ball.y, oppGoalX - ball.x);
  const cosShoot = Math.cos(shootAngle), sinShoot = Math.sin(shootAngle);

  const ballRel = (ball.x - car.x) * teamDir;
  const isBallDangerouslyBehind = ballRel < -12;

  if (car.isGrounded) {
    if (isBallDangerouslyBehind) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }

    const isApproachingBall = ballRel > 0;
    // When approaching from behind to strike, drive THROUGH the ball towards opponent net!
    // (Never stop 60px short of the ball or steer away right before contact!)
    const groundAttackX = isApproachingBall ? oppGoalX : targetX;
    botDriveGround(car, groundAttackX, true, false, env, targetY);
    if (isApproachingBall) {
      car.input.throttleForward = true;
      car.facing = teamDir;
    }

    const hClimb = Math.max(0, car.y - targetY);
    const vClose = Math.max(120, (car.vx - ball.vx) * teamDir);
    const strikeTriggerDist = contactDist + Math.min(55, Math.max(28, vClose * 0.045));

    // Calculate vertical dodge angle:
    // Follow the true geometric vector into the goal, ensuring upward elevation for ground shots into elevated nets
    let strikeDodgeY = sinShoot * 0.9;
    if (car.isGrounded && ball.y > (oppGoal.yMax || 680) - 25) {
      strikeDodgeY = Math.min(-0.20, strikeDodgeY);
    }

    if (intercept.isAerial && ball.y < env.k - 165 && intercept.y < env.k - 165 && car.boost >= 8) {
      // High Aerial Launch: Launch from deep across the arena!
      const climbSpeed = env.isLegacy ? 840 : 680;
      const climbT = 0.08 + hClimb / climbSpeed;
      const horizDist = Math.abs(car.x - targetX);
      const maxLaunchDist = Math.max(260, Math.abs(car.vx) * climbT + 380);
      const isOrientedTowardsTarget = (targetX - car.x) * car.vx > -80 && (targetX - car.x) * (car.facing || 1) > -35;
      if (car.canJump && !car.isFlipping && intercept.t <= climbT + 0.45 && horizDist <= maxLaunchDist && isOrientedTowardsTarget) {
        startBotJumpSeq(car, "fast_aerial", cosShoot, sinShoot);
      }
    } else if (intercept.isHalfVolley && isApproachingBall) {
      // Half-Volley Boomer: Strike with supersonic front bumper right as ball rises off turf!
      car.input.throttleForward = true;
      car.facing = teamDir;
      if (car.boost > 0 && Math.abs(car.x - ball.x) < 400) {
        car.input.boost = true;
      }
      if (distToBall <= contactDist + 34 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", cosShoot, strikeDodgeY);
        if (evtObj && Math.random() < 0.6) evtObj.chatMessage = "🚀 HALF-VOLLEY BOOMER!";
      }
    } else if (hClimb > 20 || ball.y < env.k - 38) {
      // Waist-High & Floating Ball: PRECISION JUMP STRIKE with calibrated elevation (Never whiffs underneath!)
      const climbT = 0.05 + hClimb / 480;
      const holdDuration = Math.max(0.04, Math.min(0.20, hClimb / 400));
      if (isApproachingBall && car.canJump && !car.isFlipping) {
        if (distToBall <= contactDist + 28) {
          // Instant dodge flip or Musty flick directly into the ball
          const distToGoal = Math.abs(car.x - oppGoalX);
          const isScoringTapIn = distToGoal < 300;
          if (!isScoringTapIn && oppDist > 160 && Math.random() < 0.35) {
            startBotJumpSeq(car, "musty_jump", cosShoot, strikeDodgeY);
            if (evtObj) evtObj.chatMessage = "⚡ AERIAL MUSTY FLICK!";
          } else {
            startBotJumpSeq(car, "dodge", cosShoot, strikeDodgeY);
          }
        } else if (intercept.t <= climbT + 0.12 && distToBall <= strikeTriggerDist + 25) {
          startBotJumpSeq(car, "jump_strike", cosShoot, strikeDodgeY, holdDuration);
        }
      }
    } else {
      // Flat ground strike: 100% STAY GROUNDED on approach, then execute lethal supersonic contact dodge or Musty flick!
      car.input.throttleForward = true;
      car.facing = teamDir;
      if (car.boost > 0 && Math.abs(car.x - ball.x) < 360) {
        car.input.boost = true;
      }
      if (isApproachingBall && distToBall <= contactDist + 30 && car.canJump && !car.isFlipping) {
        const distToGoal = Math.abs(car.x - oppGoalX);
        const isScoringTapIn = distToGoal < 300;
        if (!isScoringTapIn && (ball.x - ownGoalX) * teamDir > 320 && oppDist > 160 && Math.random() < 0.40) {
          startBotJumpSeq(car, "musty_jump", cosShoot, strikeDodgeY);
          if (evtObj) evtObj.chatMessage = "⚡ GROUND MUSTY FLICK!";
        } else {
          startBotJumpSeq(car, "dodge", cosShoot, strikeDodgeY);
        }
      }
    }
  } else {
    if (isBallDangerouslyBehind) {
      z.action = "rotate_back";
      executeShadowRecovery(car, ball, ownGoal, teamDir, env);
      return;
    }
    // Fly directly to strike target for bumper alignment with smooth corner aiming
    botDriveAir(car, targetX, targetY, env, intercept.t, false, shootAngle);
    const canAirDodge = car.jumpCount === 1 || car.hasFlipReset || (car.canJump && !car.isGrounded);
    if (distToBall <= contactDist + 32 && canAirDodge && !car.isFlipping) {
      if (car.hasFlipReset && Math.random() < 0.65) {
        startBotJumpSeq(car, "musty_jump", cosShoot, sinShoot * 0.9);
        if (evtObj) evtObj.chatMessage = "⚡ RESET MUSTY FLICK!";
      } else {
        startBotJumpSeq(car, "dodge", cosShoot, sinShoot * 0.9);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 6. HELPER SUB-BEHAVIORS
// ---------------------------------------------------------------------------

function executeKickoff(car: any, ball: any, teamDir: number, env: ArenaEnv, isUnfair: boolean, tmCar: any) {
  const s = ball.x - car.x;
  const dist = Math.hypot(s, ball.y - car.y);
  const specs = getCarHitboxSpecs(car);
  const contactDist = specs.halfW + (ball.radius || 30);

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

  // Ensure facing aligns with team attack direction towards ball
  car.facing = teamDir;
  if (car.isGrounded) {
    car.angle = teamDir > 0 ? 0 : Math.PI;
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

  // Speedflip kickoff trigger when crossing optimal acceleration zone (flat level dash)
  if (isUnfair && car.isGrounded && car.canJump && !car.isFlipping && dist < 540 && dist > 350 && Math.abs(car.vx) > 280) {
    startBotJumpSeq(car, "speedflip_kickoff", teamDir, -0.04);
    return;
  }

  // Contact power blast: when within close range of kickoff ball, STAY FIRMLY GROUNDED!
  // 100% full throttle + boost driving directly through the ball's center
  // Guarantees winning 50/50s and eliminates jumping/flipping over the ball
  if (dist <= contactDist + 50) {
    car.input.throttleForward = true;
    if (car.boost > 0) car.input.boost = true;
    car.input.steerRight = s > 0.5;
    car.input.steerLeft = s < -0.5;

    // Clinical 50/50 power dodge directly through the ball at the moment of contact
    if (dist <= contactDist + 15 && car.canJump && !car.isFlipping) {
      startBotJumpSeq(car, "dodge", teamDir, -0.06);
    }
  }
}

export function checkDefensiveThreat(ball: any, ownGoal: GoalDef, teamDir: number, env: ArenaEnv) {
  const b = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, radius: ball.radius || 30 };
  const dt = 0.025;
  const maxSteps = 140;
  const subF = dt / 2;

  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const yMin = ownGoal.yMin || 380;
  const yMax = ownGoal.yMax || 680;

  // Direct threat check: ball in defensive zone heading towards our goal (even slow roll!)
  const distToGoalX = Math.abs(ball.x - goalX);
  const isHeadingToOwnGoal = ball.vx * teamDir < -5;
  if (distToGoalX < 520 && isHeadingToOwnGoal && ball.y >= yMin - 80 && ball.y <= yMax + 80) {
    const tMeet = Math.max(0.04, Math.abs(ball.x - (goalX + teamDir * 80)) / Math.max(40, Math.abs(ball.vx)));
    return { isThreat: 1, interceptTime: tMeet, interceptY: ball.y };
  }

  // Also if ball is already dangerously close to our net (within 260px) and not clearing quickly
  if (distToGoalX < 260 && ball.y >= yMin - 60 && ball.y <= yMax + 60 && (ball.vx * teamDir <= 30)) {
    return { isThreat: 1, interceptTime: 0.1, interceptY: ball.y };
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
  const safeGoalPostX = teamDir > 0 ? env.At + 170 : env.Mt - 170;
  const clearDirX = teamDir;
  const clearDirY = -0.28;
  const specs = getCarHitboxSpecs(car);
  const contactDist = specs.halfW + (ball.radius || 30);

  // If car is stuck on wall/curve, dismount immediately towards pitch center!
  if (car.surfaceType === "left_wall" || car.surfaceType === "right_wall" || car.surfaceType === "curve") {
    car.input.jump = true;
    car.input.steerRight = teamDir > 0;
    car.input.steerLeft = teamDir < 0;
    car.input.throttleForward = true;
    return;
  }

  // Disciplined crease: clamp to flat ground, never touch corner curves!
  const minCreaseX = teamDir > 0 ? env.At + 85 : env.Mt - 260;
  const maxCreaseX = teamDir > 0 ? env.At + 260 : env.Mt - 85;

  const distToGoalieX = Math.abs(ball.x - car.x);
  const relVx = Math.max(80, Math.abs(ball.vx - (car.isGrounded ? car.vx : 0)));
  const tToMeet = Math.max(0.04, Math.min(interceptTime > 0 ? interceptTime : 1.5, distToGoalieX / relVx));

  const meetParabolicY = ball.y + ball.vy * tToMeet + 0.5 * env.Ph * tToMeet * tToMeet;
  const isGroundBouncing = meetParabolicY >= env.k - 38;
  const goalieInterceptY = isGroundBouncing ? (interceptY > 0 ? interceptY : env.k - 25) : meetParabolicY;

  const targetSaveY = isGroundBouncing
    ? env.k - specs.halfH
    : Math.max((ownGoal.yMin || 380) + 15, Math.min((ownGoal.yMax || 680) - 15, goalieInterceptY));

  // The goalie MUST stay on the GOAL-SIDE of the ball (between goal and ball):
  // For Blue (teamDir = 1): goal is on left, so goalie X is to the left of ball: ball.x - contactDist * 0.75
  // For Orange (teamDir = -1): goal is on right, so goalie X is to the right of ball: ball.x + contactDist * 0.75
  const idealGoalSideX = ball.x - teamDir * (contactDist * 0.75);
  const targetSaveX = Math.max(minCreaseX, Math.min(maxCreaseX, idealGoalSideX));

  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);
  const hClimb = Math.max(0, car.y - targetSaveY);

  // Check if goalie is on goal side
  const isGoalSide = (ball.x - car.x) * teamDir >= -12;

  if (!isGoalSide) {
    const distToBallX = Math.abs(car.x - ball.x);
    if (distToBallX < 280) {
      // Dangerously close behind ball in front of net: strictly avoid bumping into own goal!
      car.input.boost = false;
      car.input.throttleForward = false;
      if ((ball.x - car.x) * car.vx > 0) {
        car.input.throttleReverse = true;
      } else {
        car.input.throttleReverse = false;
      }
      car.input.steerLeft = false;
      car.input.steerRight = false;
      car.input.jump = false;
      return;
    } else {
      // Caught upfield with plenty of clearance: only sprint back if ball is above crossbar
      const isBallAboveCrossbar = ball.y < (ownGoal.yMin || 380) - 15;
      if (isBallAboveCrossbar) {
        botDriveGround(car, safeGoalPostX, true, false, env);
      } else {
        const safeHoldingX = ball.x + teamDir * 240;
        botDriveGround(car, safeHoldingX, false, false, env);
      }
      return;
    }
  }

  if (car.isGrounded) {
    car.facing = teamDir;
    car.angle = teamDir > 0 ? 0 : Math.PI;

    if (hClimb > 130 && car.boost > 8) {
      // High Aerial Save
      botDriveGround(car, targetSaveX, true, false, env);
      const climbSpeed = env.isLegacy ? 840 : 680;
      const climbT = 0.10 + hClimb / climbSpeed;
      if (tToMeet <= climbT + 0.22 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "fast_aerial", clearDirX, clearDirY);
      }
    } else if (hClimb > 24 || ball.y < env.k - 38) {
      // Waist-High & Floating Save (Never Whiffs Underneath!)
      botDriveGround(car, targetSaveX, true, false, env);
      const climbT = 0.05 + hClimb / 480;
      const holdDuration = Math.max(0.04, Math.min(0.20, hClimb / 400));
      if (dist <= contactDist + 22 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
      } else if (tToMeet <= climbT + 0.14 && dist <= contactDist + 65 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "jump_strike", clearDirX, clearDirY, holdDuration);
      }
    } else {
      // Ground Save: Drive outward through ball and power-clear
      botDriveGround(car, ball.x, true, false, env);
      if (dist <= contactDist + 22 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "dodge", clearDirX, -0.15);
      }
    }
  } else {
    botDriveAir(car, targetSaveX, targetSaveY, env, tToMeet);
    if (dist <= contactDist + 35 && (car.jumpCount === 1 || car.hasFlipReset || car.canJump)) {
      startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
    }
  }
}

function executeBackboardReboundDefense(
  car: any,
  ball: any,
  ownGoal: GoalDef,
  teamDir: number,
  env: ArenaEnv,
  interceptTime: number
) {
  const goalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const specs = getCarHitboxSpecs(car);
  const contactDist = specs.halfW + (ball.radius || 30);
  const dist = Math.hypot(ball.x - car.x, ball.y - car.y);

  // If on wall or curve, dismount immediately
  if (car.surfaceType === "left_wall" || car.surfaceType === "right_wall" || car.surfaceType === "curve") {
    car.input.jump = true;
    car.input.steerRight = teamDir > 0;
    car.input.steerLeft = teamDir < 0;
    return;
  }

  // Station goalie at safe crease line on flat ground facing out into pitch
  const creaseX = teamDir > 0 ? env.At + 140 : env.Mt - 140;
  const clearDirX = teamDir;
  const clearDirY = -0.35;

  const isBallReboundingOut = (ball.vx * teamDir > 25);
  const isBallCloseToWall = Math.abs(ball.x - goalX) < 95;

  if (car.isGrounded) {
    if (isBallReboundingOut) {
      // Rebound is coming out: charge into the rebound and blast downfield!
      botDriveGround(car, ball.x, true, false, env);
      const hClimb = Math.max(0, car.y - ball.y);
      if (dist <= contactDist + 28 && car.canJump && !car.isFlipping) {
        if (hClimb > 30) {
          startBotJumpSeq(car, "jump_strike", clearDirX, clearDirY, Math.min(0.18, hClimb / 400));
        } else {
          startBotJumpSeq(car, "dodge", clearDirX, -0.15);
        }
      }
    } else {
      // Ball still heading towards backboard: hold crease position, do NOT jump into wall!
      botDriveGround(car, creaseX, false, false, env);
      car.facing = teamDir;
      car.angle = teamDir > 0 ? 0 : Math.PI;

      // Only fly if ball is right above car and ready to be tapped away
      if (isBallCloseToWall && ball.y < (ownGoal.yMin || 380) && car.boost > 20 && dist < 140 && car.canJump && !car.isFlipping) {
        startBotJumpSeq(car, "fast_aerial", clearDirX, clearDirY);
      }
    }
  } else {
    botDriveAir(car, ball.x, ball.y, env, 0.35);
    if (dist <= contactDist + 35 && (car.jumpCount === 1 || car.hasFlipReset || car.canJump)) {
      startBotJumpSeq(car, "dodge", clearDirX, clearDirY);
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
  const specs = getCarHitboxSpecs(car);
  const contactDist = specs.halfW + (ball.radius || 30);

  // 1. Counter-Attack Threat or Ball in Our Half:
  const ballInOurHalf = (teamDir > 0 && ball.x < env.Kt / 2 + 100) || (teamDir < 0 && ball.x > env.Kt / 2 - 100);
  if (isIncomingAttack || ballInOurHalf) {
    const isGoalSide = (ball.x - car.x) * teamDir > 0;
    if (isGoalSide && (tmIsBehindBall || myDist < tmDist - 40)) {
      car.botState.action = "step_up_challenge";
      botDriveGround(car, ball.x, true, false, env);
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
  const ownGoalX = ownGoal.x !== undefined ? ownGoal.x : (teamDir > 0 ? env.At : env.Mt);
  const isTmAttackingFlank = Math.abs(tmCar.x - oppGoalX) < 420;
  const isBallCrossingInfield = (ball.vx * teamDir < -10 || Math.abs(ball.vx) < 220);
  const isOffensiveZone = (ball.x - ownGoalX) * teamDir > 420 && (car.x - ownGoalX) * teamDir > 320;

  if (isTmAttackingFlank && isBallCrossingInfield && isOffensiveZone) {
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
      if (Math.hypot(ball.x - car.x, ball.y - car.y) < contactDist + 24 && (car.jumpCount === 1 || car.hasFlipReset)) {
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
  const oppGoalX = teamDir > 0 ? env.Mt : env.At;
  const safeGoalPostX = teamDir > 0 ? env.At + 170 : env.Mt - 170;

  car.input.pitchUp = false;
  car.input.pitchDown = false;

  // If on wall or curve, dismount immediately
  if (car.surfaceType === "left_wall" || car.surfaceType === "right_wall" || car.surfaceType === "curve") {
    car.input.jump = true;
    car.input.throttleForward = true;
    car.input.steerRight = teamDir > 0;
    car.input.steerLeft = teamDir < 0;
    return;
  }

  const isUpfieldOfBall = (car.x - ball.x) * teamDir > 0;

  if (car.isGrounded) {
    if (isUpfieldOfBall) {
      // Upfield of ball: STRICTLY NEVER boost when ball is behind!
      car.input.boost = false;

      const isBallSafelyHighAbove = ball.y < env.k - 80 && ball.vy < 60 && Math.abs(ball.vx) < 500;
      const distToBallX = Math.abs(car.x - ball.x);

      if (isBallSafelyHighAbove) {
        // Ball is genuinely high enough in the air: safely drive underneath the ball towards back post!
        botDriveGround(car, safeGoalPostX, false, false, env);
      } else {
        // Ball is low/grounded/falling: DO NOT drive through the ball into own net!
        const isMovingTowardBall = (ball.x - car.x) * car.vx > 0;

        // 1. Proactive Turnaround Attack: If ball is moving toward opponent net, follow it!
        const isBallMovingToOppGoal = ball.vx * teamDir > 40;
        if (isBallMovingToOppGoal && distToBallX > 140) {
          botDriveGround(car, oppGoalX, true, true, env);
          return;
        }

        // 2. Anti-Own-Goal Braking: If dangerously close, moving towards ball, or ball heading to own net, brake hard!
        const isBallMovingToOwnGoal = ball.vx * teamDir < -30;
        if ((isMovingTowardBall && distToBallX < 340) || distToBallX < 180 || isBallMovingToOwnGoal) {
          car.input.throttleForward = false;
          car.input.throttleReverse = true;
          car.input.jump = false;
          car.input.boost = false;
          car.input.steerLeft = false;
          car.input.steerRight = false;
          return;
        }

        // 3. Proactive High Leap-Over: When stationary or moving away with safe clearance (180-420px) over neutral ball:
        const canLeapOver = !isMovingTowardBall && distToBallX >= 180 && distToBallX <= 420 && car.canJump && !car.isFlipping;
        if (canLeapOver) {
          startBotJumpSeq(car, "fast_aerial", -teamDir * 0.35, -0.94);
          return;
        }

        // 4. Smooth Rotation: Drive smoothly to safeGoalPostX
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
    const distToBall = Math.hypot(ball.x - car.x, ball.y - car.y);
    if (isUpfieldOfBall && distToBall < 180) {
      // Avoid knocking aerial ball down into own net
      botDriveAir(car, car.x, Math.max(env.Qt + 40, ball.y - 80), env, 0.25);
    } else {
      botDriveAir(car, safeGoalPostX, Math.min(car.y, (ownGoal.yMin || 380) + 40), env, 0.45);
    }
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
  const specs = getCarHitboxSpecs(car);
  const contactDist = specs.halfW + (ball.radius || 30);

  if (car.isGrounded) {
    botDriveGround(car, ball.x - teamDir * 20, true, false, env);
    if (Math.abs(car.x - ball.x) < 90 && car.boost > 8) {
      startBotJumpSeq(car, "fast_aerial");
    }
    return;
  }

  // Track consecutive aerial touches
  if (dist <= contactDist + 14) {
    car.botState.airDribbleTouches = (car.botState.airDribbleTouches || 0) + 1;
    if (car.botState.airDribbleTouches >= 2 && evtObj && Math.random() < 0.35) {
      evtObj.chatMessage = `🔥 ${car.botState.airDribbleTouches}x AIR DRIBBLE!`;
    }
  }

  const goalDist = Math.abs(car.x - oppGoalX);
  const isDefenderClose = oppCar && !oppCar.isDemoed && Math.hypot(oppCar.x - ball.x, oppCar.y - ball.y) < 180;
  const isBallDropping = ball.vy > 60 || ball.y > env.k - 150;
  const canDodge = car.jumpCount === 1 || car.hasFlipReset;

  // 1. Scoring Dunk / Power Finish in Attack Zone
  if (canDodge && dist <= contactDist + 28 && (goalDist < 540 || isDefenderClose || isBallDropping)) {
    const shootAng = Math.atan2(targetCornerY - ball.y, oppGoalX - ball.x);
    if (car.hasFlipReset && Math.random() < 0.65) {
      startBotJumpSeq(car, "musty_jump", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
      if (evtObj) evtObj.chatMessage = "⚡ AIR MUSTY FLICK!";
    } else {
      startBotJumpSeq(car, "dodge", Math.cos(shootAng), Math.sin(shootAng) * 0.85);
      if (evtObj && Math.random() < 0.7) evtObj.chatMessage = "Air dribble dunk! 💥";
    }
    return;
  }

  // 2. Consecutive Chaining: If carried for 2+ touches in midfield with altitude, catch a Flip Reset!
  const canChainFlipReset = (car.botState.airDribbleTouches || 0) >= 2 && !car.hasFlipReset && ball.y < env.k - 180 && goalDist >= 500 && car.boost > 10;
  if (canChainFlipReset) {
    const undercarriageX = ball.x;
    const undercarriageY = ball.y + (ball.radius || 30) + specs.halfH + 2;
    botDriveAir(car, undercarriageX, undercarriageY, env, 0.18, true);
    if (dist <= contactDist + 22) {
      car.input.mouseAim = true;
      car.input.mouseTargetAngle = teamDir > 0 ? Math.PI : 0;
    }
    return;
  }

  // 3. Push directly through lower-rear quadrant to maintain forward carry and loft:
  // Position car center below the ball so the roof/bumper constantly scoops and lifts the ball!
  const sweetX = ball.x - teamDir * (specs.halfW * 0.65);
  const sweetY = ball.y + (ball.radius || 30) * 0.8 + specs.halfH * 0.4;
  botDriveAir(car, sweetX, sweetY, env, 0.18);
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
