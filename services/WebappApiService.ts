import router from "next/router";
import { IArmyData } from "../data/armySlice";
import { IFtlData } from "../data/ftlSlice";
import { gameSystemToEnum } from "./Helpers";
import UnitService from "./UnitService";

export default class WebappApiService {

  private static webCompanionUrl = "https://webapp.onepagerules.com/api";

  private static getUrl() {
    const fromQuery = router.query.dataSourceUrl;
    if (fromQuery) return `https://${fromQuery}.herokuapp.com/api`;

    //return "http://localhost:3000/api";

    return this.webCompanionUrl;
  }

  private static cacheResponse(key: string, res: any) {
    localStorage[key] = JSON.stringify({
      cached: new Date(),
      res
    });
  }

  private static getFromCache(key: string) {
    const cachedValue = localStorage[key];
    if (!cachedValue) return null;
    const cachedObject = JSON.parse(cachedValue);
    return cachedObject.res;
  }

  public static async getArmyBooks(gameSystemSlug: string) {
    const cacheKey = "AF_Cache_army-books-" + gameSystemSlug;
    try {
      const res = await fetch(this.getUrl() + "/army-books?gameSystemSlug=" + gameSystemSlug);
      const data = await res.json();
      this.cacheResponse(cacheKey, data);
      return data;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  }

  public static async getGameRules(gameSystemSlug: string) {

    const cacheKey = "AF_Cache_game-rules-" + gameSystemSlug;
    try {
      const res = await fetch(this.getUrl() + `/content/game-systems/${gameSystemSlug}/special-rules`);
      const data = await res.json();
      this.cacheResponse(cacheKey, data);
      return data;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  }

  public static async getArmyBookData(armyId: string, gameSystem: string) {

    const cacheKey = "AF_Cache_army-" + armyId + gameSystem;
    try {
      const gameSystemId = gameSystemToEnum(gameSystem);

      const armyBookRes = await fetch(this.getUrl() + `/army-books/${armyId}~${gameSystemId}?armyForge=true`);

      const data: IArmyData = await armyBookRes.json();

      const upgradePackages = data.upgradePackages.map(upgradePackage => ({
        ...upgradePackage,
        sections: upgradePackage.sections.map(section => ({
          ...section,
          isCommandGroup: section.options
            .some(opt => opt.gains.some(g => g.name.toLocaleLowerCase() === "musician")),
          options: section.options.map(option => {
            const result: any = {
              ...option,
              parentSectionId: section.uid
            };
            delete result.proposedCost;
            delete result.proposedCostHint;
            delete result.proposedVersion;
            delete result.parentPackageUid;
            delete result.parentSectionUid;
            return result;
          })
        }))
      }));

      const transformedData: IArmyData = {
        ...data,
        units: data.units.map((unit, index) => ({
          ...unit,
          selectedUpgrades: [],
          sortId: index,
          disabledUpgradeSections: UnitService.getDisabledUpgradeSections(unit, upgradePackages)
        })),
        upgradePackages: upgradePackages
      };

      this.cacheResponse(cacheKey, transformedData);

      return transformedData;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  }

  public static async getFtlData() {

    const cacheKey = "AF_Cache_army-ftl";
    try {
      //const armyBookRes = await fetch(this.getUrl() + `/warfleets-ftl/`);

      //const data: IFtlData[] = await armyBookRes.json();
      const data: IFtlData[] = ftlData as any;

      this.cacheResponse(cacheKey, data);

      return data;
    }
    catch (e) {
      return this.getFromCache(cacheKey);
    }
  }
}

const ftlData = [
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "common",
    "faction": "Common",
    "version": "v1.5",
    "hint": "Default ship classes and upgrades, available to all factions.",
    "shipClasses": [
      {
        "key": "heavy-ship",
        "label": "Heavy Ship",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 80,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 2
        },
        "defense": {
          "evasion": 2,
          "toughness": 2
        },
        "upgradeSlotCount": 4,
        "specialRules": [],
        "faction": "Common"
      },
      {
        "key": "medium-ship",
        "label": "Medium Ship",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 60,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 18,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 3,
          "toughness": 3
        },
        "upgradeSlotCount": 3,
        "specialRules": [],
        "faction": "Common"
      },
      {
        "key": "light-ship",
        "label": "Light Ship",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 40,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 12,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 2,
        "specialRules": [],
        "faction": "Common"
      },
      {
        "key": "gunship-squadron",
        "label": "Gunship Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [],
        "faction": "Common"
      },
      {
        "key": "fighter-squadron",
        "label": "Fighter Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 3,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 6
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Anti-Squadron"
        ],
        "faction": "Common"
      },
      {
        "key": "bomber-squadron",
        "label": "Bomber Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 1,
          "strength": 2
        },
        "defense": {
          "evasion": 4,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Anti-Ship",
          "Deadly"
        ],
        "faction": "Common"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "ablative-armor",
        "label": "Ablative Armor",
        "effect": "Enemy ships ramming this ship take +1 damage, and this ship never takes any damage from overlapping enemy ships.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "armored-plating",
        "label": "Armored Plating",
        "effect": "This upgrade takes 5 damage to be disabled.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "gravity-bumper",
        "label": "Gravity Bumper",
        "effect": "Enemy ships are pushed by +D6“ when rammed by this ship.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "nuclear-ammo",
        "label": "Nuclear Ammo",
        "effect": "Turret gets +1 strength",
        "modifiers": [
          {
            "stat": "turret.strength",
            "modifier": 1,
            "condition": null
          }
        ],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "precision-rig",
        "label": "Precision Rig",
        "effect": "Turret gets +1 to hit.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "pulse-engine",
        "label": "Pulse Engine",
        "effect": "Gets +2“ on move and +3“ on cruise/ram actions.",
        "modifiers": [
          {
            "stat": "move",
            "modifier": 2,
            "condition": null
          },
          {
            "stat": "cruise",
            "modifier": 3,
            "condition": null
          }
        ],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "reinforced-ram",
        "label": "Reinforced Ram",
        "effect": "Deals +1 damage when ramming enemy ships.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "repair-bay",
        "label": "Repair Bay",
        "effect": "When activated may remove 1 damage from another ship within 4“.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "shield-booster",
        "label": "Shield Booster",
        "effect": "When taking a point of damage roll one die, on a 5+ it is ignored.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "stealth-rig",
        "label": "Stealth Rig",
        "effect": "Always counts as in cover when targeted from over 12“ away.",
        "modifiers": [
          {
            "stat": "evasion",
            "modifier": 1,
            "condition": null
          }
        ],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "tractor-beam",
        "label": "Tractor Beam",
        "effect": "When activated pick one enemy ship within 8“ and move it D6+1“ toward this ship.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "upgrade",
        "key": "warp-drive",
        "label": "Warp Drive",
        "effect": "When using move actions may move straight by D6+2“, ignoring all ships and terrain.",
        "modifiers": [],
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "energy-cannon",
        "label": "Energy Cannon",
        "range": 12,
        "attacks": 3,
        "strength": 1,
        "special": "Counts as having the Anti-Ship rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "giga-cannon",
        "label": "Giga Cannon",
        "range": 6,
        "attacks": 1,
        "strength": 4,
        "special": "Counts as having the Deadly rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "heavy-cannon",
        "label": "Heavy Cannon",
        "range": 12,
        "attacks": 4,
        "strength": 0,
        "special": "Counts as having the Relentless rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "linked-railgun",
        "label": "Linked Railgun",
        "range": 24,
        "attacks": 3,
        "strength": 1,
        "special": "Counts as having the Overheating rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "missile-cluster",
        "label": "Missile Cluster",
        "range": 18,
        "attacks": 1,
        "strength": 1,
        "special": "Counts as having the Blast rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "plasma-cannon",
        "label": "Plasma Cannon",
        "range": 18,
        "attacks": 2,
        "strength": 3,
        "special": "Counts as having the Overheating rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "tsunami-cannon",
        "label": "Tsunami Cannon",
        "range": 24,
        "attacks": 1,
        "strength": 2,
        "special": "May only be fired when holding and counts as having the Deadly rule.",
        "faction": "Common"
      },
      {
        "type": "weapon",
        "key": "weapon-batteries",
        "label": "Weapon Batteries",
        "range": 6,
        "attacks": 2,
        "strength": 2,
        "special": "Counts as having the Broadside rule.",
        "faction": "Common"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "tactical-master",
        "label": "Tactical Master",
        "effect": "May choose not to be deployed at the start of the game, but instead may be deployed anywhere over 9“ away from enemies at the start of any round after the first.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "expert-sapper",
        "label": "Expert Sapper",
        "effect": "When this ship is activated you may place a mine marker within 4“. Enemies moving within 2“ of the mine take 2 damage and remove it.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "ace-commander",
        "label": "Ace Commander",
        "effect": "The first time a friendly squadron within 6“ is activated each round, you may activate another friendly squadron within 6“.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "vanguard",
        "label": "Vanguard",
        "effect": "When deployed may immediately be moved straight by up to its move speed.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "avenger",
        "label": "Avenger",
        "effect": "May fire sides mounted weapons from both side facings at once.",
        "cost": 5,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "defiant",
        "label": "Defiant",
        "effect": "Whenever a friendly ship within 6“ is destroyed, you may remove 2 damage from this ship.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "anti-ship",
        "label": "Anti-Ship",
        "effect": "May only target enemy ships and gets +1 to hit."
      },
      {
        "type": "special-rule",
        "key": "anti-squadron",
        "label": "Anti-Squadron",
        "effect": "May only target enemy squadrons and gets +1 to hit."
      },
      {
        "type": "special-rule",
        "key": "blast",
        "label": "Blast",
        "effect": "If the target is hit all models within 4“ of it are also hit by this weapon."
      },
      {
        "type": "special-rule",
        "key": "broadside",
        "label": "Broadside",
        "effect": "May only be mounted on the sides facing, and doubles its attacks when targeting enemy ships in their side facing"
      },
      {
        "type": "special-rule",
        "key": "deadly",
        "label": "Deadly",
        "effect": "This weapos deals +1 damage per hit on the target"
      },
      {
        "type": "special-rule",
        "key": "fragile",
        "label": "Fragile",
        "effect": "The first time this model takes damage each round it takes +1 damage"
      },
      {
        "type": "special-rule",
        "key": "overheating",
        "label": "Overheating",
        "effect": "If you roll a 1 to hit, then this ship takes 1 damage."
      },
      {
        "type": "special-rule",
        "key": "relentless",
        "label": "Relentless",
        "effect": "This weapon may split its attacks to fire at different targets."
      },
      {
        "type": "special-rule",
        "key": "rogue",
        "label": "Rogue",
        "effect": "This squadron may be activated during other phases, but may only either move or shoot when doing so."
      }
    ],
    "legendaryFleets": []
  },
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "empire",
    "faction": "Empire",
    "version": "v1.5",
    "hint": "All-rounder faction with abilities that deal self-damage for strong effects.",
    "shipClasses": [
      {
        "key": "destroyer",
        "label": "Destroyer",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 100,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 2
        },
        "defense": {
          "evasion": 2,
          "toughness": 2
        },
        "upgradeSlotCount": 5,
        "specialRules": [],
        "faction": "Empire"
      },
      {
        "key": "gladiator",
        "label": "Gladiator",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 70,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 3,
          "toughness": 3
        },
        "upgradeSlotCount": 3,
        "specialRules": [],
        "faction": "Empire"
      },
      {
        "key": "raider",
        "label": "Raider",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 40,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 6,
          "attacks": 3,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 2,
        "specialRules": [],
        "faction": "Empire"
      },
      {
        "key": "slave-squadron",
        "label": "Slave Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Rogue"
        ],
        "faction": "Empire"
      },
      {
        "key": "tempest-squadron",
        "label": "Tempest Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Escort",
          "Fragile"
        ],
        "faction": "Empire"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "control-center",
        "label": "Control Center",
        "effect": "Friendly squadrons within 6“ may move even if engaged.",
        "modifiers": [],
        "faction": "Empire"
      },
      {
        "type": "upgrade",
        "key": "hazardous-ammo",
        "label": "Hazardous Ammo",
        "effect": "When firing its turret may choose to take 1 damage in order to get +1 to hit and +1 strength.",
        "modifiers": [],
        "faction": "Empire"
      },
      {
        "type": "upgrade",
        "key": "munitions-resupply",
        "label": "Munitions Resupply",
        "effect": "Friendly squadrons within 4“ may shoot twice if they use hold actions.",
        "modifiers": [],
        "faction": "Empire"
      },
      {
        "type": "upgrade",
        "key": "overcharged-rudders",
        "label": "Overcharged Rudders",
        "effect": "May choose to take 1 damage to pivot once by up to 90° at any point when using move actions.",
        "modifiers": [],
        "faction": "Empire"
      },
      {
        "type": "weapon",
        "key": "proximity-guns",
        "label": "Proximity Guns",
        "range": 4,
        "attacks": 2,
        "strength": 0,
        "special": "Counts as having the Anti-Squadron rule, and may be fired once at every squadron that is in range.",
        "faction": "Empire"
      },
      {
        "type": "weapon",
        "key": "ion-cannon",
        "label": "Ion Cannon",
        "range": 18,
        "attacks": 2,
        "strength": 1,
        "faction": "Empire"
      },
      {
        "type": "weapon",
        "key": "particle-cannon",
        "label": "Particle Cannon",
        "range": 12,
        "attacks": 3,
        "strength": 0,
        "special": "Counts as having the Deadly rule when targeting enemies in their front facing.",
        "faction": "Empire"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "engineering-expert",
        "label": "Engineering Expert",
        "effect": "When you would damage enemy ships you may chose not to deal damage, and instead the enemy must pick one upgrade, which can’t be used until the end of the game.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "supply-strategist",
        "label": "Supply Strategist",
        "effect": "After all ships have been deployed this ship may be removed and deployed again.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "unity",
        "label": "Unity",
        "effect": "May shoot before moving",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "suppressor",
        "label": "Suppressor",
        "effect": "Turret gets +1 to hit and +1 strength when targeting enemies that were already hit this round.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "escort",
        "label": "Escort",
        "effect": "Enemy squadrons within 4“ may only target squadrons with Escort"
      }
    ],
    "legendaryFleets": [
      {
        "key": "the-golden-shield",
        "name": "The Golden Shield",
        "pro": "The first time each round that a friendly ship would take 2 or more damage, it only takes 1 damage.",
        "con": "Enemies get +1 strength and +1 to hit when targeting friendly ships that used this rule until the end of the round.",
        "modifiers": []
      },
      {
        "key": "the-pride-of-tyria",
        "name": "The Pride of Tyria",
        "pro": "The first time each round that an enemy ship moves in line of sight of a friendly ship that is in range of its turret, it must react by shooting at it with its turret and gets -1 to hit.",
        "con": "Friendly ships that use this rule take 1 damage after shooting.",
        "modifiers": []
      },
      {
        "key": "the-penal-fleet",
        "name": "The Penal Fleet",
        "pro": "The first time each round that a friendly ship is activated it must take 2 actions instead of ony 1.",
        "con": "Friendly ships that use this rule take 2 damage after activating.",
        "modifiers": []
      }
    ]
  },
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "alliance",
    "faction": "Alliance",
    "version": "v1.5",
    "hint": "Long-range faction with anti-squadron effects, but generally fragile.",
    "shipClasses": [
      {
        "key": "eagle",
        "label": "Eagle",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 80,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 30,
          "attacks": 2,
          "strength": 3
        },
        "defense": {
          "evasion": 2,
          "toughness": 2
        },
        "upgradeSlotCount": 4,
        "specialRules": [
          "Fragile"
        ],
        "faction": "Alliance"
      },
      {
        "key": "harrier",
        "label": "Harrier",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 60,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 3,
          "toughness": 3
        },
        "upgradeSlotCount": 3,
        "specialRules": [
          "Fragile"
        ],
        "faction": "Alliance"
      },
      {
        "key": "kite",
        "label": "Kite",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 40,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 18,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 2,
        "specialRules": [
          "Fragile"
        ],
        "faction": "Alliance"
      },
      {
        "key": "falcon-squadron",
        "label": "Falcon Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Defender",
          "Rogue"
        ],
        "faction": "Alliance"
      },
      {
        "key": "hawk-squadron",
        "label": "Hawk Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 6,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Fragile"
        ],
        "faction": "Alliance"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "advanced-precision-rig",
        "label": "Advanced Precision Rig",
        "effect": "Turret gets the Deadly rule when shooting at targets that are 18“ or further away.",
        "modifiers": [],
        "faction": "Alliance"
      },
      {
        "type": "upgrade",
        "key": "emp-blaster",
        "label": "EMP Blaster",
        "effect": "Enemy squadrons within 4“ count as being engaged.",
        "modifiers": [],
        "faction": "Alliance"
      },
      {
        "type": "upgrade",
        "key": "point-defence-system",
        "label": "Point Defence System",
        "effect": "After being shot at by enemy squadrons may shoot back with 3 attacks and strength 0.",
        "modifiers": [],
        "faction": "Alliance"
      },
      {
        "type": "upgrade",
        "key": "targeting-array",
        "label": "Targeting Array",
        "effect": "Turret gets +1 to hit and +1 strength when shooting at targets that are 12“ or further away.",
        "modifiers": [],
        "faction": "Alliance"
      },
      {
        "type": "weapon",
        "key": "rapid-fire-gun",
        "label": "Rapid-Fire Gun",
        "range": 6,
        "attacks": 6,
        "strength": 0,
        "special": "Counts as having the Anti-Squadron and Relentless rules.",
        "faction": "Alliance"
      },
      {
        "type": "weapon",
        "key": "flechette-cannon",
        "label": "Flechette Cannon",
        "range": 24,
        "attacks": 1,
        "strength": 0,
        "special": "Counts as having the Blast rule.",
        "faction": "Alliance"
      },
      {
        "type": "weapon",
        "key": "turbo-laser",
        "label": "Turbo Laser",
        "range": 30,
        "attacks": 1,
        "strength": 1,
        "faction": "Alliance"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "master-spotter",
        "label": "Master Spotter",
        "effect": "When activated pick one enemy model within 24“. All friendly units get +1 to hit against it until this ship’s next activation.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "lone-hunter",
        "label": "Lone Hunter",
        "effect": "Turret gets +1 to hit and +1 strength as long as no friendly ships are within 6“.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "paragon",
        "label": "Paragon",
        "effect": "Enemies don’t hit on 2+ against this ship when using hold actions.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "sunder",
        "label": "Sunder",
        "effect": "May ignore cover when shooting at enemy ships.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "defender",
        "label": "Defender",
        "effect": "Enemy squadrons within 4“ count as engaged."
      }
    ],
    "legendaryFleets": [
      {
        "key": "hope-remains",
        "name": "Hope Remains",
        "pro": "Friendly ships add +3“ to the range of their weapons.",
        "con": "Enemies get +1 to hit when targeting friendly ships.",
        "modifiers": [
          {
            "key": "hope-remains--pro-",
            "name": "Hope Remains (Pro)",
            "snippet": "Friendly ships add +3“ to the range of their weapons.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "hope-remains--con-",
            "name": "Hope Remains (Con)",
            "snippet": "Enemies get +1 to hit when targeting friendly ships.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "atov-s-veterans",
        "name": "Atov’s Veterans",
        "pro": "Friendly ships get +1 to hit when shooting at targets that are 12“ or further away.",
        "con": "Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.",
        "modifiers": [
          {
            "key": "atov-s-veterans--pro-",
            "name": "Atov’s Veterans (Pro)",
            "snippet": "Friendly ships get +1 to hit when shooting at targets that are 12“ or further away.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "atov-s-veterans--con-",
            "name": "Atov’s Veterans (Con)",
            "snippet": "Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "rangers-of-moazu",
        "name": "Rangers of Moazu",
        "pro": "Friendly ships get +2 to hit when targeting enemy squadrons.",
        "con": "Enemy squadrons always deal +1 damage when targeting ships.",
        "modifiers": [
          {
            "key": "rangers-of-moazu--pro-",
            "name": "Rangers of Moazu (Pro)",
            "snippet": "Friendly ships get +2 to hit when targeting enemy squadrons.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "rangers-of-moazu--con-",
            "name": "Rangers of Moazu (Con)",
            "snippet": "Enemy squadrons always deal +1 damage when targeting ships.",
            "effects": []
          }
        ]
      }
    ]
  },
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "marauders",
    "faction": "Marauders",
    "version": "v1.5",
    "hint": "Short-range faction with cheaper ships and squadrons built for ramming.",
    "shipClasses": [
      {
        "key": "killer",
        "label": "Killer",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 70,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 18,
          "attacks": 2,
          "strength": 2
        },
        "defense": {
          "evasion": 2,
          "toughness": 3
        },
        "upgradeSlotCount": 4,
        "specialRules": [
          "Battering Ram"
        ],
        "faction": "Marauders"
      },
      {
        "key": "crusher",
        "label": "Crusher",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 50,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 12,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 3,
          "toughness": 4
        },
        "upgradeSlotCount": 3,
        "specialRules": [
          "Battering Ram"
        ],
        "faction": "Marauders"
      },
      {
        "key": "chopper",
        "label": "Chopper",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 30,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 6,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 5
        },
        "upgradeSlotCount": 2,
        "specialRules": [
          "Battering Ram"
        ],
        "faction": "Marauders"
      },
      {
        "key": "turbo-squadron",
        "label": "Turbo Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 12,
          "cruise": 18
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 6
        },
        "upgradeSlotCount": 0,
        "specialRules": [],
        "faction": "Marauders"
      },
      {
        "key": "suicide-squadron",
        "label": "Suicide Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Suicide Run",
          "Fragile"
        ],
        "faction": "Marauders"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "bomber-command-center",
        "label": "Bomber Command Center",
        "effect": "Friendly squadrons within 6“ get +1 strength when targeting enemy ships.",
        "modifiers": [],
        "faction": "Marauders"
      },
      {
        "type": "upgrade",
        "key": "charged-munitions",
        "label": "Charged Munitions",
        "effect": "Turret gets the Deadly rule when shooting at targets that are 6“ or closer to it..",
        "modifiers": [
          {
            "stat": {
              "STRENGTH": "turret.strength",
              "RANGE": "turret.range"
            },
            "modifier": "Deadly",
            "condition": "against targets within 6\""
          }
        ],
        "faction": "Marauders"
      },
      {
        "type": "upgrade",
        "key": "gunnery-crew",
        "label": "Gunnery Crew",
        "effect": "Turret gets +1 to hit and +1 strength when shooting at targets that are 12“ or closer to it.",
        "modifiers": [],
        "faction": "Marauders"
      },
      {
        "type": "upgrade",
        "key": "rapid-launch-bays",
        "label": "Rapid Launch Bays",
        "effect": "Friendly squadrons within 4“ get +2“ on move and +3“ on cruise actions.",
        "modifiers": [],
        "faction": "Marauders"
      },
      {
        "type": "weapon",
        "key": "mega-cannon",
        "label": "Mega Cannon",
        "range": 6,
        "attacks": 2,
        "strength": 4,
        "special": "Counts as having the Deadly and Overheating rules.",
        "faction": "Marauders"
      },
      {
        "type": "weapon",
        "key": "ripper-array",
        "label": "Ripper Array",
        "range": 6,
        "attacks": 3,
        "strength": 1,
        "special": "Counts as having the Broadside rule.",
        "faction": "Marauders"
      },
      {
        "type": "weapon",
        "key": "ship-buster-gun",
        "label": "Ship-Buster Gun",
        "range": 6,
        "attacks": 1,
        "strength": 3,
        "special": "Counts as having the Deadly and the Anti-Ship rules.",
        "faction": "Marauders"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "tyrant-boss",
        "label": "Tyrant Boss",
        "effect": "Friendly squadrons within 4“ that would be destroyed are only destroyed after their next activation.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "speed-freak",
        "label": "Speed Freak",
        "effect": "When using cruise actions enemies get -1 to hit against this ship until its next activation.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "ravager",
        "label": "Ravager",
        "effect": "May pivot twice when using cruise or ram actions.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "impetuous",
        "label": "Impetuous",
        "effect": "Ignores difficult and dangerous terrain.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "battering-ram",
        "label": "Battering Ram",
        "effect": "Counts as having +1 max. upgrades for the purpose of ramming."
      },
      {
        "type": "special-rule",
        "key": "suicide-run",
        "label": "Suicide Run",
        "effect": "May use ram actions (counts as having 0 upgrades), but is immediately destroyed when doing so."
      }
    ],
    "legendaryFleets": [
      {
        "key": "iron-behemoths",
        "name": "Iron Behemoths",
        "pro": "Friendly ships using ram actions push targets by +D6“.",
        "con": "Friendly ships get -2“ on move and -3“ on cruise/ram actions.",
        "modifiers": [
          {
            "key": "iron-behemoths--pro-",
            "name": "Iron Behemoths (Pro)",
            "snippet": "Friendly ships using ram actions push targets by +D6“.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "iron-behemoths--con-",
            "name": "Iron Behemoths (Con)",
            "snippet": "Friendly ships get -2“ on move and -3“ on cruise/ram actions.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "crimson-vortex",
        "name": "Crimson Vortex",
        "pro": "Whenever a friendly ship is destroyed, all models within 4“ immediately take 2 damage.",
        "con": "Friendly ships count as having the Fragile rule.",
        "modifiers": [
          {
            "key": "crimson-vortex--pro-",
            "name": "Crimson Vortex (Pro)",
            "snippet": "Whenever a friendly ship is destroyed, all models within 4“ immediately take 2 damage.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "crimson-vortex--con-",
            "name": "Crimson Vortex (Con)",
            "snippet": "Friendly ships count as having the Fragile rule.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "morka-s-mob",
        "name": "Morka’s Mob",
        "pro": "When preparing your fleet you may take +1 squadron per ship.",
        "con": "Friendly squadrons count as having the Fragile rule.",
        "modifiers": [
          {
            "key": "morka-s-mob--pro-",
            "name": "Morka’s Mob (Pro)",
            "snippet": "When preparing your fleet you may take +1 squadron per ship.",
            "effects": []
          },
          {
            "key": "morka-s-mob--con-",
            "name": "Morka’s Mob (Con)",
            "snippet": "Friendly squadrons count as having the Fragile rule.",
            "effects": {
              "categoryFilter": "Squadron"
            }
          }
        ]
      }
    ]
  },
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "nomads",
    "faction": "Nomads",
    "version": "v1.5",
    "hint": "Exotic faction with a variety of niche weapons and upgrades.",
    "shipClasses": [
      {
        "key": "dusk",
        "label": "Dusk",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 80,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 2
        },
        "defense": {
          "evasion": 3,
          "toughness": 3
        },
        "upgradeSlotCount": 4,
        "specialRules": [],
        "faction": "Nomads"
      },
      {
        "key": "twilight",
        "label": "Twilight",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 60,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 18,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 3,
        "specialRules": [],
        "faction": "Nomads"
      },
      {
        "key": "dawn",
        "label": "Dawn",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 40,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 12,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 2,
        "specialRules": [],
        "faction": "Nomads"
      },
      {
        "key": "flicker-squadron",
        "label": "Flicker Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Jammer",
          "Fragile"
        ],
        "faction": "Nomads"
      },
      {
        "key": "shimmer-squadron",
        "label": "Shimmer Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 6,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Fragile"
        ],
        "faction": "Nomads"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "early-warning-system",
        "label": "Early Warning System",
        "effect": "When activated pick one ship facing, and enemies get -1 to hit against that facing until this ship’s next activation.",
        "modifiers": [],
        "faction": "Nomads"
      },
      {
        "type": "upgrade",
        "key": "gravity-trap-launcher",
        "label": "Gravity Trap Launcher",
        "effect": "When activated, place a gravity trap marker within 6“. All enemies within 4“ of it halve their speed.",
        "modifiers": [],
        "faction": "Nomads"
      },
      {
        "type": "upgrade",
        "key": "system-overrider",
        "label": "System Overrider",
        "effect": "When activated pick one enemy squadron within 6“, and you may immediately activate and control it once as if it was your own squadron.",
        "modifiers": [],
        "faction": "Nomads"
      },
      {
        "type": "upgrade",
        "key": "wraith-drive",
        "label": "Wraith Drive",
        "effect": "When using ram actions this ship may move through its target, but does not push it.",
        "modifiers": [],
        "faction": "Nomads"
      },
      {
        "type": "weapon",
        "key": "splitter-cannon",
        "label": "Splitter Cannon",
        "range": 12,
        "attacks": 1,
        "strength": 2,
        "special": "Counts as having the Blast rule.",
        "faction": "Nomads"
      },
      {
        "type": "weapon",
        "key": "precision-laser",
        "label": "Precision Laser",
        "range": 12,
        "attacks": 4,
        "strength": 0,
        "special": "Counts as having the Anti-Squadron rule",
        "faction": "Nomads"
      },
      {
        "type": "weapon",
        "key": "storm-missiles",
        "label": "Storm Missiles",
        "range": 12,
        "attacks": 3,
        "strength": 1,
        "special": "May choose to get +2 attacks but count as having the Overheating rule.",
        "faction": "Nomads"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "restles-creator",
        "label": "Restles Creator",
        "effect": "Once per round, when a friendly squadron is destroyed, you may place that squadron within 2“ instead and remove all damage from it.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "defensive-master",
        "label": "Defensive Master",
        "effect": "This ship can‘t take more than 1 damage at once from a single weapon‘s attack.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "instigator",
        "label": "Instigator",
        "effect": "Friendly ships that target enemies within 6“ get +1 to hit.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "protector",
        "label": "Protector",
        "effect": "Enemies targeting squadrons within 6“ get -1 to hit.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "jammer",
        "label": "Jammer",
        "effect": "Friendly squadrons within 4“ may move even if engaged."
      }
    ],
    "legendaryFleets": [
      {
        "key": "children-of-the-vanished-mist",
        "name": "Children of the Vanished Mist",
        "pro": "One friendly ship counts as having +1 upgrade slots.",
        "con": "That ship counts as Fragile, and enemies may always pick which upgrades are damaged/disabled.",
        "modifiers": [
          {
            "key": "children-of-the-vanished-mist--pro-",
            "name": "Children of the Vanished Mist (Pro)",
            "snippet": "One friendly ship counts as having +1 upgrade slots.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "children-of-the-vanished-mist--con-",
            "name": "Children of the Vanished Mist (Con)",
            "snippet": "That ship counts as Fragile, and enemies may always pick which upgrades are damaged/disabled.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "the-forgotten",
        "name": "The Forgotten",
        "pro": "Once per round you may count one friendly ship as activated so that you can activate another friendly ship that had already activated.",
        "con": "Enemies deal +1 damage when targeting friendly ships that were already activated this round.",
        "modifiers": [
          {
            "key": "the-forgotten--pro-",
            "name": "The Forgotten (Pro)",
            "snippet": "Once per round you may count one friendly ship as activated so that you can activate another friendly ship that had already activated.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "the-forgotten--con-",
            "name": "The Forgotten (Con)",
            "snippet": "Enemies deal +1 damage when targeting friendly ships that were already activated this round.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "mirage-of-the-void",
        "name": "Mirage of the Void",
        "pro": "When activating ships during their phase, you may always go first.",
        "con": "All ships in your fleet must be of exactly the same type and with the exact same upgrades.",
        "modifiers": [
          {
            "key": "mirage-of-the-void--pro-",
            "name": "Mirage of the Void (Pro)",
            "snippet": "When activating ships during their phase, you may always go first.",
            "effects": []
          },
          {
            "key": "mirage-of-the-void--con-",
            "name": "Mirage of the Void (Con)",
            "snippet": "All ships in your fleet must be of exactly the same type and with the exact same upgrades.",
            "effects": []
          }
        ]
      }
    ]
  },
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "progenitors",
    "faction": "Progenitors",
    "version": "v1.5",
    "hint": "Defensive faction with slow but durable ships and powerful weapons.",
    "shipClasses": [
      {
        "key": "dodecahedron",
        "label": "Dodecahedron",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 80,
        "speed": {
          "move": 2,
          "cruise": 3
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 2
        },
        "defense": {
          "evasion": 2,
          "toughness": 2
        },
        "upgradeSlotCount": 4,
        "specialRules": [
          "Hardened"
        ],
        "faction": "Progenitors"
      },
      {
        "key": "octahedron",
        "label": "Octahedron",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 60,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 18,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 3,
          "toughness": 3
        },
        "upgradeSlotCount": 3,
        "specialRules": [
          "Hardened"
        ],
        "faction": "Progenitors"
      },
      {
        "key": "tetrahedron",
        "label": "Tetrahedron",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 40,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 12,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 2,
        "specialRules": [
          "Hardened"
        ],
        "faction": "Progenitors"
      },
      {
        "key": "prism-squadron",
        "label": "Prism Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 20,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Grit",
          "Rogue"
        ],
        "faction": "Progenitors"
      },
      {
        "key": "cube-squadron",
        "label": "Cube Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Heavy"
        ],
        "faction": "Progenitors"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "fortified-bow",
        "label": "Fortified Bow",
        "effect": "Enemies shooting at this ship in its front facing get -1 strength.",
        "modifiers": [],
        "faction": "Progenitors"
      },
      {
        "type": "upgrade",
        "key": "gravity-field",
        "label": "Gravity Field",
        "effect": "All enemies within 4“ halve their speed.",
        "modifiers": [],
        "faction": "Progenitors"
      },
      {
        "type": "upgrade",
        "key": "redundant-shields",
        "label": "Redundant Shields",
        "effect": "Enemies shooting at this ship in its rear facing get -2 strength.",
        "modifiers": [],
        "faction": "Progenitors"
      },
      {
        "type": "upgrade",
        "key": "repair-pods",
        "label": "Repair Pods",
        "effect": "When this ship is activated roll one die for each friendly squadron within 4“ with damage on it. On a 5+ you may remove 1 damage from it.",
        "modifiers": [],
        "faction": "Progenitors"
      },
      {
        "type": "weapon",
        "key": "baryon-guns",
        "label": "Baryon Guns",
        "range": 6,
        "attacks": 3,
        "strength": 1,
        "special": "Counts as having the Anti-Squadron rule.",
        "faction": "Progenitors"
      },
      {
        "type": "weapon",
        "key": "neutron-cannon",
        "label": "Neutron Cannon",
        "range": 12,
        "attacks": 2,
        "strength": 2,
        "special": "May only be fired when holding and counts as having the Deadly rule.",
        "faction": "Progenitors"
      },
      {
        "type": "weapon",
        "key": "potron-cannon",
        "label": "Potron Cannon",
        "range": 6,
        "attacks": 1,
        "strength": 4,
        "special": "Counts as having the Broadside and the Deadly rules.",
        "faction": "Progenitors"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "ancient-guardian",
        "label": "Ancient Guardian",
        "effect": "When this ship activates you may remove 1 damage from one non-disabled upgrade.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "prudent-director",
        "label": "Prudent Director",
        "effect": "When taking any damage may transfer 1 damage to a friendly ship within 4“.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "stronghold",
        "label": "Stronghold",
        "effect": "Enemies firing at this ship from 12“ or further get -1 strength.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "redemption",
        "label": "Redemption",
        "effect": "This ship takes no damage from overlapping, and always deals +1 damage when overlapping.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "grit",
        "label": "Grit",
        "effect": "May move even if engaged, but enemy squadrons may also move if engaged with it."
      },
      {
        "type": "special-rule",
        "key": "hardened",
        "label": "Hardened",
        "effect": "This ship ignores all strength values as long as it has no damage on it."
      },
      {
        "type": "special-rule",
        "key": "heavy",
        "label": "Heavy",
        "effect": "Takes 5 damage to be destroyed."
      }
    ],
    "legendaryFleets": [
      {
        "key": "prismatic-bastion",
        "name": "Prismatic Bastion",
        "pro": "At the beginning of each round roll one die for each point of damage on friendly ships. On a 5+ you may remove that damage.",
        "con": "Enemies deal +1 damage to friendly ships that are damaged.",
        "modifiers": [
          {
            "key": "prismatic-bastion--pro-",
            "name": "Prismatic Bastion (Pro)",
            "snippet": "At the beginning of each round roll one die for each point of damage on friendly ships. On a 5+ you may remove that damage.",
            "effects": []
          },
          {
            "key": "prismatic-bastion--con-",
            "name": "Prismatic Bastion (Con)",
            "snippet": "Enemies deal +1 damage to friendly ships that are damaged.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "abyssal-vanguard",
        "name": "Abyssal Vanguard",
        "pro": "Enemies get -1 strength when shooting at friendly ships that are 12“ or further away.",
        "con": "Enemies get +1 strength when shooting at friendly ships that are 12“ or closer to them.",
        "modifiers": [
          {
            "key": "abyssal-vanguard--pro-",
            "name": "Abyssal Vanguard (Pro)",
            "snippet": "Enemies get -1 strength when shooting at friendly ships that are 12“ or further away.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "abyssal-vanguard--con-",
            "name": "Abyssal Vanguard (Con)",
            "snippet": "Enemies get +1 strength when shooting at friendly ships that are 12“ or closer to them.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "ancient-protectors",
        "name": "Ancient Protectors",
        "pro": "One friendly ship may always ignore all damage the first time it takes damage each round.",
        "con": "That ship may only use hold actions during the game.",
        "modifiers": [
          {
            "key": "ancient-protectors--pro-",
            "name": "Ancient Protectors (Pro)",
            "snippet": "One friendly ship may always ignore all damage the first time it takes damage each round.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "ancient-protectors--con-",
            "name": "Ancient Protectors (Con)",
            "snippet": "That ship may only use hold actions during the game.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      }
    ]
  },
  {
    "system": {
      "name": "Warfleets: FTL",
      "universe": "Warfleets",
      "version": {
        "label": "v1.1",
        "major": 1,
        "minor": 1,
        "lastModified": "2020-12-13T00:00:00.000Z"
      },
      "hubLink": "https://onepagerules.com/portfolio/warfleets-ftl/"
    },
    "short": "FTL",
    "key": "xenos",
    "faction": "Xenos",
    "version": "v1.5",
    "hint": "Offensive faction with cheap and fragile ships built for swarm tactics.",
    "shipClasses": [
      {
        "key": "matriarch",
        "label": "Matriarch",
        "category": "Ship",
        "type": "Heavy Ship",
        "cost": 60,
        "speed": {
          "move": 4,
          "cruise": 6
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 24,
          "attacks": 2,
          "strength": 2
        },
        "defense": {
          "evasion": 2,
          "toughness": 2
        },
        "upgradeSlotCount": 3,
        "specialRules": [],
        "faction": "Xenos"
      },
      {
        "key": "guardian",
        "label": "Guardian",
        "category": "Ship",
        "type": "Medium Ship",
        "cost": 40,
        "speed": {
          "move": 6,
          "cruise": 9
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 18,
          "attacks": 2,
          "strength": 1
        },
        "defense": {
          "evasion": 3,
          "toughness": 3
        },
        "upgradeSlotCount": 2,
        "specialRules": [],
        "faction": "Xenos"
      },
      {
        "key": "warrior",
        "label": "Warrior",
        "category": "Ship",
        "type": "Light Ship",
        "cost": 20,
        "speed": {
          "move": 8,
          "cruise": 12
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 12,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 4,
          "toughness": 4
        },
        "upgradeSlotCount": 1,
        "specialRules": [],
        "faction": "Xenos"
      },
      {
        "key": "parasite-squadron",
        "label": "Parasite Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Counter-Attack",
          "Fragile"
        ],
        "faction": "Xenos"
      },
      {
        "key": "tentacle-squadron",
        "label": "Tentacle Squadron",
        "category": "Squadron",
        "type": "Squadron",
        "cost": 10,
        "speed": {
          "move": 10,
          "cruise": 15
        },
        "turret": {
          "type": "weapon",
          "key": "turret",
          "label": "Turret",
          "range": 2,
          "attacks": 2,
          "strength": 0
        },
        "defense": {
          "evasion": 5,
          "toughness": 5
        },
        "upgradeSlotCount": 0,
        "specialRules": [
          "Swarm",
          "Fragile"
        ],
        "faction": "Xenos"
      }
    ],
    "upgrades": [
      {
        "type": "upgrade",
        "key": "crushing-maw",
        "label": "Crushing Maw",
        "effect": "When ramming ships roll one die, on a 4-6 deal +2 damage, on a 1-3 deal +1 damage and take +1 damage.",
        "modifiers": [],
        "faction": "Xenos"
      },
      {
        "type": "upgrade",
        "key": "pheromone-glands",
        "label": "Pheromone Glands",
        "effect": "Friendly squadrons within 6“ get +1 to hit when targeting enemy squadrons.",
        "modifiers": [],
        "faction": "Xenos"
      },
      {
        "type": "upgrade",
        "key": "predator-cysts",
        "label": "Predator Cysts",
        "effect": "Turret gets +1 to hit and +1 strength when targeting enemy ships that already activated this round.",
        "modifiers": [],
        "faction": "Xenos"
      },
      {
        "type": "upgrade",
        "key": "toxin-sacs",
        "label": "Toxin Sacs",
        "effect": "Enemy ships attacking this ship from within 4“ that deal any damage immediately take 2 damage.",
        "modifiers": [],
        "faction": "Xenos"
      },
      {
        "type": "weapon",
        "key": "acid-spray",
        "label": "Acid Spray",
        "range": 6,
        "attacks": 4,
        "strength": 0,
        "special": "Counts as having the Broadside rule.",
        "faction": "Xenos"
      },
      {
        "type": "weapon",
        "key": "bio-cannon",
        "label": "Bio-Cannon",
        "range": 12,
        "attacks": 2,
        "strength": 0,
        "special": "Counts as having the Blast rule.",
        "faction": "Xenos"
      },
      {
        "type": "weapon",
        "key": "spike-launcher",
        "label": "Spike Launcher",
        "range": 12,
        "attacks": 4,
        "strength": 0,
        "special": "Counts as having the Anti-Ship rule.",
        "faction": "Xenos"
      }
    ],
    "heroes": [
      {
        "type": "hero",
        "key": "brood-controller",
        "label": "Brood Controller",
        "effect": "When this ship is activated all friendly unengaged squadrons within 4“ may immediately move by up to half their move speed.",
        "cost": 15,
        "modifiers": []
      },
      {
        "type": "hero",
        "key": "tyrant-champion",
        "label": "Tyrant Champion",
        "effect": "This ship gets +4 to hit and +4 strength when attacking enemy heroes with its turret.",
        "cost": 10,
        "modifiers": []
      }
    ],
    "titles": [
      {
        "type": "title",
        "key": "devourer",
        "label": "Devourer",
        "effect": "This ship’s turret gets the Deadly rule.",
        "cost": 10,
        "modifiers": []
      },
      {
        "type": "title",
        "key": "wrecker",
        "label": "Wrecker",
        "effect": "This ship’s turret gets the Deadly rule when targeting enemies in their rear facing.",
        "cost": 5,
        "modifiers": []
      }
    ],
    "specialRules": [
      {
        "type": "special-rule",
        "key": "counter-attack",
        "label": "Counter-Attack",
        "effect": "After being shot at by squadrons may shoot back."
      },
      {
        "type": "special-rule",
        "key": "swarm",
        "label": "Swarm",
        "effect": "Gets +1 to hit and +1 strength for each other friendly squadron that is engaged with the target."
      }
    ],
    "legendaryFleets": [
      {
        "key": "endless-hunger",
        "name": "Endless Hunger",
        "pro": "Friendly ships deal +X damage when using ram actions, where X is their max. number of upgrades.",
        "con": "Enemies hit on 2+ when targeting friendly ships that are 12“ or closer.",
        "modifiers": [
          {
            "key": "endless-hunger--pro-",
            "name": "Endless Hunger (Pro)",
            "snippet": "Friendly ships deal +X damage when using ram actions, where X is their max. number of upgrades.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "endless-hunger--con-",
            "name": "Endless Hunger (Con)",
            "snippet": "Enemies hit on 2+ when targeting friendly ships that are 12“ or closer.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "dread-fleet",
        "name": "Dread Fleet",
        "pro": "Friendly ships get +1 strength when shooting at targets that are 12“ or closer.",
        "con": "Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.",
        "modifiers": [
          {
            "key": "dread-fleet--pro-",
            "name": "Dread Fleet (Pro)",
            "snippet": "Friendly ships get +1 strength when shooting at targets that are 12“ or closer.",
            "effects": {
              "categoryFilter": "Ship"
            }
          },
          {
            "key": "dread-fleet--con-",
            "name": "Dread Fleet (Con)",
            "snippet": "Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.",
            "effects": {
              "categoryFilter": "Ship"
            }
          }
        ]
      },
      {
        "key": "void-maw",
        "name": "Void Maw",
        "pro": "Whenever a friendly heavy ship is activated, all enemy squadrons within 4“ are destroyed.",
        "con": "Enemy squadrons always deal +1 damage when targeting friendly heavy ships.",
        "modifiers": [
          {
            "key": "void-maw--pro-",
            "name": "Void Maw (Pro)",
            "snippet": "Whenever a friendly heavy ship is activated, all enemy squadrons within 4“ are destroyed.",
            "effects": {
              "typeFilter": "Heavy Ship"
            }
          },
          {
            "key": "void-maw--con-",
            "name": "Void Maw (Con)",
            "snippet": "Enemy squadrons always deal +1 damage when targeting friendly heavy ships.",
            "effects": {
              "typeFilter": "Heavy Ship"
            }
          }
        ]
      }
    ]
  }
];