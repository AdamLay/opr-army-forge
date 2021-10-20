import { IEquipment, IUpgradeGainsItem, IUpgradeGainsRule } from '../data/interfaces';
import DataParsingService from './DataParsingService';
import EquipmentService from './EquipmentService';

test("Format basic string", () => {
    const e: IEquipment = {
        name: "Sword",
        attacks: 3
    };

    const result = EquipmentService.formatString(e);

    expect(result).toBe("Sword (A3)");
})

test("Item string parts", () => {
    const parts = EquipmentService.getStringParts({
        label: "Light Shields (Defense +1 in melee)",
        name: "Light Shields",
        content: [
            {
                key: "defense",
                name: "Defense",
                rating: "1",
                condition: "in melee"
            }
        ],
        type: "ArmyBookItem"
    } as any, 1);

    expect(parts).toStrictEqual({
        name: "Light Shields",
        rules: ""
    });

    const parts2 = EquipmentService.getStringParts({
        label: "Shield Bash (A2)",
        name: "Shield Bash",
        attacks: 2,
        specialRules: [],
        type: "ArmyBookWeapon"
    } as any, 1);

    expect(parts2).toStrictEqual({
        name: "Light Shields",
        rules: ""
    });
});

test("String parts for item", () => {

    var item: IUpgradeGainsItem = {
        content: [
            {
                condition: "in melee",
                key: "defense",
                name: "Defense",
                rating: "1",
                type: "ArmyBookDefense"
            } as IUpgradeGainsRule
        ],
        label: "Light Shields (Defense +1 in melee)",
        name: "Light Shields",
        type: "ArmyBookItem",
        count: 3
    };

    const parts = EquipmentService.getStringParts(item, 3);
});

test("String parts for weapon platform", () => {
    var input = 'Gun Platform (Star Cannon (36”, A2, AP(2))) +20pts';
    var upgrade = DataParsingService.parseEquipment(input, true);
    var parts = EquipmentService.getStringParts(upgrade, 1);
    expect(parts).toStrictEqual({});
})