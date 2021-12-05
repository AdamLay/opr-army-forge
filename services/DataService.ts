import { nanoid } from "nanoid";
import { IUnit, IUpgradeGains, IUpgradeOption, IUpgradePackage } from "../data/interfaces";
import DataParsingService from "./DataParsingService";
import { groupBy } from "./Helpers";
import router from "next/router";
import _ from "lodash";
import pluralise from "pluralize";
import styleFunctionSx from "@mui/system/styleFunctionSx";
import EquipmentService from "./EquipmentService";
import UnitService from "./UnitService";

export default class DataService {

  private static useStaging: boolean = false;
  //const webCompanionUrl = `https://opr-list-builder${useStaging ? "-staging" : ""}.herokuapp.com/api`;
  private static webCompanionUrl = 'https://webapp.onepagerules.com/api';

  public static getJsonData(filePath: string, callback: (armyData: any) => void, fallback?: (err: string) => void) {

    fetch(filePath)
      .then((res) => res.json())
      .then((data) => {

        console.log(data);
        var transformData = this.transformApiData(data);
        console.log(transformData);
        callback(transformData);

      }, fallback);
  }

  public static getApiData(armyId: string, callback: (armyData: any) => void, fallback?: (err: string) => void) {

    let dataSourceUrl = router.query.dataSourceUrl ? `https://${router.query.dataSourceUrl}.herokuapp.com/api` : this.webCompanionUrl
    fetch(dataSourceUrl + `/army-books/${armyId}`)
      .then((res) => res.json())
      .then((data) => {
        //console.log(data);

        const afData = DataService.transformApiData(data, fallback);
        //console.log(afData);

        callback(afData);
      })
  }

  public static transformApiData(input, fallback?: (err: string) => void) {
    try {
      const countRegex = /^(\d+)x\s/;

      const upgradePackages: IUpgradePackage[] = input.upgradePackages.map(pkg => ({
        ...pkg,
        sections: pkg.sections.map(section => {
          const upgrade = DataParsingService.parseUpgradeText(section.label + (section.label.endsWith(":") ? "" : ":"));

          // Sanitise dodgy/old data
          delete section.select;
          delete section.affects;
          delete section.replaceWhat;

          return {
            id: section.id ?? nanoid(7),
            ...section,
            ...upgrade,
            options: section.options.map((opt: IUpgradeOption) => {
              const gains = [];
              // Iterate backwards through gains array so we can push new 
              if (opt.gains) for (let original of opt.gains) {
                // Match "2x ", etc

                // Replace "2x " in label/name of original gain
                const gain = {
                  ...original,
                  label: original.label?.replace(countRegex, ""),
                  name: original.name?.replace(countRegex, "")
                };
                // Capture the count digit from the name
                const countMatch = countRegex.exec(original.name);
                // Parse the count if present, otherwise default to 1
                const count = countMatch ? parseInt(countMatch[1]) : 1;
                // Push the gain into the array as many times as the count
                for (let y = 0; y < count; y++) {
                  gains.push(gain);
                }
              }

              // Group/combine gains with same name...
              const gainsGroups = _.groupBy(gains, g => g.label);

              return ({
                ...opt,
                isModel: upgrade.attachModel ?? false,
                cost: typeof (opt.cost ?? 0) === "number" ? opt.cost : parseInt((opt.cost as any).toString().replace(/pts?/, "")),
                id: opt.id || nanoid(5), // Assign ID to upgrade option if one doesn't exist

                // Group same items back together and sum the count
                gains: Object.values(gainsGroups).map((grp: any[]) => {
                  const count = grp.reduce((c, next) => c + (next.count || 1), 0);
                  //console.log(grp[0].label + " " + count, grp);
                  return {
                    ...grp[0],
                    count: count
                  }
                })
              });
            })
          };
        })
      }));

      const units: IUnit[] = input.units.map((u: IUnit) => ({
        ...u,
        // Transform this into a collection of upgrades
        equipment: u.equipment.map(e => {
          // Capture the count digit from the name
          const countMatch = countRegex.exec(e.label);
          const label = e.label.replace(countRegex, "");
          const count = e.count
            ? e.count * u.size
            : (countMatch ? parseInt(countMatch[1]) * u.size : u.size);
          return {
            ...e,
            label: label,
            name: e.name || label,
            count: count,
            originalCount: count,
            type: "ArmyBookWeapon",
            specialRules: e.specialRules.map(DataParsingService.parseRule)
          }
        }),
        disabledUpgradeSections: (() => {
          const sections: { id: string, options: { gains: { name: string } }[], replaceWhat: string[] }[] = _.compact(u.upgrades
            // Map all upgrade packages
            .map(uid => upgradePackages.find(pkg => pkg.uid === uid)))
            // Flatten down to array of all upgrade sections
            .reduce((sections, next) => sections.concat(next.sections), []);

          const allGains: IUpgradeGains[] = sections
            .reduce((opts, next) => opts.concat(next.options), [])
            .reduce((gains, next) => gains.concat(next.gains), [])
            //.map(gain => gain.name);

          const disabledSections: string[] = [];

          // For each section, check that the unit has access to the things it wants to replace
          // Only need sections that are replacing (or looking for) something
          for (let section of sections.filter(s => s.replaceWhat)) {
            for (let what of section.replaceWhat) {

              // Does equipment contain this thing?
              const equipmentMatch = u.equipment.some(e => EquipmentService.compareEquipment({...e, label:e.label.replace(countRegex, "")}, what));
              // If equipment, then we won't be disabling this section...
              if (equipmentMatch)
                continue;

              // Do any upgrade sections contain this thing?
              const upgradeGains = allGains.find(g => EquipmentService.compareEquipment(g, what));
              // If upgrade gains found, don't disable this
              if (upgradeGains)
                continue;

              // If neither was found, then disable this section
              disabledSections.push(section.id);
            }
          }

          return disabledSections;
        })()
      }));

      const data = {
        ...input,
        units,
        upgradePackages
      };

      for (let unit of data.units) {
        // Group equipment by name
        const groups = groupBy(unit.equipment, "name");

        // Take first equipment in each group, with a count set to how many are in the group
        unit.equipment = Object
          .values(groups)
          .map((group: any[]) => {
            const countInGroup = group.reduce((count, next) => count + (next.count ?? 1), 0);
            return {
              ...group[0],
              count: countInGroup// * unit.size
            };
          });
      }

      return data;
    } catch (err) { if (typeof (fallback) == "function") fallback(err) }
  }
}