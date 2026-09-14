import { CustomizationItem, CrateDefinition, ItemRarity } from "./customizationTypes";

export const RARITY_CONFIG: Record<
  ItemRarity,
  {
    name: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
    glowColor: string;
    badgeBg: string;
    dropWeight: number; // For crate spinning roulette probability
  }
> = {
  common: {
    name: "Common",
    textColor: "text-slate-300",
    bgColor: "bg-slate-800/80",
    borderColor: "border-slate-600",
    glowColor: "rgba(148, 163, 184, 0.4)",
    badgeBg: "bg-slate-700 text-slate-200",
    dropWeight: 48
  },
  rare: {
    name: "Rare",
    textColor: "text-sky-400",
    bgColor: "bg-sky-950/70",
    borderColor: "border-sky-500",
    glowColor: "rgba(56, 189, 248, 0.5)",
    badgeBg: "bg-sky-900 text-sky-200",
    dropWeight: 28
  },
  very_rare: {
    name: "Very Rare",
    textColor: "text-purple-400",
    bgColor: "bg-purple-950/70",
    borderColor: "border-purple-500",
    glowColor: "rgba(168, 85, 247, 0.6)",
    badgeBg: "bg-purple-900 text-purple-200",
    dropWeight: 14
  },
  import: {
    name: "Import",
    textColor: "text-rose-400",
    bgColor: "bg-rose-950/70",
    borderColor: "border-rose-500",
    glowColor: "rgba(244, 63, 94, 0.7)",
    badgeBg: "bg-rose-900 text-rose-100",
    dropWeight: 6.5
  },
  exotic: {
    name: "Exotic",
    textColor: "text-amber-400",
    bgColor: "bg-amber-950/70",
    borderColor: "border-amber-400",
    glowColor: "rgba(251, 191, 36, 0.8)",
    badgeBg: "bg-amber-800 text-amber-100",
    dropWeight: 2.7
  },
  black_market: {
    name: "Black Market",
    textColor: "text-fuchsia-300 animate-pulse",
    bgColor: "bg-fuchsia-950/80",
    borderColor: "border-fuchsia-400",
    glowColor: "rgba(217, 70, 239, 0.95)",
    badgeBg: "bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-black",
    dropWeight: 0.8
  }
};

