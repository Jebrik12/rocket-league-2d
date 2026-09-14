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
      : { credits: 600, keys: 3, unopenedCrates: { ...DEFAULT_CRATES } };
    const carMastery: Record<string, CarMastery> = rawMastery ? JSON.parse(rawMastery) : {};

    return {
      ownedItemIds,
      loadout,
      credits: Math.max(0, economy.credits ?? 600),
      keys: Math.max(0, economy.keys ?? 3),
      unopenedCrates: economy.unopenedCrates ?? { ...DEFAULT_CRATES },
      carMastery
    };
  } catch (e) {
    console.error("Failed to load inventory, returning defaults", e);
    return {
      ownedItemIds: [...DEFAULT_OWNED_ITEMS],
      loadout: { ...DEFAULT_LOADOUT },
      credits: 600,
      keys: 3,
      unopenedCrates: { ...DEFAULT_CRATES },
      carMastery: {}
    };
  }
}

export function savePlayerInventory(inv: PlayerInventory): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv.ownedItemIds));
    localStorage.setItem(STORAGE_KEYS.LOADOUT, JSON.stringify(inv.loadout));
    localStorage.setItem(
      STORAGE_KEYS.ECONOMY,
      JSON.stringify({
        credits: inv.credits,
        keys: inv.keys,
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

export function addCredits(amount: number): number {
  const inv = getPlayerInventory();
  inv.credits = Math.max(0, inv.credits + amount);
  savePlayerInventory(inv);
  return inv.credits;
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
  creditBonus?: number;
  message?: string;
} {
  const inv = getPlayerInventory();
  const count = inv.unopenedCrates[crateId] || 0;
  const crateDef = CRATE_DEFINITIONS[crateId];

  if (!crateDef) {
    return { success: false, message: "Invalid crate ID" };
  }

  // Deduct crate if owned, or deduct credits if sufficient
  if (count > 0) {
    inv.unopenedCrates[crateId] = count - 1;
  } else if (inv.credits >= crateDef.costCredits) {
    inv.credits -= crateDef.costCredits;
  } else {
    return { success: false, message: "Not enough credits or crates" };
  }

  const wonItem = rollItemFromCrate(crateId);
  const isDuplicate = inv.ownedItemIds.includes(wonItem.id);
  let creditBonus = 0;

  if (isDuplicate) {
    // Duplicate compensation based on rarity
    const rarityRefund: Record<string, number> = {
      common: 50,
      rare: 100,
      very_rare: 150,
      import: 250,
      exotic: 400,
      black_market: 800
    };
    creditBonus = rarityRefund[wonItem.rarity] || 50;
    inv.credits += creditBonus;
  } else {
    inv.ownedItemIds.push(wonItem.id);
  }

  savePlayerInventory(inv);

  return {
    success: true,
    item: wonItem,
    isDuplicate,
    creditBonus
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
  if (inv.credits < cost) {
    return { success: false, newLevel: mastery.level, message: `Need ${cost} credits (you have ${inv.credits})` };
  }

  inv.credits -= cost;
  mastery.level += 1;
  savePlayerInventory(inv);
  return { success: true, newLevel: mastery.level };
}

export function recordMatchMastery(
  carModelId: string,
  stats: { goals: number; saves: number; shots: number; isWin: boolean; isMvp: boolean }
): { xpEarned: number; creditsEarned: number; crateDropped?: string } {
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

  // Credit reward
  const creditsEarned =
    (stats.isWin ? 50 : 20) +
    stats.goals * 15 +
    stats.saves * 10 +
    (stats.isMvp ? 30 : 0);

  inv.credits += creditsEarned;

  // Crate drop roll (25% chance on win, 10% on loss)
  let crateDropped: string | undefined;
  const dropChance = stats.isWin ? 0.35 : 0.12;
  if (Math.random() < dropChance) {
    const cratePool = ["champion_crate", "ignition_crate", "victory_drop", "cosmic_crate"];
    const chosen = cratePool[Math.floor(Math.random() * cratePool.length)];
    inv.unopenedCrates[chosen] = (inv.unopenedCrates[chosen] || 0) + 1;
    crateDropped = chosen;
  }

  inv.carMastery[carModelId] = mastery;
  savePlayerInventory(inv);

  return { xpEarned, creditsEarned, crateDropped };
}
