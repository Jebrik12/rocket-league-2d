import {
  PlayerInventory,
  PlayerLoadout,
  CarMastery,
  CustomizationItem,
  ItemSlot
} from "./customizationTypes";
import { ITEM_CATALOG, CRATE_DEFINITIONS, RARITY_CONFIG } from "./customizationData";

const STORAGE_KEYS = {
  INVENTORY: "rl_customization_inventory_v1",
  LOADOUT: "rl_customization_loadout_v1",
  ECONOMY: "rl_customization_economy_v1",
  MASTERY: "rl_customization_mastery_v1"
};

const DEFAULT_LOADOUT: PlayerLoadout = {
  body: "body_octane",
  decal: "decal_none",
  wheels: "wheel_oem",
  boost: "boost_standard",
  goal_explosion: "ge_standard",
  topper: "topper_none",
  title: "title_rookie"
};

const DEFAULT_OWNED_ITEMS: string[] = [
  "body_octane",
  "decal_none",
  "decal_stripes",
  "wheel_oem",
  "boost_standard",
  "ge_standard",
  "topper_none",
  "title_rookie"
];

const DEFAULT_CRATES: Record<string, number> = {
  champion_crate: 2,
  ignition_crate: 1,
  victory_drop: 1
};

export function getPlayerInventory(): PlayerInventory {
  try {
    const rawInv = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    const rawLoadout = localStorage.getItem(STORAGE_KEYS.LOADOUT);
    const rawEconomy = localStorage.getItem(STORAGE_KEYS.ECONOMY);
    const rawMastery = localStorage.getItem(STORAGE_KEYS.MASTERY);

    const ownedItemIds: string[] = rawInv ? JSON.parse(rawInv) : [...DEFAULT_OWNED_ITEMS];
    const loadout: PlayerLoadout = rawLoadout ? { ...DEFAULT_LOADOUT, ...JSON.parse(rawLoadout) } : { ...DEFAULT_LOADOUT };
    const economy = rawEconomy
      ? JSON.parse(rawEconomy)
      : { credits: 1500, coins: 1500, keys: 3, unopenedCrates: { ...DEFAULT_CRATES }, lastDailyBonusClaim: 0 };
    const carMastery: Record<string, CarMastery> = rawMastery ? JSON.parse(rawMastery) : {};

    const coinsVal = Math.max(0, economy.coins ?? economy.credits ?? 1500);

    return {
      ownedItemIds,
      loadout,
      credits: coinsVal,
      coins: coinsVal,
      keys: Math.max(0, economy.keys ?? 3),
      lastDailyBonusClaim: economy.lastDailyBonusClaim ?? 0,
      unopenedCrates: economy.unopenedCrates ?? { ...DEFAULT_CRATES },
      carMastery
    };
  } catch (e) {
    console.error("Failed to load inventory, returning defaults", e);
    return {
      ownedItemIds: [...DEFAULT_OWNED_ITEMS],
      loadout: { ...DEFAULT_LOADOUT },
      credits: 1500,
      coins: 1500,
      keys: 3,
      lastDailyBonusClaim: 0,
      unopenedCrates: { ...DEFAULT_CRATES },
      carMastery: {}
    };
  }
}

export function savePlayerInventory(inv: PlayerInventory): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv.ownedItemIds));
    localStorage.setItem(STORAGE_KEYS.LOADOUT, JSON.stringify(inv.loadout));
    // Keep credits and coins in sync
    inv.credits = inv.coins;
    localStorage.setItem(
      STORAGE_KEYS.ECONOMY,
      JSON.stringify({
        credits: inv.coins,
        coins: inv.coins,
        keys: inv.keys,
        lastDailyBonusClaim: inv.lastDailyBonusClaim,
        unopenedCrates: inv.unopenedCrates
      })
    );
    localStorage.setItem(STORAGE_KEYS.MASTERY, JSON.stringify(inv.carMastery));
  } catch (e) {
    console.error("Failed to save inventory to localStorage", e);
  }
}

export function equipItem(slot: ItemSlot, itemId: string): PlayerLoadout {
  const inv = getPlayerInventory();
  if (!inv.ownedItemIds.includes(itemId) && itemId !== "topper_none" && itemId !== "decal_none") {
    console.warn("Player does not own item:", itemId);
    return inv.loadout;
  }

  inv.loadout[slot] = itemId;

  // Also sync with existing legacy storage key if body is changed
  if (slot === "body") {
    const item = ITEM_CATALOG[itemId];
    const model = item?.visualData?.modelId || "octane";
    try {
      localStorage.setItem("rl_selected_car", model);
    } catch (e) {}
  }

  savePlayerInventory(inv);
  return inv.loadout;
}