export const ITEM_CATALOG: Record<string, CustomizationItem> = {
  // === BODIES ===
  body_octane: {
    id: "body_octane",
    name: "Octane",
    slot: "body",
    rarity: "common",
    description: "The beloved competitive flagship. Slanted buggy nose, exposed engine block, and high aerofoil.",
    badge: "Classic",
    accentColor: "#f59e0b",
    visualData: { modelId: "octane" }
  },
  body_fennec: {
    id: "body_fennec",
    name: "Fennec",
    slot: "body",
    rarity: "rare",
    description: "Compact rally hot-hatch with pristine boxy geometry and unmatched flick alignment.",
    badge: "Pro Pick",
    accentColor: "#38bdf8",
    visualData: { modelId: "fennec" }
  },
  body_dominus: {
    id: "body_dominus",
    name: "Dominus",
    slot: "body",
    rarity: "rare",
    description: "American muscle with low paddle hood, supercharger scoop, and devastating 45° flick reach.",
    badge: "Muscle",
    accentColor: "#f43f5e",
    visualData: { modelId: "dominus" }
  },
  body_breakout: {
    id: "body_breakout",
    name: "Breakout",
    slot: "body",
    rarity: "rare",
    description: "Ultra-sharp wedge supercar. The longest chassis hitbox for devastating ceiling pinches.",
    badge: "Long reach",
    accentColor: "#c084fc",
    visualData: { modelId: "breakout" }
  },
  body_skyline: {
    id: "body_skyline",
    name: "Skyline GT-R",
    slot: "body",
    rarity: "very_rare",
    description: "Iconic R34 GT-R coupe. Flared fenders, twin vinyl stripes, and aggressive intercooler.",
    badge: "JDM Legend",
    accentColor: "#60a5fa",
    visualData: { modelId: "skyline" }
  },
  body_merc: {
    id: "body_merc",
    name: "Merc",
    slot: "body",
    rarity: "rare",
    description: "Tall heavy van hitbox. Unbeatable 50/50 presence and impenetrable goal line saves.",
    badge: "Brick Wall",
    accentColor: "#34d399",
    visualData: { modelId: "merc" }
  },
  body_tw_octane: {
    id: "body_tw_octane",
    name: "Titanium White Octane",
    slot: "body",
    rarity: "import",
    description: "Pristine pearl-white body trims and bright platinum chrome highlights. The grail car.",
    badge: "Titanium White",
    accentColor: "#ffffff",
    visualData: { modelId: "octane", decalPattern: "stripe", decalSecondary: "#ffffff" }
  },
  body_cyber_fennec: {
    id: "body_cyber_fennec",
    name: "Cyberpunk Fennec",
    slot: "body",
    rarity: "import",
    description: "High-tech synthwave edition with cyan neon outline conduits and digital dashboard.",
    badge: "Cyber Edition",
    accentColor: "#06b6d4",
    visualData: { modelId: "fennec", decalPattern: "cyber", decalSecondary: "#06b6d4" }
  },
  body_gold_dominus: {
    id: "body_gold_dominus",
    name: "24K Gold Dominus",
    slot: "body",
    rarity: "exotic",
    description: "Solid 24-karat gold plating with mirror reflective finish. Supreme luxury on four wheels.",
    badge: "Pure Gold",
    accentColor: "#fbbf24",
    visualData: { modelId: "dominus", decalPattern: "gold", decalSecondary: "#fbbf24" }
  },

  // === DECALS ===
  decal_none: {
    id: "decal_none",
    name: "Stock Clean",
    slot: "decal",
    rarity: "common",
    description: "Clean team color finish without exterior livery decals.",
    visualData: { decalPattern: "stripe" }
  },
  decal_stripes: {
    id: "decal_stripes",
    name: "Racing Stripes",
    slot: "decal",
    rarity: "common",
    description: "Twin bold racing stripes extending down hood and roof.",
    visualData: { decalPattern: "stripe", decalSecondary: "#ffffff" }
  },
  decal_flames: {
    id: "decal_flames",
    name: "Hellfire Flames",
    slot: "decal",
    rarity: "rare",
    description: "Aggressive flame licks extending from the front wheel arches.",
    accentColor: "#f97316",
    visualData: { decalPattern: "flame", decalSecondary: "#f97316" }
  },
  decal_carbon: {
    id: "decal_carbon",
    name: "Carbon Fibre Weave",
    slot: "decal",
    rarity: "rare",
    description: "Lightweight woven carbon fiber hood, side skirts, and rear spoiler.",
    accentColor: "#64748b",
    visualData: { decalPattern: "carbon", decalSecondary: "#334155" }
  },
  decal_galaxy: {
    id: "decal_galaxy",
    name: "Galaxy Nebula",
    slot: "decal",
    rarity: "very_rare",
    description: "Animated cosmic nebula clouds with twinkling stellar dust.",
    accentColor: "#c084fc",
    visualData: { decalPattern: "galaxy", decalSecondary: "#a855f7" }
  },
  decal_dragon: {
    id: "decal_dragon",
    name: "Dragon Breath",
    slot: "decal",
    rarity: "import",
    description: "Mythical coiled eastern dragon with glowing crimson eyes and scales.",
    accentColor: "#ef4444",
    visualData: { decalPattern: "dragon", decalSecondary: "#ef4444" }
  },
  decal_cyber: {
    id: "decal_cyber",
    name: "Circuit Overload",
    slot: "decal",
    rarity: "import",
    description: "Animated neon PCB circuit traces coursing across body panels.",
    accentColor: "#06b6d4",
    visualData: { decalPattern: "cyber", decalSecondary: "#06b6d4" }
  },
  decal_gold_leaf: {
    id: "decal_gold_leaf",
    name: "24K Gold Leaf",
    slot: "decal",
    rarity: "black_market",
    description: "Opulent gilded filigree and liquid gold veins illuminating the car.",
    accentColor: "#fbbf24",
    visualData: { decalPattern: "gold", decalSecondary: "#fbbf24" }
  },

  // === WHEELS ===
  wheel_oem: {
    id: "wheel_oem",
    name: "OEM Standard",
    slot: "wheels",
    rarity: "common",
    description: "Factory standard alloy rims with rugged compound rubber.",
    visualData: { wheelStyle: "oem", rimColor: "#94a3b8" }
  },
  wheel_cristiano: {
    id: "wheel_cristiano",
    name: "Cristiano Sleek",
    slot: "wheels",
    rarity: "rare",
    description: "The pro standard pitch-black 5-spoke lightweight competition rims.",
    accentColor: "#1e293b",
    visualData: { wheelStyle: "cristiano", rimColor: "#0f172a" }
  },
  wheel_astro: {
    id: "wheel_astro",
    name: "Astro-Star CSX",
    slot: "wheels",
    rarity: "very_rare",
    description: "Radial starburst geometry with polished titanium rim accents.",
    accentColor: "#38bdf8",
    visualData: { wheelStyle: "astro", rimColor: "#38bdf8", glowHex: "#38bdf8" }
  },
  wheel_apex: {
    id: "wheel_apex",
    name: "Apex Prismatic",
    slot: "wheels",
    rarity: "exotic",
    description: "Aerodynamic turbine wheels with radiant color-shifting cyan ring glow.",
    accentColor: "#06b6d4",
    visualData: { wheelStyle: "apex", rimColor: "#06b6d4", glowHex: "#22d3ee" }
  },
  wheel_draco: {
    id: "wheel_draco",
    name: "Draco Inferno",
    slot: "wheels",
    rarity: "exotic",
    description: "Breathing fire rims with molten magma dragon heads spewing fiery sparks.",
    accentColor: "#f97316",
    visualData: { wheelStyle: "draco", rimColor: "#ea580c", glowHex: "#f97316" }
  },
  wheel_hologram: {
    id: "wheel_hologram",
    name: "Holographic Matrix",
    slot: "wheels",
    rarity: "black_market",
    description: "Floating solid-light holographic spokes that distort local space.",
    accentColor: "#d946ef",
    visualData: { wheelStyle: "hologram", rimColor: "#d946ef", glowHex: "#e879f9" }
  },

  // === BOOST TRAILS ===
  boost_standard: {
    id: "boost_standard",
    name: "Standard Thruster",
    slot: "boost",
    rarity: "common",
    description: "Classic dual rocket ignition exhaust trail.",
    visualData: { boostStyle: "standard", boostColor: "#38bdf8" }
  },
  boost_plasma: {
    id: "boost_plasma",
    name: "Ion Plasma",
    slot: "boost",
    rarity: "rare",
    description: "Superheated ionized teal gas trail with crackling energy sparks.",
    accentColor: "#2dd4bf",
    visualData: { boostStyle: "plasma", boostColor: "#2dd4bf" }
  },
  boost_flamethrower: {
    id: "boost_flamethrower",
    name: "Flamethrower Red",
    slot: "boost",
    rarity: "very_rare",
    description: "Raw napalm ignition roaring with deep orange and red plume fire.",
    accentColor: "#ef4444",
    visualData: { boostStyle: "flamethrower", boostColor: "#ef4444" }
  },
  boost_rainbow: {
    id: "boost_rainbow",
    name: "Rainbow Prism",
    slot: "boost",
    rarity: "import",
    description: "Chroma shifting spectrum ribbon trailing behind supersonic maneuvers.",
    accentColor: "#ec4899",
    visualData: { boostStyle: "rainbow", boostColor: "#ec4899" }
  },
  boost_electro: {
    id: "boost_electro",
    name: "Electro Beam",
    slot: "boost",
    rarity: "exotic",
    description: "High-voltage lightning arcs and electromagnetic sonic booms.",
    accentColor: "#a855f7",
    visualData: { boostStyle: "electro", boostColor: "#a855f7" }
  },
  boost_sakura: {
    id: "boost_sakura",
    name: "Sakura Cherry Blossom",
    slot: "boost",
    rarity: "black_market",
    description: "Drifting ethereal pink cherry blossom petals woven in glowing starlight.",
    accentColor: "#f472b6",
    visualData: { boostStyle: "sakura", boostColor: "#f472b6" }
  },

  // === GOAL EXPLOSIONS ===
  ge_standard: {
    id: "ge_standard",
    name: "Standard Blast",
    slot: "goal_explosion",
    rarity: "common",
    description: "High-yield stadium shockwave knocking back nearby cars.",
    visualData: { explosionStyle: "standard", explosionColor: "#f59e0b" }
  },
  ge_electro: {
    id: "ge_electro",
    name: "Electroshock",
    slot: "goal_explosion",
    rarity: "very_rare",
    description: "Gigawatt thunderbolts branching across the net mesh with deep thunder.",
    accentColor: "#38bdf8",
    visualData: { explosionStyle: "electro", explosionColor: "#38bdf8" }
  },
  ge_hellfire: {
    id: "ge_hellfire",
    name: "Hellfire Eruption",
    slot: "goal_explosion",
    rarity: "import",
    description: "Giant flaming skull bursting from the net with brimstone debris.",
    accentColor: "#ef4444",
    visualData: { explosionStyle: "hellfire", explosionColor: "#ef4444" }
  },
  ge_supernova: {
    id: "ge_supernova",
    name: "Supernova Stellar",
    slot: "goal_explosion",
    rarity: "exotic",
    description: "A collapsing dwarf star exploding into brilliant iridescent planetary rings.",
    accentColor: "#fbbf24",
    visualData: { explosionStyle: "supernova", explosionColor: "#fbbf24" }
  },
  ge_singularity: {
    id: "ge_singularity",
    name: "Singularity Vortex",
    slot: "goal_explosion",
    rarity: "black_market",
    description: "Gravitational black hole warping the pitch and pulling reality inward.",
    accentColor: "#d946ef",
    visualData: { explosionStyle: "singularity", explosionColor: "#d946ef" }
  },
  ge_pixel: {
    id: "ge_pixel",
    name: "8-Bit Pixel Poof",
    slot: "goal_explosion",
    rarity: "rare",
    description: "Retro 8-bit arcade explosion with pixel blocks cascading across the goal.",
    accentColor: "#10b981",
    visualData: { explosionStyle: "pixel", explosionColor: "#10b981" }
  },

  // === TOPPERS ===
  topper_none: {
    id: "topper_none",
    name: "No Topper",
    slot: "topper",
    rarity: "common",
    description: "Bare aerodynamic roof.",
    visualData: {}
  },
  topper_halo: {
    id: "topper_halo",
    name: "Angelic Halo",
    slot: "topper",
    rarity: "very_rare",
    description: "A floating golden halo gently hovering and bobbing above your car roof.",
    accentColor: "#fbbf24",
    visualData: { topperStyle: "halo", topperColor: "#fef08a" }
  },
  topper_crown: {
    id: "topper_crown",
    name: "Crown of Champions",
    slot: "topper",
    rarity: "import",
    description: "Royal golden crown embedded with ruby and sapphire jewels.",
    accentColor: "#f59e0b",
    visualData: { topperStyle: "crown", topperColor: "#fbbf24" }
  },
  topper_shades: {
    id: "topper_shades",
    name: "Pixel Deal-With-It Shades",
    slot: "topper",
    rarity: "rare",
    description: "Retro 8-bit sunglasses resting over the windscreen.",
    accentColor: "#0f172a",
    visualData: { topperStyle: "shades", topperColor: "#020617" }
  },
  topper_horns: {
    id: "topper_horns",
    name: "Cyber Devil Horns",
    slot: "topper",
    rarity: "exotic",
    description: "Twin glowing neon devil horns with pulsating electric arcs.",
    accentColor: "#f43f5e",
    visualData: { topperStyle: "horns", topperColor: "#f43f5e" }
  },

  // === TITLES ===
  title_rookie: {
    id: "title_rookie",
    name: "Rookie Striker",
    slot: "title",
    rarity: "common",
    description: "Display title: Rookie Striker",
    visualData: { titleText: "Rookie Striker" }
  },
  title_flip_reset: {
    id: "title_flip_reset",
    name: "Flip Reset Prodigy",
    slot: "title",
    rarity: "very_rare",
    description: "Display title: Flip Reset Prodigy",
    visualData: { titleText: "Flip Reset Prodigy" }
  },
  title_ceiling: {
    id: "title_ceiling",
    name: "Ceiling Shot Specialist",
    slot: "title",
    rarity: "import",
    description: "Display title: Ceiling Shot Specialist",
    visualData: { titleText: "Ceiling Shot Specialist" }
  },
  title_crate_king: {
    id: "title_crate_king",
    name: "Case Addict",
    slot: "title",
    rarity: "exotic",
    description: "Display title: Case Addict",
    visualData: { titleText: "Case Addict 📦" }
  },
  title_supersonic: {
    id: "title_supersonic",
    name: "Supersonic Overlord",
    slot: "title",
    rarity: "black_market",
    description: "Display title: Supersonic Overlord",
    visualData: { titleText: "👑 Supersonic Overlord" }
  }
};

