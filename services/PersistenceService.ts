import { Dispatch } from "react";
import { ArmyState, loadArmyData, setGameSystem } from "../data/armySlice";
import { ISaveData, ISelectedUnit, IUpgradeGainsWeapon } from "../data/interfaces";
import { ListState, loadSavedList } from "../data/listSlice";
import DataService from "./DataService";
import { groupBy } from "./Helpers";
import UnitService from "./UnitService";
import UpgradeService from "./UpgradeService";

export default class PersistenceService {

  private static prefix = "AF_Save_";

  private static getSaveKey(list: ListState) {
    return this.prefix + list.creationTime;
  }

  public static saveImport(saveName: any, json: string) {
    localStorage[this.prefix + saveName] = json;
  }

  public static createSave(army: ArmyState, name: string, existingList?: ListState): string {

    const creationTime = new Date().getTime().toString();
    const list: ListState = existingList
      ? {
        ...existingList,
        creationTime: creationTime,
        undoUnitRemove: null
      }
      : {
        creationTime: creationTime,
        name: name,
        units: [],
        points: 0,
        undoUnitRemove: null
      };

    const saveData: ISaveData = {
      gameSystem: army.gameSystem,
      armyId: army.data.uid,
      armyFile: army.armyFile,
      armyName: army.data.name,
      modified: new Date().toJSON(),
      listPoints: 0,
      list
    };

    console.log("Creating save...", saveData);

    const json = JSON.stringify(saveData);

    localStorage[this.getSaveKey(list)] = json;

    return creationTime;
  }

  public static updateSave(list: ListState) {

    const localSave = localStorage[this.getSaveKey(list)];
    if (!localSave)
      return;

    const existingSave: ISaveData = JSON.parse(localSave);
    const points: number = UpgradeService.calculateListTotal(list.units);

    const saveData: ISaveData = {
      ...existingSave,
      modified: new Date().toJSON(),
      listPoints: points,
      list,
    };

    console.log("Updating save...", saveData);

    const json = JSON.stringify(saveData);

    localStorage[this.getSaveKey(list)] = json;
  }

  public static delete(list: ListState) {
    delete localStorage[this.getSaveKey(list)];
  }

  public static load(dispatch: Dispatch<any>, save: ISaveData, callback: (armyData: any) => void) {

    console.log("Loading save...", save);

    const loaded = data => {
      dispatch(setGameSystem(save.gameSystem));
      dispatch(loadArmyData(data));
      dispatch(loadSavedList(save.list));
    };

    if (save.armyId) {
      DataService.getApiData(save.armyId, data => {
        loaded(data);
        callback(data);
      });
    } else {
      DataService.getJsonData(save.armyFile, data => {
        loaded(data);
        callback(data);
      });
    }
  }

  public static download(list: ListState) {
    const saveData = localStorage[this.getSaveKey(list)];
    const blob = new Blob([saveData], { type: "application/json" })
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${list.name}${list.creationTime}.json`;
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('click'));
  }

  public static checkExists(list: ListState): boolean {
    return !!localStorage[this.getSaveKey(list)];
  }

  public static copyAsText(list: ListState) {

    const lines = [
      `++ ${list.name} [${list.points}pts] ++\n`
    ];

    const getWeapons = (unit: ISelectedUnit) => {
      const equipment = unit.equipment
        .concat(UnitService.getAllUpgradeWeapons(unit) as IUpgradeGainsWeapon[])
        .filter(e => e.count > 0);

      return equipment
        .map(e => `${e.count > 1 ? `${e.count}x ` : ""}${e.label}`)
        .join(", ");
    };

    const getRules = (unit: ISelectedUnit) => {
      const rules = (unit.specialRules ?? [])
        .concat(UnitService.getAllUpgradedRules(unit));

      const ruleGroups = groupBy(rules, "name");
      const keys = Object.keys(ruleGroups);
      // Sort rules alphabetically
      keys.sort((a, b) => a.localeCompare(b));

      return keys.join(", ");
    };

    // Unit name [size] Qua 3+ Def 4+ 123pts
    // 2x Hand Weapons, Rifle
    // Fearless
    //
    // ...
    for (let unit of list.units) {
      lines.push(`${unit.customName ?? unit.name}${unit.size > 1 ? ` [${unit.size}]` : ""} | Qua ${unit.quality}+ Def ${unit.defense}+ | ${UpgradeService.calculateUnitTotal(unit)}pts`);
      lines.push(getWeapons(unit));
      lines.push(getRules(unit) + "\n");
    }

    navigator.clipboard.writeText(lines.join("\n")).then(() => console.log("Copied to clipboard..."));
  }
}