export function getPlayerCoins(): number {
  const inv = getPlayerInventory();
  return inv.coins;
}

export function addCoins(amount: number): number {
  const inv = getPlayerInventory();
  inv.coins = Math.max(0, inv.coins + amount);
  inv.credits = inv.coins;
  savePlayerInventory(inv);
  return inv.coins;
}

export function spendCoins(amount: number): boolean {
  const inv = getPlayerInventory();
  if (inv.coins < amount) return false;
  inv.coins -= amount;
  inv.credits = inv.coins;
  savePlayerInventory(inv);
  return true;
}

export function addCredits(amount: number): number {
  return addCoins(amount);
}

const DAILY_BONUS_COOLDOWN_MS = 20 * 60 * 60 * 1000; // 20 hours
const DAILY_BONUS_AMOUNT = 500;

export function claimDailyBonus(): {
  success: boolean;
  coinsGranted: number;
  nextAvailableMs?: number;
  message: string;
} {
  const inv = getPlayerInventory();
  const now = Date.now();
  const lastClaim = inv.lastDailyBonusClaim || 0;
  const elapsed = now - lastClaim;

  if (elapsed < DAILY_BONUS_COOLDOWN_MS) {
    const nextAvailableMs = lastClaim + DAILY_BONUS_COOLDOWN_MS;
    const remainingHrs = Math.ceil((nextAvailableMs - now) / (1000 * 60 * 60));
    return {
      success: false,
      coinsGranted: 0,
      nextAvailableMs,
      message: `Daily bonus ready in ${remainingHrs}h`
    };
  }

  inv.coins += DAILY_BONUS_AMOUNT;
  inv.credits = inv.coins;
  inv.lastDailyBonusClaim = now;
  savePlayerInventory(inv);

  return {
    success: true,
    coinsGranted: DAILY_BONUS_AMOUNT,
    message: `Claimed +${DAILY_BONUS_AMOUNT} Gold Coins!`
  };
}

export function addCrates(crateId: string, count: number = 1): Record<string, number> {
  const inv = getPlayerInventory();
  inv.unopenedCrates[crateId] = (inv.unopenedCrates[crateId] || 0) + count;
  savePlayerInventory(inv);
  return inv.unopenedCrates;
}

export function addItemsToInventory(itemIds: string[]): string[] {
  const inv = getPlayerInventory();
  let changed = false;
  for (const id of itemIds) {
    if (!inv.ownedItemIds.includes(id)) {
      inv.ownedItemIds.push(id);
      changed = true;
    }
  }
  if (changed) {
    savePlayerInventory(inv);
  }
  return inv.ownedItemIds;
}

/**
 * Roll an item from a crate definition using weighted rarity drop rates
 */
export function rollItemFromCrate(crateId: string): CustomizationItem {
  const crate = CRATE_DEFINITIONS[crateId] || CRATE_DEFINITIONS.champion_crate;
  const availableItems = crate.itemIds
    .map(id => ITEM_CATALOG[id])
    .filter((it): it is CustomizationItem => !!it);

  if (availableItems.length === 0) {
    return ITEM_CATALOG.body_octane;
  }

  // Calculate weighted probabilities based on rarity
  let totalWeight = 0;
  const weightedList: { item: CustomizationItem; weight: number }[] = [];

  for (const item of availableItems) {
    const rarityInfo = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
    const weight = rarityInfo.dropWeight;
    weightedList.push({ item, weight });
    totalWeight += weight;
  }

  const roll = Math.random() * totalWeight;
  let accumulated = 0;
  for (const entry of weightedList) {
    accumulated += entry.weight;
    if (roll <= accumulated) {
      return entry.item;
    }
  }

  return weightedList[weightedList.length - 1].item;
}

