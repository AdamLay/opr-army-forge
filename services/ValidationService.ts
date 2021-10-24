import { ListState } from "../data/listSlice";
import _ from "lodash";
import { ArmyState } from "../data/armySlice";

export default class ValidationService {
  public static getErrors(army: ArmyState, list: ListState): string[] {

    const errors = [];

    if (list.pointsLimit > 0 && list.points > list.pointsLimit)
        errors.push(`Points limit exceeded: ${list.points}/${list.pointsLimit}`)

    if (army.gameSystem === "gf") {

      const unitCount = list.units.filter(u => !u.joinToUnit).length;
      const heroCount = list.units.filter(u => u.specialRules.findIndex(rule => rule.name === "Hero") >= 0).length;
      
      if (heroCount > Math.floor(list.points / 500))
        errors.push(`Max 1 hero per full 500pts.`);
      if (unitCount > Math.floor(list.points / 200))
        errors.push(`Max 1 unit per full 200pts (combined units count as just 1 unit).`);
      if (list.units.some(u => u.combined && u.size === 2))
        errors.push(`Cannot combine units of unit size [1].`);
      if (Object.values(_.groupBy(list.units, u => u.name)).some((grp: any[]) => grp.length > 3))
        errors.push(`Cannot have more than 3 copies of a particular unit.`);
    }

    return errors;
  }
}