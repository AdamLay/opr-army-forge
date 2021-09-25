import { IEquipment, IUpgradeGainsMultiWeapon, IUpgradeGainsRule, IUpgradeGainsWeapon } from "../data/interfaces";
import pluralise from "pluralize";
import RulesService from "./RulesService";
import { FoodBank } from "@mui/icons-material";
import DataParsingService from "./DataParsingService";

export default class EquipmentService {

    private static compareEquipmentNames(a: string, b: string): boolean {
        //return pluralise.singular(a).indexOf(pluralise.singular(b)) > -1;
        return pluralise.singular(a || "") === pluralise.singular(b || "");
    }

    public static find(list: IEquipment[], match: string): IEquipment[] {
        return list
            .filter(e => this.compareEquipmentNames(e.label, match));
    }

    public static findLast(list: IEquipment[], match: string): IEquipment {
        const matches = list
            .filter(e => this.compareEquipmentNames(e.label, match));
        return matches[matches.length - 1];
    }

    public static findLastIndex(array: IEquipment[], match: string) {
        let l = array.length;
        while (l--) {
            if (this.compareEquipmentNames(array[l].label, match))
                return l;
        }
        return -1;
    }

    static getAP(e: IEquipment | IUpgradeGainsWeapon): number {
        if (!e || !e.specialRules) return null;
        const upgrade: IUpgradeGainsWeapon = "type" in e && e.type === "ArmyBookWeapon"
            ? e as IUpgradeGainsWeapon
            : null;
        const ap = upgrade
            ? upgrade.specialRules.filter((r: IUpgradeGainsRule) => r.name === "AP")[0]
            : (e as IEquipment).specialRules.filter((r: string) => r.indexOf("AP") === 0)[0];

        return ap ? parseInt(typeof (ap) === "string" ? DataParsingService.parseRule(ap).rating : ap.rating) : null;
    }

    static formatString(eqp: IEquipment): string {
        const name = eqp.count > 1 ? pluralise.plural(eqp.label) : eqp.label;
        var range = eqp.range ? `${eqp.range}"` : null;

        return `${name} (${[range, eqp.attacks || null] // Range, then attacks
            .concat(eqp.specialRules?.map(RulesService.displayName) || []) // then special rules
            .filter((m) => !!m) // Remove empty/null entries
            .join(", ")})`; // comma separated list
    }

    static getStringParts(eqp: IEquipment): { name: string, rules: string } {
        const name = eqp.count > 1 ? pluralise.plural(eqp.name || eqp.label) : eqp.name || eqp.label;
        const range = eqp.range ? `${eqp.range}"` : null;
        const attacks = eqp.attacks ? "A" + eqp.attacks : null;

        return {
            name: name,
            rules: [range, attacks] // Range, then attacks
                .concat((eqp.specialRules || []).map(RulesService.displayName) || []) // then special rules
                .filter((m) => !!m) // Remove empty/null entries
                .join(", ") // csv
        }
    }
}