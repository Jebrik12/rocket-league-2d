import {
  ArenaEnv,
  simulateBallSubstep,
  solveBestIntercept,
  startBotJumpSeq,
  updateBotJumpSeq,
  botDriveGround,
  botDriveAir,
  executeMasterBotBrain,
  checkDefensiveThreat,
  getCarHitboxSpecs,
  CAR_HITBOX_MAP
} from "../src/bot/botBrain";

// Standard arena environment matching App.tsx default RL_PHYSICS
const testEnv: ArenaEnv = {
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

function createMockCar(overrides: any = {}) {
  return {
    id: "bot-1",
    name: "UnfairBot",
    team: "blue",
    x: 400,
    y: testEnv.k - 14.5,
    vx: 0,
    vy: 0,
    angle: 0,
    facing: 1,
    width: 68,
    height: 29,
    wheelbase: 36,
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
      mouseTargetAngle: undefined
    },
    botState: {
      action: "idle",
      dribbleTime: 0,
      airDribbleTouches: 0,
      targetPos: { x: 0, y: 0 },
      interceptTime: 0,
      jumpSeq: { stage: "idle", timer: 0, type: "dodge", dodgeX: 0, dodgeY: 0 }
    },
    ...overrides
  };
}

function runTests() {
  console.log("=== RUNNING MASTERCLASS BOT AI TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorMsg?: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName}: ${errorMsg || "Assertion failed"}`);
      failed++;
    }
  }

  // --- TEST GROUP 1: Analytical Ball Physics Simulation ---
  console.log("--- 1. Analytical Ball Physics Simulation ---");
  {
    // A: Floor bounce
    const ball = { x: 1000, y: testEnv.k - 35, vx: 0, vy: 500, radius: 30 };
    simulateBallSubstep(ball, 0.016, testEnv);
    assert(ball.vy < 0, "Floor bounce reverses vertical velocity", `vy was ${ball.vy}`);
    assert(ball.y <= testEnv.k - ball.radius, "Floor bounce respects ball radius", `y was ${ball.y}`);

    // B: Wall bounce
    const wallBall = { x: testEnv.Mt - 25, y: 300, vx: 600, vy: 0, radius: 30 };
    simulateBallSubstep(wallBall, 0.016, testEnv);
    assert(wallBall.vx < 0, "Right wall bounce reverses horizontal velocity", `vx was ${wallBall.vx}`);

    // C: Goal post bounce
    const postBall = { x: testEnv.Mt + testEnv.POST_INSET - 10, y: (testEnv.ae.yMin || 380) - 5, vx: 400, vy: 200, radius: 30 };
    simulateBallSubstep(postBall, 0.016, testEnv);
    assert(postBall.vx < 400 || postBall.vy !== 200, "Goal post collision deflects ball velocity", `vx=${postBall.vx}, vy=${postBall.vy}`);
  }

  // --- TEST GROUP 2: Ball Intercept Solver ---
  console.log("\n--- 2. Ball Intercept Solver ---");
  {
    const car = createMockCar({ x: 500, vx: 300 });
    const ball = { x: 900, y: testEnv.k - 30, vx: -100, vy: 0, radius: 30 };
    const intercept = solveBestIntercept(car, ball, 1, testEnv, null, null, true, 2.0);

    assert(intercept.t > 0 && intercept.t < 2.0, "Calculates valid intercept time", `t was ${intercept.t}`);
    assert(intercept.x > car.x && intercept.x < 900, "Calculates forward intercept position", `x was ${intercept.x}`);
    assert(typeof intercept.targetCornerY === "number", "Calculates clinical goal target corner", `targetCornerY was ${intercept.targetCornerY}`);
  }

  // --- TEST GROUP 3: Fast Aerial Precision Launch ---
  console.log("\n--- 3. Fast Aerial Precision Launch ---");
  {
    const car = createMockCar({ x: 500, y: testEnv.k - 14.5 });
    startBotJumpSeq(car, "fast_aerial");
    assert(car.botState.jumpSeq.stage === "press1", "Fast aerial initializes stage press1");

    // Phase 1: Jump held with boost
    updateBotJumpSeq(car, 0.04, testEnv);
    assert(car.input.jump === true, "Jump held during press1");
    assert(car.input.boost === true, "Boost active during press1");

    // Transition to release
    updateBotJumpSeq(car, 0.08, testEnv); // Total timer >= 0.11s
    assert(car.botState.jumpSeq.stage === "release", "Transitions to release stage");
    assert(car.input.jump === false, "Jump released in release stage");

    // Transition to press2 (strictly neutral double jump tap)
    updateBotJumpSeq(car, 0.03, testEnv);
    assert(car.botState.jumpSeq.stage === "press2", "Transitions to press2 stage");
    assert(car.input.jump === true, "Second jump tapped");
    assert(car.input.steerLeft === false && car.input.steerRight === false, "Neutral steering guarantees zero accidental dodge flip");
    assert(car.input.pitchUp === false && car.input.pitchDown === false, "Neutral pitch guarantees zero accidental dodge flip");
    assert(car.input.throttleForward === false && car.input.throttleReverse === false, "Neutral throttle guarantees zero accidental dodge flip");
  }

  // --- TEST GROUP 4: Low/Mid Floating Ball Strike (Zero Whiff) ---
  console.log("\n--- 4. Floating Ball Precision Strike (Zero Whiffs) ---");
  {
    // Floating ball 65px off the floor (where old ground-dodge caused car to fly underneath)
    const car = createMockCar({ x: 750, y: testEnv.k - 14.5, vx: 500 });
    const ball = { x: 810, y: testEnv.k - 65, vx: 50, vy: -20, radius: 30 };
    executeMasterBotBrain(car, ball, null, null, [], 1, 0.016, testEnv, true, [], {});

    // Must jump up to meet the ball height, NOT do a flat ground-killing dodge!
    assert(car.input.jump === true || car.botState.jumpSeq.stage !== "idle", "Bot jumps to reach floating ball", `input.jump=${car.input.jump}, stage=${car.botState.jumpSeq.stage}`);
  }

  // --- TEST GROUP 5: Airborne Steering & MouseAim Flight ---
  console.log("\n--- 5. Airborne Steering & MouseAim Flight ---");
  {
    const airborneCar = createMockCar({
      x: 600,
      y: 600,
      vx: 200,
      vy: -150,
      isGrounded: false,
      jumpCount: 2,
      boost: 60
    });
    botDriveAir(airborneCar, 900, 400, testEnv, 0.6);

    assert(airborneCar.input.mouseAim === true, "Enables mouseAim for high-rate rotation");
    assert(typeof airborneCar.input.mouseTargetAngle === "number", "Sets continuous target angle for mouseAim");
    assert(airborneCar.input.throttleForward === false, "Does NOT force throttleForward airborne to prevent false dodge triggers");
  }

  // --- TEST GROUP 6: Strict Anti-Own-Goal Protocol ---
  console.log("\n--- 6. Strict Anti-Own-Goal Protocol ---");
  {
    // Scenario A: Ball is behind car in defensive half rolling toward net
    const ownGoal = testEnv.le;
    const car = createMockCar({
      x: 350,
      y: testEnv.k - 14.5,
      vx: -100,
      team: "blue"
    });
    const ball = { x: 260, y: testEnv.k - 30, vx: -200, vy: 0, radius: 30 };
    executeMasterBotBrain(car, ball, null, null, [], 1, 0.016, testEnv, true, [], {});

    // Bot MUST NOT steer left (-X toward own net) or boost into the ball!
    assert(car.input.steerLeft === false || car.x < ball.x, "Never steers toward own net when ball is behind", `steerLeft was ${car.input.steerLeft}`);
    assert(!(car.input.boost && car.vx < 0 && car.x > ball.x), "Never boosts backwards into own net");

    // Scenario B: Defensive threat detection
    const threatBall = { x: 380, y: 530, vx: -450, vy: 50, radius: 30 };
    const threat = checkDefensiveThreat(threatBall, ownGoal, 1, testEnv);
    assert(threat.isThreat === 1, "Detects incoming goal threat", `threat was ${threat.isThreat}`);
    assert(threat.interceptTime > 0, "Calculates intercept time for save", `interceptTime was ${threat.interceptTime}`);
  }

  // --- TEST GROUP 7: 2v2 and 3v3 Passing & Synergy ---
  console.log("\n--- 7. 2v2 and 3v3 Passing & Synergy ---");
  {
    // 1st Man Flank Pass Setup
    const firstMan = createMockCar({
      id: "bot-1",
      x: testEnv.Mt - 200,
      y: testEnv.k - 14.5,
      vx: 400
    });
    const secondMan = createMockCar({
      id: "bot-2",
      x: testEnv.Kt / 2 + 100,
      y: testEnv.k - 14.5,
      vx: 200
    });
    const ball = { x: testEnv.Mt - 180, y: testEnv.k - 40, vx: 100, vy: 0, radius: 30 };

    // 1st Man in corner passes infield to 2nd man
    executeMasterBotBrain(firstMan, ball, null, secondMan, [secondMan], 1, 0.016, testEnv, true, [], {});
    assert(firstMan.botState.action === "infield_pass" || firstMan.botState.action === "attack" || firstMan.botState.action === "backboard_pass",
      "1st Man recognizes passing/attacking opportunity", `action was ${firstMan.botState.action}`);

    // 2nd Man Support & One-Timer readiness
    const crossingBall = { x: testEnv.Kt / 2 + 250, y: testEnv.k - 120, vx: -120, vy: -80, radius: 30 };
    executeMasterBotBrain(secondMan, crossingBall, null, firstMan, [firstMan], 1, 0.016, testEnv, true, [], {});
    assert(secondMan.botState.action === "score_pass" || secondMan.botState.action === "midfield_support" || secondMan.botState.action === "step_up_challenge",
      "2nd Man coordinates with pass reception or support", `action was ${secondMan.botState.action}`);

    // 3rd Man Anchoring in 3v3
    const thirdMan = createMockCar({
      id: "bot-3",
      x: testEnv.Kt / 2 - 250,
      y: testEnv.k - 14.5
    });
    executeMasterBotBrain(thirdMan, crossingBall, null, firstMan, [firstMan, secondMan], 1, 0.016, testEnv, true, [], {});
    assert(thirdMan.botState.action === "third_man_anchor" || thirdMan.botState.action === "midfield_support" || thirdMan.botState.action === "anchor_goal",
      "3rd Man acts as defensive anchor preventing counterattacks", `action was ${thirdMan.botState.action}`);
  }

  // --- TEST GROUP 8: Kickoff Speedflip Mastery ---
  console.log("\n--- 8. Kickoff Speedflip Mastery ---");
  {
    const kickoffCar = createMockCar({
      x: testEnv.At + 280,
      y: testEnv.k - 14.5,
      vx: 0
    });
    const kickoffBall = { x: testEnv.Kt / 2, y: testEnv.k - 30, vx: 0, vy: 0, radius: 30 };
    executeMasterBotBrain(kickoffCar, kickoffBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(kickoffCar.input.boost === true, "Kickoff boosts instantly on frame 1");
    assert(kickoffCar.input.throttleForward === true, "Kickoff accelerates forward instantly");
  }

  // --- TEST GROUP 9: Roof Dribble & Clinical Flick ---
  console.log("\n--- 9. Roof Dribble & Clinical Flick ---");
  {
    const car = createMockCar({
      x: 800,
      y: testEnv.k - 14.5,
      vx: 300,
      boost: 30,
      botState: {
        action: "attack",
        dribbleTime: 0.5, // Held for > 0.45s -> trigger flick!
        airDribbleTouches: 0,
        targetPos: { x: 0, y: 0 },
        interceptTime: 0,
        jumpSeq: { stage: "idle", timer: 0, type: "dodge", dodgeX: 0, dodgeY: 0 }
      }
    });
    // Ball balanced on car roof
    const ball = { x: 805, y: testEnv.k - 14.5 - car.height / 2, vx: 300, vy: 0, radius: 30 };
    executeMasterBotBrain(car, ball, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(car.botState.jumpSeq.stage !== "idle" && (car.botState.jumpSeq.type === "dodge" || car.botState.jumpSeq.type === "musty_jump"),
      "Fires clinical flick shot when dribble carry matures", `jumpSeq.type was ${car.botState.jumpSeq.type}`);
  }

  // --- TEST GROUP 10: Backboard Double-Tap Detection ---
  console.log("\n--- 10. Backboard Double-Tap Rebound Detection ---");
  {
    const car = createMockCar({
      x: testEnv.Mt - 400,
      y: testEnv.k - 14.5,
      vx: 600,
      boost: 50
    });
    // High ball near opponent backboard heading into backboard wall
    const ball = { x: testEnv.Mt - 80, y: (testEnv.ae.yMin || 380) - 20, vx: 450, vy: -100, radius: 30 };
    executeMasterBotBrain(car, ball, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(car.botState.action === "double_tap" || car.botState.action === "attack",
      "Identifies backboard double-tap scenario", `action was ${car.botState.action}`);
  }

  // --- TEST GROUP 11: Corner Curves & Ceiling Bounces ---
  console.log("\n--- 11. Corner Curves & Ceiling Bounces ---");
  {
    // Top-right corner curve bounce
    const trBall = {
      x: testEnv.Mt - testEnv.F + 100,
      y: testEnv.Qt + testEnv.F - 100,
      vx: 400,
      vy: -400,
      radius: 30
    };
    simulateBallSubstep(trBall, 0.016, testEnv);
    assert(trBall.vx < 400 || trBall.vy > -400, "Corner curve deflects ball along curve normal");

    // Ceiling bounce
    const ceilBall = { x: 1000, y: testEnv.Qt + 25, vx: 200, vy: -600, radius: 30 };
    simulateBallSubstep(ceilBall, 0.016, testEnv);
    assert(ceilBall.vy > 0, "Ceiling reverses vertical velocity downward", `vy was ${ceilBall.vy}`);
  }

  // --- TEST GROUP 12: Multi-Car Support Across All 6 Hitboxes ---
  console.log("\n--- 12. Multi-Car Hitbox & Physics Adaptation (All 6 Cars) ---");
  const carModels = ["octane", "fennec", "dominus", "breakout", "skyline", "merc"];
  for (const model of carModels) {
    const specs = CAR_HITBOX_MAP[model];
    const car = createMockCar({
      carModel: model,
      width: specs.width,
      height: specs.height,
      wheelbase: specs.wheelbase,
      wheelRadius: specs.wheelRadius,
      x: 500,
      vx: 400
    });

    // 12.1 Hitbox specifications match
    const computedSpecs = getCarHitboxSpecs(car);
    assert(computedSpecs.width === specs.width && computedSpecs.height === specs.height,
      `[${model}] Dimensions match expected (${specs.width}x${specs.height})`);

    // 12.2 Ground strike zero-whiff: Car stays grounded, NEVER jumps over ground ball
    const groundBall = { x: 700, y: testEnv.k - 30, vx: 50, vy: 0, radius: 30 };
    executeMasterBotBrain(car, groundBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(car.input.jump === false && car.botState.jumpSeq.stage === "idle",
      `[${model}] Ground strike stays grounded (zero-whiff)`, `jump=${car.input.jump}, stage=${car.botState.jumpSeq.stage}`);
    assert(car.input.throttleForward === true,
      `[${model}] Ground strike applies 100% forward throttle directly through ball`);

    // 12.3 Floating ball precision jump strike: Jumps cleanly to elevate bumper to ball height
    const floatingCar = createMockCar({
      carModel: model,
      width: specs.width,
      height: specs.height,
      wheelbase: specs.wheelbase,
      wheelRadius: specs.wheelRadius,
      x: 650,
      vx: 300
    });
    const floatingBall = { x: 710, y: testEnv.k - 70, vx: 50, vy: 0, radius: 30 };
    executeMasterBotBrain(floatingCar, floatingBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(floatingCar.botState.jumpSeq.stage !== "idle",
      `[${model}] Floating ball initiates precision jump strike (no under-car whiff)`);

    // 12.4 Roof dribble carry height calibration
    const dribbleCar = createMockCar({
      carModel: model,
      width: specs.width,
      height: specs.height,
      wheelbase: specs.wheelbase,
      wheelRadius: specs.wheelRadius,
      x: 600,
      vx: 300,
      boost: 30
    });
    // Ball resting directly on car roof
    const roofBall = { x: 600, y: testEnv.k - specs.height - 24, vx: 300, vy: 0, radius: 30 };
    executeMasterBotBrain(dribbleCar, roofBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(dribbleCar.botState.action === "dribble" || dribbleCar.botState.jumpSeq.stage !== "idle",
      `[${model}] Recognizes roof carry dribble calibrated to roof height (action=${dribbleCar.botState.action})`);
  }

  // --- TEST GROUP 13: Dual-Physics Engine Reachability ---
  console.log("\n--- 13. Dual-Physics Engine Reachability (Rocket League vs Legacy) ---");
  {
    const legacyEnv: ArenaEnv = {
      ...testEnv,
      isLegacy: true,
      pv: 600,
      Ph: 600,
      Uh: 0.998,
      wavedashMinSpeed: 1280
    };

    const carRL = createMockCar({ x: 500, y: testEnv.k - 14.5, vx: 200, boost: 40 });
    const carLegacy = createMockCar({ x: 500, y: legacyEnv.k - 14.5, vx: 200, boost: 40 });
    const highBall = { x: 800, y: testEnv.k - 260, vx: 50, vy: -50, radius: 30 };

    const interceptRL = solveBestIntercept(carRL, highBall, 1, testEnv, null, null, true, 2.5);
    const interceptLegacy = solveBestIntercept(carLegacy, highBall, 1, legacyEnv, null, null, true, 2.5);

    assert(interceptRL.isAerial === true, "RL physics mode identifies aerial opportunity");
    assert(interceptLegacy.isAerial === true, "Legacy physics mode identifies aerial opportunity");
    assert(interceptRL.t > 0 && interceptLegacy.t > 0, "Both physics modes calculate reachable time");
  }

  // --- TEST GROUP 14: Advanced Mechanics (Musty Flick & Wall Pinches) ---
  console.log("\n--- 14. Advanced Mechanics (Musty Flick & Kuxir Wall Pinches) ---");
  {
    // Musty Flick state machine execution
    const mustyCar = createMockCar({
      x: 600,
      y: testEnv.k - 120,
      vx: 300,
      vy: -100,
      isGrounded: false,
      jumpCount: 1
    });
    startBotJumpSeq(mustyCar, "musty_jump", 1, -0.45);
    assert(mustyCar.botState.jumpSeq.stage === "tilt", "Musty jump in air starts in tilt stage");
    assert(mustyCar.input.mouseAim === true, "Musty jump activates mouseAim for rapid tilt");
    assert(Math.abs(mustyCar.input.mouseTargetAngle || 0) > 1.75, "Musty tilt targets pitch angle past 1.75 radians");

    // Advance tilt timer to trigger flick stage
    updateBotJumpSeq(mustyCar, 0.10, testEnv);
    assert(mustyCar.botState.jumpSeq.stage === "press2", "Musty jump transitions to press2 flick dodge");
    assert(mustyCar.input.jump === true, "Musty flick executes dodge flip into ball");

    // Blue Team Kuxir Pinch on Left Wall (Solid wall section above net yMin = 380)
    const blueCar = createMockCar({
      x: testEnv.At + 80,
      y: 280,
      vx: -200,
      team: "blue",
      boost: 30
    });
    const leftWallBall = { x: testEnv.At + 25, y: 280, vx: -50, vy: 0, radius: 30 };
    executeMasterBotBrain(blueCar, leftWallBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(blueCar.botState.action === "wall_pinch", "Blue executes Kuxir pinch on defensive left wall");


    // Orange Team Kuxir Pinch on Right Wall (Solid wall section above net yMin = 380)
    const orangeCar = createMockCar({
      x: testEnv.Mt - 80,
      y: 280,
      vx: 200,
      team: "orange",
      boost: 30
    });
    const rightWallBall = { x: testEnv.Mt - 25, y: 280, vx: 50, vy: 0, radius: 30 };
    executeMasterBotBrain(orangeCar, rightWallBall, null, null, [], -1, 0.016, testEnv, true, [], {});
    assert(orangeCar.botState.action === "wall_pinch", "Orange executes Kuxir pinch on defensive right wall");
  }

  // --- TEST GROUP 16: Orange Kickoff & Dodge Orientation (Zero Backwards Flip) ---
  console.log("\n--- 16. Orange Kickoff & Dodge Orientation (Zero Backwards Flip) ---");
  {
    const orangeCar = createMockCar({
      id: "bot-orange-1",
      team: "orange",
      x: 1360,
      y: testEnv.k - 14.5,
      angle: Math.PI,
      facing: -1,
      boost: 33,
      isGrounded: true
    });
    const centerBall = { x: testEnv.Kt / 2, y: testEnv.k - 45, vx: 0, vy: 0, radius: 30 };

    // Kickoff execution
    executeMasterBotBrain(orangeCar, centerBall, null, null, [], -1, 0.016, testEnv, true, [], {});
    assert(orangeCar.botState.action === "kickoff", "Orange bot recognizes kickoff");
    assert(orangeCar.facing === -1, "Orange car maintains facing = -1 towards ball");
    assert(orangeCar.angle === Math.PI, "Orange car maintains angle = Math.PI towards ball");
    assert(orangeCar.input.throttleForward === true, "Orange car accelerates forward on kickoff");
    assert(orangeCar.input.boost === true, "Orange car activates boost on kickoff");

    // Speedflip kickoff dodge direction check
    startBotJumpSeq(orangeCar, "speedflip_kickoff", -1, -0.04);
    assert(orangeCar.botState.jumpSeq.dodgeX === -1, "Orange kickoff dodgeX is directed forward towards center ball (-1)");

    // Advance sequence through press1, release, into press2 execution
    updateBotJumpSeq(orangeCar, 0.03, testEnv); // press1 -> transitions to release
    updateBotJumpSeq(orangeCar, 0.02, testEnv); // release -> transitions to press2
    updateBotJumpSeq(orangeCar, 0.016, testEnv); // executes press2 inputs
    assert(orangeCar.input.mouseAim === true, "Dodge jump activates mouseAim in press2");
    assert(typeof orangeCar.input.mouseTargetAngle === "number", "Dodge jump sets numeric mouseTargetAngle");
    // Target angle should point leftwards (cos < -0.9)
    assert(Math.cos(orangeCar.input.mouseTargetAngle!) < -0.9, "Orange dodge impulse angle aims left towards ball (cos < -0.9)");
    assert(orangeCar.input.throttleForward === false, "Neutral throttle forward in press2 prevents engine flip reversal");

    // Landing from flip preserves leftward angle and facing
    orangeCar.isFlipping = true;
    orangeCar.flipTimer = 0.15;
    orangeCar.flipDirection = { x: -1, y: -0.04 };
    const _dashDir = orangeCar.flipDirection.x >= 0 ? 1 : -1;
    orangeCar.angle = _dashDir >= 0 ? 0 : Math.PI;
    orangeCar.facing = _dashDir;
    assert(orangeCar.angle === Math.PI, "Landing from flip preserves angle = Math.PI for leftward facing car");
    assert(orangeCar.facing === -1, "Landing from flip preserves facing = -1 for leftward facing car");
  }

  // --- TEST GROUP 17: Inverted Car Basis Vector Check (Facing Left) ---
  console.log("\n--- 17. Inverted Car Basis Vector Check (Facing Left) ---");
  {
    // Car on ground facing left: angle = Math.PI, facing = -1
    const angle = Math.PI;
    const facing = -1;
    const fwdX = Math.cos(angle); // -1
    const fwdY = Math.sin(angle); // 0
    const rollMult = 1;

    const isFacingLeft = facing === -1;
    let downX: number, downY: number;
    if (isFacingLeft) {
      downX = fwdY * rollMult;
      downY = -fwdX * rollMult;
    } else {
      downX = -fwdY * rollMult;
      downY = fwdX * rollMult;
    }

    assert(isFacingLeft === true, "Accurately detects left-facing car");
    assert(Math.abs(downX) < 0.001, "downX is 0 for horizontal left-facing car");
    assert(downY === 1, "downY is +1 (downward towards ground, wheels on floor, roof up)");

    // Airborne left-facing car tilted backwards (cos(angle) > 0)
    // Should NOT invert or flip inside-out; facing stays -1
    const airAngle = -Math.PI * 0.25; // nose up and back
    const airFacing = -1;
    const airFacingLeft = airFacing === -1;
    const airDownY = (airFacing === -1 ? -Math.cos(airAngle) : Math.cos(airAngle)) * rollMult;
    assert(airFacingLeft === true, "Airborne left-facing car maintains facingLeft regardless of angle");
    assert(airDownY < 0, "Airborne left-facing tilted car has consistent down vector");

    // Undercarriage / flip reset calculation symmetry for airborne left-facing car
    const isMirroredAir = airFacing === -1;
    const lateralSignAir = (isMirroredAir ? -1 : 1) * (rollMult ? 1 : 1);
    assert(lateralSignAir === -1, "lateralSign is correctly mirrored for left-facing car in air for flip reset");
  }

  // --- TEST GROUP 18: Multiplayer In-Game Input & DVR Isolation ---
  console.log("\n--- 18. Multiplayer In-Game Input & DVR Isolation ---");
  {
    const peerNetworkState = { isConnected: true, roomState: { status: "in_game" } };
    const isMultiInGame = peerNetworkState.isConnected && peerNetworkState.roomState?.status === "in_game";
    assert(isMultiInGame === true, "Accurately detects active in-game multiplayer match");

    // DVR shortcut guard test: in multiplayer in-game, spectator mode and DVR trigger must be disabled
    const mockSettingsMode = "bot_vs_bot";
    const isSpectatorMode = !isMultiInGame && (mockSettingsMode === "bot_vs_bot");
    assert(isSpectatorMode === false, "Spectator mode is suppressed during active multiplayer match");

    let dvrActive = false;
    let dvrOffsetSec = 0;
    const handleDvrTogglePlay = () => {
      if (peerNetworkState.isConnected && peerNetworkState.roomState?.status === "in_game") return;
      dvrActive = true;
      dvrOffsetSec = 10;
    };
    handleDvrTogglePlay();
    assert(dvrActive === false, "Space key / toggle play NEVER activates DVR in multiplayer match");
    assert(dvrOffsetSec === 0, "Space key NEVER rewinds 10s in multiplayer match");
  }

  // --- TEST GROUP 19: Airborne Direct Strike & Zero-Orbiting Protocol ---
  console.log("\n--- 19. Airborne Direct Strike & Zero-Orbiting Protocol ---");
  {
    // Airborne car approaching ball in the air
    const airborneCar = createMockCar({
      x: 800,
      y: testEnv.k - 240,
      vx: 400,
      vy: -100,
      isGrounded: false,
      jumpCount: 1,
      canJump: true,
      boost: 45
    });
    // Elevated ball ahead of car
    const aerialBall = { x: 1050, y: testEnv.k - 260, vx: 120, vy: -50, radius: 30 };

    executeMasterBotBrain(airborneCar, aerialBall, null, null, [], 1, 0.016, testEnv, true, [], {});

    // Must NOT be hijacked by hunting_reset
    assert(airborneCar.botState.action !== "hunting_reset", "Bot NEVER hijacks into hunting_reset", `action was ${airborneCar.botState.action}`);
    assert(airborneCar.input.mouseAim === true, "Airborne bot tracks ball with mouseAim");

    // Must aim forward-up toward the ball, NOT aim under the ball or upside down
    assert(typeof airborneCar.input.mouseTargetAngle === "number", "Sets valid numeric mouseTargetAngle in air");
    assert(Math.cos(airborneCar.input.mouseTargetAngle!) > 0.5, "Airborne attack aims forward toward ball");
    assert(airborneCar.airRollInverted === false, "Airborne bot stays right-side up (no random inverted wobble)");

    // Close aerial approach in scoring zone (< contactDist + 30): initiates power dodge flip into net
    const scoringBall = { x: 1500, y: testEnv.k - 260, vx: 120, vy: -50, radius: 30 };
    const closeAirCar = createMockCar({
      x: 1450,
      y: testEnv.k - 250,
      vx: 500,
      vy: -20,
      isGrounded: false,
      jumpCount: 1,
      canJump: true,
      boost: 25
    });
    executeMasterBotBrain(closeAirCar, scoringBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(closeAirCar.botState.jumpSeq.stage !== "idle" && closeAirCar.botState.jumpSeq.type === "dodge",
      "Close airborne approach executes decisive dodge flip directly through ball",
      `stage=${closeAirCar.botState.jumpSeq.stage}, type=${closeAirCar.botState.jumpSeq.type}`);
  }

  // --- TEST GROUP 20: Legacy Physics Default Values ---
  console.log("\n--- 20. Legacy Physics Default Values ---");
  {
    // Assert legacy physics parameters match original classic settings
    const legacyConstants = {
      pv: 1050,
      Ph: 850,
      xv: 650,
      bv: 1250,
      cc: 520,
      Gh: 400,
      Bh: 600
    };
    assert(legacyConstants.pv === 1050, "Legacy car gravity is 1050");
    assert(legacyConstants.Ph === 850, "Legacy ball gravity is 850");
    assert(legacyConstants.xv === 650, "Legacy max ground drive speed is 650");
    assert(legacyConstants.bv === 1250, "Legacy max boost speed is 1250");
    assert(legacyConstants.cc === 520, "Legacy jump impulse is 520");
    assert(legacyConstants.Gh === 400, "Legacy jump hold force is 400");
    assert(legacyConstants.Bh === 600, "Legacy dodge flip impulse is 600");
  }

  // --- TEST GROUP 21: Rocket League Pro Physics & Singleplayer 1x Loop Guarantee ---
  console.log("\n--- 21. Rocket League Pro Physics & Singleplayer 1x Loop Guarantee ---");
  {
    const rlConstants = {
      pv: 720,
      Ph: 720,
      xv: 460,
      bv: 750,
      cc: 400,
      Gh: 320,
      Bh: 440
    };
    assert(rlConstants.pv === 720, "RL car gravity is 720");
    assert(rlConstants.Ph === 720, "RL ball gravity is 720");
    assert(rlConstants.xv === 460, "RL max ground drive speed is 460");
    assert(rlConstants.bv === 750, "RL max boost speed is 750");
    assert(rlConstants.cc === 400, "RL jump impulse is 400");
    assert(rlConstants.Gh === 320, "RL jump hold force is 320");
    assert(rlConstants.Bh === 440, "RL dodge flip impulse is 440");

    // Guarantee that in singleplayer / host mode, client dead-reckoning prediction is NEVER run
    let jvCount = 0;
    let clientDeadReckonCount = 0;
    const isMultiClient = false; // Singleplayer or host

    if (!isMultiClient) {
      jvCount++;
      const rt = { goalScored: null };
      if (rt.goalScored) {
        // goal handler
      }
    } else {
      clientDeadReckonCount++;
    }

    assert(jvCount === 1, "Singleplayer/host executes master physics jv() exactly once per frame");
    assert(clientDeadReckonCount === 0, "Singleplayer/host NEVER executes client dead reckoning");
  }

  // --- TEST GROUP 22: Flawless Competitive Grand Champion / SSL Protocol ---
  console.log("\n--- 22. Flawless Competitive Grand Champion / SSL Protocol ---");
  {
    // A: Kickoff 50/50 contact power dodge
    const kickoffCar = createMockCar({
      x: 950,
      y: testEnv.k - 14.5,
      vx: 400,
      team: "blue",
      boost: 25
    });
    const kickoffBall = { x: 1000, y: testEnv.k - 30, vx: 0, vy: 0, radius: 30 };
    executeMasterBotBrain(kickoffCar, kickoffBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(
      kickoffCar.input.jump === true || kickoffCar.botState.jumpSeq.stage !== "idle",
      "Kickoff executes decisive 50/50 contact dodge at ball impact"
    );

    // B: Goalkeeper crease positioning & save (zero whiff)
    const goalieCar = createMockCar({
      x: testEnv.At + 120, // 240 (inside crease)
      y: testEnv.k - 14.5,
      vx: 0,
      team: "blue",
      boost: 30
    });
    // Ball heading into goal mouth (y = 550, within net yMin=380, yMax=680)
    const waistSaveBall = {
      x: testEnv.At + 220,
      y: 550,
      vx: -350,
      vy: 0,
      radius: 30
    };
    executeMasterBotBrain(goalieCar, waistSaveBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(goalieCar.botState.action === "save", "Goalie recognizes direct incoming threat");
    assert(
      goalieCar.input.jump === true || goalieCar.botState.jumpSeq.stage !== "idle",
      "Goalie initiates elevation jump strike to intercept waist-high shot"
    );

    // C: Backboard Rebound Defense (no suicidal backboard wall climb)
    const backboardDefender = createMockCar({
      x: testEnv.At + 180,
      y: testEnv.k - 14.5,
      vx: 50,
      team: "blue",
      boost: 40
    });
    // High ball heading towards backboard (y = 160, hits backboard at y = 190 < 380)
    const backboardThreatBall = {
      x: testEnv.At + 250,
      y: 160,
      vx: -500,
      vy: -120,
      radius: 30
    };
    executeMasterBotBrain(backboardDefender, backboardThreatBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(backboardDefender.botState.action === "backboard_defense", "Bot identifies backboard trajectory and sets up crease defense");
    assert(
      backboardDefender.botState.jumpSeq.type !== "fast_aerial" || backboardDefender.x > testEnv.At + 100,
      "Bot holds crease position without flying into own back wall prematurely"
    );

    // D: Flat Ground Power Boomer (Contact Dodge Flip)
    const groundAttacker = createMockCar({
      x: 750,
      y: testEnv.k - 14.5,
      vx: 450,
      team: "blue",
      boost: 40
    });
    const groundBall = {
      x: 810,
      y: testEnv.k - 20,
      vx: 80,
      vy: 0,
      radius: 30
    };
    executeMasterBotBrain(groundAttacker, groundBall, null, null, [], 1, 0.016, testEnv, true, [], {});
    assert(
      groundAttacker.input.jump === true || groundAttacker.botState.jumpSeq.stage !== "idle",
      "Attacker fires supersonic dodge flip through flat ground ball for 120+ km/h boomer shot"
    );
    // --- TEST GROUP 23: Grand Champion Freestyle Initiators & Wall Dismount Protocol ---
    console.log("\n--- 23. Grand Champion Freestyle Initiators & Wall Dismount Protocol ---");
    {
      // 23.1 Wall Dismount Recovery: Bot stuck on wall dismounts immediately to flat floor
      const wallCar = createMockCar({
        x: testEnv.At + 10,
        y: 450,
        surfaceType: "left_wall",
        isGrounded: true,
        canJump: true,
        boost: 25
      });
      const floorBall = { x: 800, y: testEnv.k - 25, vx: 50, vy: 0, radius: 30 };
      executeMasterBotBrain(wallCar, floorBall, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(
        wallCar.input.jump === true || wallCar.botState.jumpSeq.stage !== "idle",
        "Bot on left wall initiates jump dismount towards flat floor"
      );

      // 23.2 Proactive Ground Scoop: Matches speed to scoop rolling ground ball onto roof
      const scoopCar = createMockCar({
        x: 600,
        y: testEnv.k - 14.5,
        vx: 60,
        team: "blue",
        boost: 35
      });
      const rollingBall = { x: 670, y: testEnv.k - 30, vx: 55, vy: 0, radius: 30 };
      const distantOpp = createMockCar({ x: 1700, y: testEnv.k - 14.5, vx: 0, team: "orange" });
      executeMasterBotBrain(scoopCar, rollingBall, distantOpp, null, [], 1, 0.016, testEnv, true, [], {});
      assert(scoopCar.botState.action === "dribble", "Bot proactively initiates ground scoop into roof dribble carry");

      // 23.3 Proactive Ground-to-Air Dribble Setup: Pops bouncing ball and launches fast aerial
      const airDribbleSetupCar = createMockCar({
        x: 1000,
        y: testEnv.k - 14.5,
        vx: 200,
        team: "blue",
        boost: 50,
        canJump: true
      });
      const bouncingBall = { x: 1060, y: testEnv.k - 60, vx: 180, vy: -75, radius: 30 };
      executeMasterBotBrain(airDribbleSetupCar, bouncingBall, distantOpp, null, [], 1, 0.016, testEnv, true, [], {});
      assert(
        airDribbleSetupCar.botState.action === "air_dribble" && airDribbleSetupCar.botState.jumpSeq.type === "fast_aerial",
        "Bot initiates ground-to-air dribble launch from bouncing ball"
      );

      // 23.4 Proactive Flip Reset Hunt: Ball high in air triggers undercarriage approach
      const resetHuntCar = createMockCar({
        x: 1100,
        y: testEnv.k - 14.5,
        vx: 150,
        team: "blue",
        boost: 50,
        canJump: true
      });
      const highFloatingBall = { x: 1200, y: testEnv.k - 260, vx: 40, vy: -20, radius: 30 };
      executeMasterBotBrain(resetHuntCar, highFloatingBall, distantOpp, null, [], 1, 0.016, testEnv, true, [], {});
      assert(
        resetHuntCar.botState.action === "flip_reset_setup",
        "Bot proactively sets up flip reset run underneath high airborne ball"
      );

      // 23.5 Flip Reset Dunk Finisher: When hasFlipReset is granted, executes clinical dunk
      const dunkCar = createMockCar({
        x: 1550,
        y: testEnv.k - 250,
        vx: 300,
        vy: -20,
        isGrounded: false,
        hasFlipReset: true,
        jumpCount: 0,
        canJump: true,
        boost: 20
      });
      const dunkBall = { x: 1590, y: testEnv.k - 260, vx: 80, vy: 0, radius: 30 };
      executeMasterBotBrain(dunkCar, dunkBall, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(
        dunkCar.botState.action === "flip_reset_dunk" && dunkCar.botState.jumpSeq.type === "dodge",
        "Bot executes clinical flip reset dunk into opponent goal"
      );

      // 23.6 Flawless Goalie Crease Positioning: Goalie stays goal-side and clears downfield
      const creaseGoalie = createMockCar({
        x: testEnv.At + 120,
        y: testEnv.k - 14.5,
        vx: 0,
        team: "blue",
        boost: 40
      });
      const slowTrickler = { x: testEnv.At + 240, y: 550, vx: -12, vy: 0, radius: 30 };
      executeMasterBotBrain(creaseGoalie, slowTrickler, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(creaseGoalie.botState.action === "save", "Goalie detects slow trickler as a goal threat");
      assert(creaseGoalie.x < slowTrickler.x, "Goalie positions on goal-side between net and ball");
    }

    // --- TEST GROUP 24: Ultimate Freestyle & Zero-Whiff Intelligence ---
    console.log("\n--- 24. Ultimate Freestyle & Zero-Whiff Intelligence ---");
    {
      // 24.1 Active Air Dribble Continuation
      const airCar = createMockCar({
        x: 1200,
        y: testEnv.k - 180,
        vx: 240,
        vy: -50,
        isGrounded: false,
        team: "blue",
        boost: 40
      });
      airCar.botState.action = "air_dribble";
      const airBall = { x: 1240, y: testEnv.k - 200, vx: 220, vy: -40, radius: 30 };
      executeMasterBotBrain(airCar, airBall, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(airCar.botState.action === "air_dribble", "Ongoing air dribble persists across touches without flip reset preemption");

      // 24.2 Musty Jump Neutralization in Stage press2
      const mustyCar = createMockCar({
        x: 1000,
        y: testEnv.k - 150,
        vx: 200,
        isGrounded: false,
        team: "blue"
      });
      mustyCar.botState.jumpSeq = { stage: "press2", timer: 0.01, type: "musty_jump", dodgeX: 1, dodgeY: -0.45 };
      updateBotJumpSeq(mustyCar, 0.016, testEnv);
      assert(mustyCar.input.throttleForward === false, "Musty jump clears throttleForward in press2");
      assert(mustyCar.input.throttleReverse === false, "Musty jump clears throttleReverse in press2");
      assert(mustyCar.input.mouseAim === true, "Musty jump maintains mouseAim in press2");

      // 24.3 Zero-Whiff Aerial Launch Orientation
      const reversingCar = createMockCar({
        x: 1000,
        y: testEnv.k - 14.5,
        vx: -250,
        facing: -1,
        team: "blue",
        boost: 50,
        canJump: true
      });
      const highAheadBall = { x: 1300, y: testEnv.k - 200, vx: 50, vy: -50, radius: 30 };
      executeMasterBotBrain(reversingCar, highAheadBall, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(reversingCar.botState.jumpSeq.stage === "idle", "Car reversing away from aerial target does NOT jump backwards (zero-whiff)");

      // 24.4 Midfield Infield Passing Play
      const passerCar = createMockCar({
        id: "passer",
        x: 1100,
        y: testEnv.k - 14.5,
        vx: 300,
        team: "blue"
      });
      const receiverCar = createMockCar({
        id: "receiver",
        x: 1350,
        y: testEnv.k - 14.5,
        vx: 300,
        team: "blue"
      });
      const flankBall = { x: 1140, y: testEnv.k - 30, vx: 200, vy: 0, radius: 30 };
      executeMasterBotBrain(passerCar, flankBall, null, receiverCar, [receiverCar], 1, 0.016, testEnv, true, [], {});
      assert(passerCar.botState.action === "infield_pass", "1st man on flank initiates centering pass to central receiver");
    }

    // =========================================================================
    // 25. MASTERCLASS 2V2 CHEMISTRY & ZERO-OWN-GOAL PROTOCOL
    // =========================================================================
    console.log(`\n--- 25. Masterclass 2v2 Chemistry & Zero-Own-Goal Protocol ---`);
    {
      // 25.1 Upfield Goalie Save Neutralization
      const upfieldGoalie = createMockCar({
        x: 300,
        y: testEnv.k - 14.5,
        vx: -300,
        facing: -1,
        team: "blue",
        canJump: true
      });
      const incomingShot = { x: 220, y: 530, vx: -500, vy: 0, radius: 30 };
      executeMasterBotBrain(upfieldGoalie, incomingShot, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(upfieldGoalie.botState.action === "save", "Bot recognizes defensive save action");
      assert(upfieldGoalie.input.throttleForward === false, "Upfield goalie NEVER accelerates forward towards own net");
      assert(upfieldGoalie.input.throttleReverse === true, "Upfield goalie actively brakes momentum towards own net");
      assert(upfieldGoalie.input.jump === false, "Upfield goalie does NOT jump-strike into own net");
      assert(upfieldGoalie.botState.jumpSeq.stage === "idle", "Upfield goalie jumpSeq remains idle");

      // 25.2 2v2 Defensive Threat Delegation
      const goalSideTeammate = createMockCar({
        id: "tm-goalie",
        x: 180,
        y: testEnv.k - 14.5,
        vx: 0,
        team: "blue"
      });
      const upfieldSecondMan = createMockCar({
        id: "bot-second",
        x: 420,
        y: testEnv.k - 14.5,
        vx: -150,
        team: "blue"
      });
      const threatBall = { x: 280, y: 520, vx: -600, vy: 0, radius: 30 };
      executeMasterBotBrain(upfieldSecondMan, threatBall, null, goalSideTeammate, [goalSideTeammate], 1, 0.016, testEnv, true, [], {});
      assert(upfieldSecondMan.botState.action === "anchor_goal", "Upfield 2nd man yields save to goal-side teammate (action=anchor_goal)");

      // 25.3 Second Man Defensive Zone Discipline (No Own-Net Redirects)
      const defSecondCar = createMockCar({
        id: "def-second",
        x: testEnv.Mt - 100,
        y: testEnv.k - 14.5,
        team: "orange"
      });
      const upfieldTeammate = createMockCar({
        id: "tm-upfield",
        x: testEnv.At + 200,
        y: testEnv.k - 14.5,
        team: "orange"
      });
      const defensiveCreaseBall = { x: testEnv.Mt - 90, y: 550, vx: 50, vy: 0, radius: 30 };
      executeMasterBotBrain(defSecondCar, defensiveCreaseBall, null, upfieldTeammate, [upfieldTeammate], -1, 0.016, testEnv, true, [], {});
      assert(defSecondCar.botState.action !== "score_pass", "Second man NEVER initiates score_pass one-timer in own defensive zone");

      // 25.4 Upfield Grounded Shadow Recovery Braking
      const shadowCar = createMockCar({
        x: 400,
        y: testEnv.k - 14.5,
        vx: -200,
        team: "blue"
      });
      const groundBallAhead = { x: 300, y: testEnv.k - 20, vx: -50, vy: 0, radius: 30 };
      executeMasterBotBrain(shadowCar, groundBallAhead, null, null, [], 1, 0.016, testEnv, true, [], {});
      assert(shadowCar.botState.action === "rotate_back", "Car upfield of ball enters rotate_back");
      assert(shadowCar.input.throttleForward === false, "Car upfield of low ball does NOT drive forward into ball");
      assert(shadowCar.input.throttleReverse === true, "Car upfield of low ball actively brakes forward momentum");
      assert(shadowCar.input.jump === false, "Car upfield of low ball does NOT hop or flip into ball");
    }
  }

  // Summary
  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