export function openCrate(crateId: string): {
  success: boolean;
  item?: CustomizationItem;
  isDuplicate?: boolean;
  coinsBonus?: number;
  creditBonus?: number;
  message?: string;
} {
  const inv = getPlayerInventory();
  const count = inv.unopenedCrates[crateId] || 0;
  const crateDef = CRATE_DEFINITIONS[crateId];

  if (!crateDef) {
    return { success: false, message: "Invalid crate ID" };
  }

  const cost = crateDef.costCoins ?? crateDef.costCredits;

  // Deduct crate if owned, or deduct coins if sufficient
  if (count > 0) {
    inv.unopenedCrates[crateId] = count - 1;
  } else if (inv.coins >= cost) {
    inv.coins -= cost;
    inv.credits = inv.coins;
  } else {
    return { success: false, message: `Need ${cost} Coins (you have ${inv.coins})` };
  }

  const wonItem = rollItemFromCrate(crateId);
  const isDuplicate = inv.ownedItemIds.includes(wonItem.id);
  let coinsBonus = 0;

  if (isDuplicate) {
    // Duplicate compensation based on rarity
    const rarityRefund: Record<string, number> = {
      common: 100,
      rare: 250,
      very_rare: 500,
      import: 1000,
      exotic: 2000,
      black_market: 5000
    };
    coinsBonus = rarityRefund[wonItem.rarity] || 100;
    inv.coins += coinsBonus;
    inv.credits = inv.coins;
  } else {
    inv.ownedItemIds.push(wonItem.id);
  }

  savePlayerInventory(inv);

  return {
    success: true,
    item: wonItem,
    isDuplicate,
    coinsBonus,
    creditBonus: coinsBonus
  };
}

export function getCarMastery(carModelId: string): CarMastery {
  const inv = getPlayerInventory();
  if (!inv.carMastery[carModelId]) {
    inv.carMastery[carModelId] = {
      carId: carModelId,
      level: 1,
      xp: 0,
      prestige: 0,
      goals: 0,
      saves: 0,
      shots: 0,
      wins: 0,
      mvps: 0
    };
  }
  return inv.carMastery[carModelId];
}

export function getCarUpgradeCost(level: number): number {
  return Math.min(2500, Math.floor(100 * Math.pow(1.15, level - 1)));
}

export function upgradeCarMastery(carModelId: string): { success: boolean; newLevel: number; message?: string } {
  const inv = getPlayerInventory();
  const mastery = getCarMastery(carModelId);

  if (mastery.level >= 50) {
    // Prestige check
    mastery.level = 1;
    mastery.prestige += 1;
    savePlayerInventory(inv);
    return { success: true, newLevel: 1, message: `Prestige ${mastery.prestige} Achieved!` };
  }

  const cost = getCarUpgradeCost(mastery.level);
  if (inv.coins < cost) {
    return { success: false, newLevel: mastery.level, message: `Need ${cost} Coins (you have ${inv.coins})` };
  }

  inv.coins -= cost;
  inv.credits = inv.coins;
  mastery.level += 1;
  savePlayerInventory(inv);
  return { success: true, newLevel: mastery.level };
}

export function recordMatchMastery(
  carModelId: string,
  stats: { goals: number; saves: number; shots: number; isWin: boolean; isMvp: boolean }
): { xpEarned: number; coinsEarned: number; creditsEarned: number; crateDropped?: string } {
  const inv = getPlayerInventory();
  const mastery = getCarMastery(carModelId);

  mastery.goals += stats.goals;
  mastery.saves += stats.saves;
  mastery.shots += stats.shots;
  if (stats.isWin) mastery.wins += 1;
  if (stats.isMvp) mastery.mvps += 1;

  // XP calculation
  const xpEarned =
    (stats.isWin ? 200 : 80) +
    stats.goals * 75 +
    stats.saves * 50 +
    stats.shots * 20 +
    (stats.isMvp ? 100 : 0);

  mastery.xp += xpEarned;

  // Auto level-up check if XP threshold reached
  const xpPerLevel = 600;
  while (mastery.xp >= mastery.level * xpPerLevel && mastery.level < 50) {
    mastery.level += 1;
  }

  // Coins reward: generous and motivating
  const coinsEarned =
    (stats.isWin ? 250 : 150) +
    stats.goals * 75 +
    stats.saves * 50 +
    stats.shots * 25 +
    (stats.isMvp ? 150 : 0);

  inv.coins += coinsEarned;
  inv.credits = inv.coins;

  // Crate drop roll (35% chance on win, 15% on loss)
  let crateDropped: string | undefined;
  const dropChance = stats.isWin ? 0.35 : 0.15;
  if (Math.random() < dropChance) {
    const cratePool = ["champion_crate", "ignition_crate", "victory_drop", "cosmic_crate"];
    const chosen = cratePool[Math.floor(Math.random() * cratePool.length)];
    inv.unopenedCrates[chosen] = (inv.unopenedCrates[chosen] || 0) + 1;
    crateDropped = chosen;
  }

  inv.carMastery[carModelId] = mastery;
  savePlayerInventory(inv);

  return { xpEarned, coinsEarned, creditsEarned: coinsEarned, crateDropped };
}
