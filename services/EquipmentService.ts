import { IUpgradeGains, IUpgradeGainsItem, IUpgradeGainsRule, IUpgradeGainsWeapon } from "../data/interfaces";
import pluralise from "pluralize";
import RulesService from "./RulesService";

export default class EquipmentService {

  /**
   * Compares an equipment with a search term.
   * @param hasItem The equipment to test against.
   * @param searchItem The term we are seeking a comparison for.
   * @returns true if the equipment is a match, false otherwise.
   */
  public static compareEquipment(hasItem: IUpgradeGains, searchItem: string): boolean {
    // "replace [nothing] -> always ok"
    if (!searchItem) return true

    const find = pluralise.singular(searchItem?.toLowerCase().trim() || "")

    if (["equipment"].includes(find)) return !!hasItem

    if (["melee weapon"].includes(find)) {
      return (
        (hasItem?.type === "ArmyBookWeapon") &&
        (hasItem as IUpgradeGainsWeapon).range == 0)
    }

    if (["gun", "ranged weapon"].includes(find)) {
      return (
        (hasItem?.type === "ArmyBookWeapon") &&
        (hasItem as IUpgradeGainsWeapon).range > 0)
    }

    if (["weapon"].includes(find)) {
      return (hasItem?.type === "ArmyBookWeapon")
    }

    // otherwise match by name
    return this.compareEquipmentNames(hasItem.name, find) || this.compareEquipmentNames(hasItem.label, find)
  }

  public static compareEquipmentNames(hasItem: string, searchItem: string): boolean {
    let find = searchItem?.toLowerCase().trim()
    return pluralise.singular(hasItem?.toLowerCase() || "") === pluralise.singular(find || "");
  }

  public static find(list: IUpgradeGainsWeapon[], match: string): IUpgradeGainsWeapon[] {
    return list
      .filter(e => this.compareEquipment(e, match));
  }

  public static findLast(list: IUpgradeGainsWeapon[], match: string): IUpgradeGainsWeapon {
    const matches = list
      .filter(e => this.compareEquipment(e, match));
    return matches[matches.length - 1];
  }

  public static findLastIndex(array: IUpgradeGainsWeapon[], match: string) {
    let l = array.length;
    while (l--) {
      if (this.compareEquipment(array[l], match))
        return l;
    }
    return -1;
  }

  static getAP(e: IUpgradeGainsWeapon): number {
    if (!e || !e.specialRules) return null;

    const ap = e.specialRules.find(r => r.name === "AP");
    return ap ? parseInt(ap.rating) : null;
  }

  static formatString(eqp: IUpgradeGains): string {
    const parts = [];
    const name = eqp.count > 1 ? pluralise.plural(eqp.name) : eqp.name;
    const attacks = eqp.attacks ? `A${eqp.attacks}` : null;
    if (attacks) {
      const weapon = eqp as IUpgradeGainsWeapon;
      parts.push(weapon.range ? `${weapon.range}"` : null)
    }
    parts.push(attacks);
    const rules = eqp.specialRules?.map(r => RulesService.displayName(r)) ?? [];
    parts.push(...rules);
    if (eqp.type === "ArmyBookItem") {
      const item = eqp as IUpgradeGainsItem;
      parts.push(...item.content.map(c => this.formatString(c)));
    }

    const displayParts = parts.filter((m) => !!m);

    return displayParts.length > 0
      ? `${name} (${displayParts.join(", ")})`
      : name; // comma separated list
  }

  static getStringParts(eqp: IUpgradeGains, count: number): { name: string, rules: string } {
    const name = count > 1 ? pluralise.plural(eqp.name || eqp.label) : eqp.name || eqp.label;
    const weapon = eqp.type === "ArmyBookWeapon" ? eqp as IUpgradeGainsWeapon : null;
    const item = eqp.type === "ArmyBookItem" ? eqp as IUpgradeGainsItem : null;
    const rule = eqp.type === "ArmyBookItem" ? eqp as IUpgradeGainsRule : null;
    const range = weapon && weapon.range ? `${weapon.range}"` : null;
    const attacks = weapon && weapon.attacks ? `A${weapon.attacks}` : null;
    const specialRules = weapon?.specialRules
      || item?.content.filter(c => c.type === "ArmyBookRule" || c.type === "ArmyBookDefense") as IUpgradeGainsRule[]
      || [];

    return {
      name: name,
      rules: [range, attacks] // Range, then attacks
        .concat(specialRules.map(r => RulesService.displayName(r))) // then special rules
        .filter((m) => !!m) // Remove empty/null entries
        .join(", ") // csv
    }
  }
}