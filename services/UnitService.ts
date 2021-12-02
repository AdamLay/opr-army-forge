import { nanoid } from "@reduxjs/toolkit";
import { IUnit, ISelectedUnit, IUpgradeGains, IUpgradeGainsItem, IUpgradeGainsMultiWeapon, IUpgradeGainsRule, IUpgradeGainsWeapon } from "../data/interfaces";
import { ListState } from "../data/listSlice";
import _ from "lodash";

export default class UnitService {

  public static getSelected(list: ListState): ISelectedUnit {
    return list.selectedUnitId === null || list.selectedUnitId === undefined
      ? null
      : list.units.filter(u => u.selectionId === list.selectedUnitId)[0];
  }

  public static getAllUpgrades(unit: ISelectedUnit, excludeModels: boolean): IUpgradeGains[] {
    return unit
      .selectedUpgrades
      .filter(u => excludeModels ? !u.isModel : true)
      .reduce((value, option) => value.concat(option.gains), []);
  }

  public static getAllUpgradedRules(unit: ISelectedUnit): IUpgradeGainsRule[] {
    const upgrades = this.getAllUpgrades(unit, true);

    const rules = upgrades.filter(u => u.type === "ArmyBookRule") || [];
    const rulesFromitems = upgrades
      .filter(u => u.type === "ArmyBookItem")
      .reduce((value, u: IUpgradeGainsItem) => value.concat(u.content.filter(c => c.type === "ArmyBookRule" || c.type === "ArmyBookDefense")), []) || [];

    const allRules: IUpgradeGainsRule[] = rules.concat(rulesFromitems) as IUpgradeGainsRule[];

    return allRules;
  }

  public static getAllWeapons(unit: ISelectedUnit): IUpgradeGainsWeapon[] {
    return unit.equipment.concat(this.getAllUpgradeWeapons(unit) as IUpgradeGainsWeapon[]);
  }

  public static getAllUpgradeWeapons(unit: ISelectedUnit): (IUpgradeGainsWeapon | IUpgradeGainsMultiWeapon)[] {

    const isWeapon = u => u.type === "ArmyBookWeapon" || u.type === "ArmyBookMultiWeapon";
    const itemWeapons = this
      .getAllUpgradeItems(unit)
      .reduce((value, i) => value.concat(i.content.filter(isWeapon)), []);

    const all = this
      .getAllUpgrades(unit, false)
      .filter(isWeapon)
      .concat(itemWeapons) as (IUpgradeGainsWeapon | IUpgradeGainsMultiWeapon)[];

    return all;
  }

  public static getAllUpgradeItems(unit: ISelectedUnit): IUpgradeGainsItem[] {
    return this
      .getAllUpgrades(unit, false)
      .filter(u => u.type === "ArmyBookItem") as IUpgradeGainsItem[];
  }

  public static getSize(unit: ISelectedUnit): number {
    const extraModelCount = unit.selectedUpgrades.filter(u => u.isModel).length;
    return unit.size + extraModelCount;
  }

  public static getRealUnit(unit: IUnit, dummy = false): ISelectedUnit {
    return {
      ...unit,
      selectionId: dummy ? "dummy" : nanoid(5),
      selectedUpgrades: [],
      combined: false,
      joinToUnit: null,
      equipment: unit.equipment.map(eqp => ({
        ...eqp,
        count: eqp.count || unit.size // Add count to unit size if not already present
      }))
    }
  }

  public static getParents(list: ListState, unit: ISelectedUnit) : ISelectedUnit[] {
    return list.units.filter(u => u.joinToUnit === unit.selectionId)
  }
  public static getChildren(list: ListState, unit: ISelectedUnit) : ISelectedUnit[] {
    return list.units.filter(u => u.selectionId === unit.joinToUnit)
  }
  public static getFamily(list: ListState, unit: ISelectedUnit) : ISelectedUnit[] {
    let parents = UnitService.getParents(list, unit)
    let grandparents = parents.flatMap(u => {return UnitService.getParents(list, u)})
    let children = UnitService.getChildren(list, unit)
    let grandchildren = children.flatMap(u => {return UnitService.getChildren(list, u)})
    return _.uniq([...grandparents, ...parents, unit, ...children, ...grandchildren])
  }
}
