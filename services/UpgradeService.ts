import { ISelectedUnit, IUpgrade, IUpgradeGains, IUpgradeGainsItem, IUpgradeOption } from "../data/interfaces";
import EquipmentService from "./EquipmentService";
import "../extensions";
import DataParsingService from "./DataParsingService";
import RulesService from "./RulesService";
import { current } from "immer";
import { nanoid } from "nanoid";

export default class UpgradeService {
  static calculateListTotal(list: ISelectedUnit[]) {
    return list
      .reduce((value, current) => value + UpgradeService.calculateUnitTotal(current), 0);
  }

  // DEPRECATED
  public static displayName(upgrade: IUpgrade, unit: ISelectedUnit): string {
    const numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];

    function capitaliseFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const combinedMultiplier = 1 //unit && unit.combined ? 2 : 1;

    const affects = typeof (upgrade.affects) === "number"
      ? numbers[upgrade.affects * combinedMultiplier]
      : upgrade.affects;

    const select = upgrade.select
      ? typeof (upgrade.select) === "number"
        ? (upgrade.select * combinedMultiplier) > 1
          ? `up to ${numbers[upgrade.select * combinedMultiplier]}`
          : numbers[upgrade.select * combinedMultiplier]
        : upgrade.select
      : "";

    if (upgrade.type === "upgrade") {
      if (upgrade.model) {
        if (upgrade.attachment)
          return `${capitaliseFirstLetter(affects)} model may take${select ? ` ${select}` : ""} ${upgrade.replaceWhat[0]} attachment`.trim();
        if (select && !affects)
          return `Upgrade ${select} models with`.trim();
        return `Upgrade ${affects} model${affects === "all" ? "s" : ""} with ${select}`.trim();
      } else {
        if (upgrade.attachment)
          return `Take ${select} ${upgrade.replaceWhat[0]} attachment`.trim();
        else if (upgrade.replaceWhat)
          return `Upgrade ${affects} ${upgrade.replaceWhat[0]} with ${select}`.trim();
        return `Upgrade with ${select}`.trim();
      }
    }
    else if (upgrade.type === "replace") {
      const what = upgrade.replaceWhat.join(" and ");
      if (affects) {
        if (upgrade.model) {
          if (upgrade.attachment) {

          } else {
            return `${capitaliseFirstLetter(affects)} model may replace${select ? ` ${select}` : ""} ${what}`.trim();
          }
        } else {
          return `Replace ${affects}${select ? ` ${select}` : ""} ${what}`.trim();
        }
      } else {
        return `Replace${select ? ` ${select}` : ""} ${what}`.trim();
      }
    }
  }

  static calculateUnitTotal(unit: ISelectedUnit) {
    if (!unit) return 0;
    let cost = unit.cost;

    for (const upgrade of unit.selectedUpgrades) {
      if (upgrade.cost) {
        cost += upgrade.cost;
      }
    }

    return cost;
  }

  public static isApplied(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption): boolean {

    return unit.selectedUpgrades.contains(u => u.id === option.id);
  }

  public static countApplied(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption): number {
    return unit.selectedUpgrades.filter(u => u.id === option.id).length;
  }

  public static findUpgrade(unit: ISelectedUnit, what: string, forRestore: boolean) {

    const selectedGains: IUpgradeGains[] = unit.selectedUpgrades.reduce((gains, next) => gains.concat(next.gains), []);
    const upgradeGains: IUpgradeGains[] = forRestore
      ? selectedGains.concat(unit.equipment)
      : (unit.equipment as IUpgradeGains[]).concat(selectedGains);

    // Try and find an upgrade instead
    for (let i = upgradeGains.length - 1; i >= 0; i--) {
      const gain = upgradeGains[i];
      const isMatch = EquipmentService.compareEquipment(gain, what);

      if (isMatch && (forRestore ? gain.count < gain.originalCount : gain.count > 0))
        return gain;

      // Check inside items
      if (gain.type === "ArmyBookItem") {
        const item = gain as IUpgradeGainsItem;
        const toReplace = item
          .content
          .filter(e => EquipmentService.compareEquipment(e, what))[0];

        if (toReplace && (forRestore ? toReplace.count < toReplace.originalCount : toReplace.count > 0))
          return toReplace;
      }
    }

    return null;
  }

  public static getControlType(unit: ISelectedUnit, upgrade: IUpgrade): "check" | "radio" | "updown" {
    const combinedMultiplier = 1 //unit.combined ? 2 : 1;
    const combinedAffects = upgrade.affects //(unit.combined && typeof (upgrade.affects) === "number") ? upgrade.affects * 2 : upgrade.affects;

    if (upgrade.type === "upgrade") {

      // "Upgrade any model with:"
      if (upgrade.affects === "any" && (unit?.size > 1 || (upgrade.replaceWhat && upgrade.replaceWhat[0]?.length > 0)))
        return "updown";

      // Select > 1
      if (typeof (upgrade.select) === "number") {

        // "Upgrade with one:"
        if ((upgrade.select * combinedMultiplier) === 1)
          return "radio";

        return "updown";
      }

      return "check";
    }

    // "Upgrade Psychic(1):"
    if (upgrade.type === "upgradeRule") {
      return "check";
    }

    if (upgrade.type === "replace") {

      // "Replace [weapon]:"
      if (!upgrade.affects) {
        if (typeof (upgrade.select) === "number")
          return "updown";
        return "radio";
      }
      // "Replace one [weapon]:"
      // "Replace all [weapons]:"
      if (combinedAffects === 1 || upgrade.affects === "all") {
        return "radio";
      }
      // "Replace any [weapon]:"
      // "Replace 2 [weapons]:"
      if (upgrade.affects === "any" || typeof (upgrade.affects) === "number") {
        return "updown";
      }
    }

    console.error("No control type for: ", upgrade);

    return "updown";
  }

  public static isValid(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption): boolean {

    const controlType = this.getControlType(unit, upgrade);
    //const alreadySelected = this.countApplied(unit, upgrade, option);
    const appliedInGroup = upgrade.options.reduce((total, next) => total + this.countApplied(unit, upgrade, next), 0);

    // if it's a radio, it's valid if any other upgrade in the group is already applied
    if (controlType === "radio")
      if (appliedInGroup > 0)
        return true;

    if (upgrade.type === "replace") {

      const replaceCount = typeof (upgrade.affects) === "number"
        ? upgrade.affects
        : 1;

      const canReplaceSet = (options: string[]) => {
        if (!Array.isArray(options)) {
          options = [options];
        }
        for (let what of options) {

          const toRestore = this.findUpgrade(unit, what, false);

          if (!toRestore)
            return false;

          // Nothing left to replace
          if ((toRestore.count - replaceCount) < 0)
            return false;

          // May only select up to the limit
          if (typeof (upgrade.select) === "number") {
            // Any model may replace 1...
            if (upgrade.affects === "any") {
              if (appliedInGroup >= upgrade.select * unit.size) {
                return false;
              }
            } else if (appliedInGroup >= upgrade.select) {
              return false;
            }
          } else if (unit.combined && upgrade.affects === 1 && appliedInGroup >= 2) {
            return false;
          }
        }
        return true;
      }

      let canReplace = false;

      // Dealing with a combination of alternate replace options...
      if (typeof (upgrade.replaceWhat[0]) !== "string") {
        // For each combination
        for (let set of upgrade.replaceWhat as string[][]) {
          canReplace ||= canReplaceSet(set);
        }
      } else {
        canReplace = canReplaceSet(upgrade.replaceWhat as string[])
      }
      if (!canReplace)
        return false;
    }

    if (upgrade.type === "upgrade") {
      
      // Upgrade 'all' doesn't require there to be any; means none if that's all there is?
      //if (upgrade.affects === "all") return true

      // upgrade (n? (models|weapons)?) with...
      var available = unit.size
      
      // if replacing equipment, count number of those equipment available
      if (upgrade.replaceWhat) {
        for (let what of upgrade.replaceWhat as string[]) {

          available = unit.selectedUpgrades
            // Take all gains from all selected upgrades
            .reduce((gains, next) => gains.concat(next.gains), [])
            // Add original equipment (for each model)
            .concat(unit.equipment.map(e => {return {...e, count: e.count * unit.size}}))
            // Take only the gains that match this dependency
            .filter(g => EquipmentService.compareEquipment(g, what))
            // Count how many we have
            .reduce((count, next) => count + next.count, 0);

        }
      }

       // Upgrade [(any)?] with n:
      if (typeof (upgrade.select) === "number") {

        if (upgrade.affects === "any") {

          if (appliedInGroup >= upgrade.select * available) {
            return false;
          }

        } else if (appliedInGroup >= upgrade.select) {
          return false;
        }

        // Upgrade any
      } else if (upgrade.affects === "any" && appliedInGroup >= available) {
        return false;
      }
    }

    return true;
  };

  public static apply(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption) {

    // Function to apply the upgrade option to the unit
    const apply = (replacedCount?: number) => {

      const applyCount = gain => replacedCount !== undefined
        ? (replacedCount * gain.count)
        : gain.count;

      const toApply = {
        ...option,
        // TODO: This needs to be calculated, not stored?
        // If you apply this upgrade and THEN toggle combined, the amount will be wrong
        cost: option.cost, //* (unit.combined && upgrade.affects === "all" ? 2 : 1),
        gains: option.gains.map(g => ({
          ...g,
          id: nanoid(7),
          // TODO: Replace 2 with 1
          // TODO: Replace 1 with 2
          count: applyCount(g),
          originalCount: applyCount(g) // e.g. If a unit of 5 has 4 CCWs left...
        })),
        replacedWhat: upgrade.replaceWhat // Keep track of what this option replaced
      };

      // Apply counts to item content
      for (let gain of toApply.gains) {
        if (gain.type !== "ArmyBookItem")
          continue;
        const item = gain as IUpgradeGainsItem;
        item.content = item.content.map(c => ({
          ...c,
          count: gain.count,
          originalCount: gain.count
        }));
      }

      unit.selectedUpgrades.push(toApply);
    };

    const affectsCount = typeof (upgrade.affects) === "number"
      ? upgrade.affects
      : upgrade.affects === "all"
        ? unit.size || 1 // All in unit
        : 1;

    const replace = (options: string[], replaceAction: (toReplace: any, replaceCount: number) => void) => {

      const replace = [];
      if (!Array.isArray(options)) {
        options = [options];
      }
      // Check each option to make sure it's present before acting
      for (let what of options) {

        // Try and find item to replace...
        const toReplace = this.findUpgrade(unit, what, false);

        // Couldn't find the item to replace
        if (!toReplace) {
          console.error(`Cannot find ${upgrade.replaceWhat} to replace!`);
          return -1;
        }

        replace.push(toReplace);
      }

      const availableToReplace = replace.reduce((val, next) => Math.min(val, next.count), 999);
      const replaceCount = Math.min(affectsCount, availableToReplace);

      // Actual modify the options now we know they're all here
      for (let toReplace of replace) {

        console.log("Replacing... ", current(toReplace));

        // If we're replacing an upgrade...
        if (toReplace.type) {
          // ...then track which upgrade replaced it
          (toReplace.dependencies || (toReplace.dependencies = [])).push(option.id);
        }

        replaceAction(toReplace, replaceCount);

        console.log("Replaced... ", current(toReplace));
      }

      return replaceCount;
    }

    if (upgrade.type === "upgradeRule") {
      // TODO: Refactor this - shouldn't be using display name func to compare probably!
      const existingRuleIndex = unit
        .specialRules
        .findIndex(r => RulesService.displayName(r) === (upgrade.replaceWhat[0] as string));

      // Remove existing rule
      if (existingRuleIndex > -1)
        unit.specialRules.splice(existingRuleIndex, 1);

      apply();

      // Add new rule(s)!
      //unit.specialRules = unit.specialRules.concat(option.gains as ISpecialRule[]);

      return;
    }
    else if (upgrade.type === "upgrade") {

      // Upgrade might have dependencies (like "attachments")
      if (upgrade.replaceWhat) {

        // Don't actually do anything, just use this to set the dependencies
        replace(upgrade.replaceWhat as string[], () => { });
      }

      apply(affectsCount);
    }
    else if (upgrade.type === "replace") {

      console.log("Replace " + affectsCount);

      const replaceAction = (toReplace, replaceCount) => {
        // Decrement the count of the item being replaced
        toReplace.count -= replaceCount;

        // TODO: Use Math.max... ?
        if (toReplace.count <= 0)
          toReplace.count = 0;
      };

      let replaceCount = 999;

      // Dealing with a combination of alternate replace options...
      if (typeof (upgrade.replaceWhat[0]) !== "string") {

        let applied = false;
        for (let set of upgrade.replaceWhat as string[][]) {
          replaceCount = replace(set, replaceAction)
          applied ||= replaceCount > 0;
          if (applied)
            break;
        }
        if (!applied)
          return false;

      } else {
        replaceCount = replace(upgrade.replaceWhat as string[], replaceAction);
        if (replaceCount <= 0)
          return false;
      }

      apply(replaceCount);
    }
  }

  public static remove(unit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption) {
    const removeAt = unit.selectedUpgrades.findLastIndex(u => u.id === option.id);
    const toRemove = unit.selectedUpgrades[removeAt];

    // Remove anything that depends on this upgrade (cascade remove)
    const removeDependencies = (dependencies) => {
      if (!dependencies)
        return;
      for (let upgradeId of dependencies) {
        const dependency = unit.selectedUpgrades.find(u => u.id === upgradeId);
        // Might have already been removed!
        if (dependency)
          this.remove(unit, { id: "", replaceWhat: dependency.replacedWhat, type: "replace" }, dependency);
      }
    }
    // Remove dependencies for each item gained from this upgrade
    for (let gains of toRemove.gains) {
      // Also check the item's children
      if ((gains as IUpgradeGainsItem).content)
        for (let content of (gains as IUpgradeGainsItem).content) {
          removeDependencies(content.dependencies);
        }
      removeDependencies(gains.dependencies);
    }

    const count = toRemove.gains[0]?.count;

    console.log(`Removing ${count} of option...`, option);

    // Remove the upgrade
    unit.selectedUpgrades.splice(removeAt, 1);

    if (upgrade.type === "upgradeRule") {

      // Re-add original rule
      unit.specialRules.push(DataParsingService.parseRule(upgrade.replaceWhat[0] as string));

      return;
    }

    if (upgrade.type === "replace") {

      const restore = (options: string[]) => {

        const items = [];
        if (!Array.isArray(options)) {
          options = [options];
        }
        // For each bit of equipment that was originally replaced
        for (let what of options) {

          const toRestore = this.findUpgrade(unit, what, true);

          if (!toRestore) {
            // Uh oh
            console.log("Could not restore " + what, current(unit));
            return false;
          }

          items.push(toRestore);
        }

        console.log("Will restore...", items);

        for (let toRestore of items) {

          // Increase the count by however much was replaced
          toRestore.count += count;
        }

        return true;
      }

      if (typeof (upgrade.replaceWhat[0]) !== "string") {
        for (let set of upgrade.replaceWhat as string[][]) {
          restore(set);
        }
      } else {
        restore(upgrade.replaceWhat as string[]);
      }
    }
  }
}