export const CRATE_DEFINITIONS: Record<string, CrateDefinition> = {
  champion_crate: {
    id: "champion_crate",
    name: "Champion Series I",
    subtitle: "Classic RL Glory",
    description: "Features the legendary Titanium White Octane, Cristiano wheels, and Hellfire explosion.",
    costCredits: 200,
    iconName: "Trophy",
    accentColor: "#38bdf8",
    bgGradient: "from-sky-900/60 via-slate-900/90 to-slate-950",
    itemIds: [
      "body_fennec",
      "body_dominus",
      "body_tw_octane",
      "decal_flames",
      "decal_carbon",
      "wheel_cristiano",
      "wheel_astro",
      "boost_plasma",
      "boost_flamethrower",
      "ge_hellfire",
      "topper_shades",
      "title_flip_reset"
    ]
  },
  ignition_crate: {
    id: "ignition_crate",
    name: "Ignition Burnout",
    subtitle: "Speed & Heat",
    description: "Packed with fiery items: Draco Inferno wheels, Dragon Breath decal, and 24K Gold Dominus.",
    costCredits: 250,
    iconName: "Flame",
    accentColor: "#f97316",
    bgGradient: "from-orange-950/60 via-slate-900/90 to-slate-950",
    itemIds: [
      "body_dominus",
      "body_breakout",
      "body_gold_dominus",
      "decal_flames",
      "decal_dragon",
      "wheel_cristiano",
      "wheel_draco",
      "boost_flamethrower",
      "boost_electro",
      "ge_hellfire",
      "topper_horns",
      "title_ceiling"
    ]
  },
  cosmic_crate: {
    id: "cosmic_crate",
    name: "Cosmic Singularity",
    subtitle: "Astral Black Markets",
    description: "Unleash cosmic power with Singularity Vortex, Apex wheels, and Galaxy decals.",
    costCredits: 350,
    iconName: "Sparkles",
    accentColor: "#c084fc",
    bgGradient: "from-purple-950/60 via-slate-900/90 to-slate-950",
    itemIds: [
      "body_skyline",
      "body_cyber_fennec",
      "decal_galaxy",
      "decal_cyber",
      "decal_gold_leaf",
      "wheel_apex",
      "wheel_hologram",
      "boost_rainbow",
      "boost_sakura",
      "ge_supernova",
      "ge_singularity",
      "topper_halo",
      "topper_crown",
      "title_supersonic"
    ]
  },
  victory_drop: {
    id: "victory_drop",
    name: "Match Victory Crate",
    subtitle: "Earned from Matches",
    description: "Awarded automatically upon winning matches. Contains a diverse mix of rewards from all rarities.",
    costCredits: 100,
    iconName: "Gift",
    accentColor: "#10b981",
    bgGradient: "from-emerald-950/60 via-slate-900/90 to-slate-950",
    itemIds: [
      "body_fennec",
      "body_merc",
      "body_tw_octane",
      "decal_stripes",
      "decal_flames",
      "decal_carbon",
      "decal_galaxy",
      "wheel_oem",
      "wheel_cristiano",
      "wheel_astro",
      "wheel_apex",
      "boost_plasma",
      "boost_electro",
      "ge_electro",
      "ge_pixel",
      "topper_shades",
      "topper_halo",
      "title_crate_king"
    ]
  }
};
