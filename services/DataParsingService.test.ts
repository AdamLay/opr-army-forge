import DataParsingService from './DataParsingService';

/*
Regex text cases...

Upgrade with:
Upgrade with one:
Upgrade with up to 2:
Upgrade with up to two:
Upgrade with any:
*/

//#region Upgrades "upgrade"

test("Parse 'Upgrade with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade with:");
  expect(upgrade).toMatchObject({
    type: "upgrade"
  });
});

test("Parse 'Upgrade with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1
  });
});

test("Parse 'Upgrade with any:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade with any:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: "any"
  });
});

test("Parse 'Upgrade with up to 2:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade with up to 2:");
  //console.log(upgrade);
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 2
  });
});

test("Parse 'Upgrade with up to two:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade with up to two:");
  //console.log(upgrade);
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 2
  });
});

test("Parse 'Upgrade all models with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade all models with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "all",
    model: true
  });
});

test("Parse 'Upgrade any model with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any model with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    select: 1,
    model: true
  });
});

test("Parse 'Upgrade all models with any:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade all models with any:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "all",
    select: "any",
    model: true
  });
});

test("Parse 'Upgrade one model with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade one model with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: 1,
    model: true
  });
});

test("Parse 'Upgrade one model with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade one model with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: 1,
    select: 1,
    model: true
  });
});

test("Parse 'Upgrade one model with any:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade one model with any:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: 1,
    select: "any",
    model: true
  });
});

test("Parse 'Upgrade any model with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any model with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    model: true
  });
});

test("Parse 'Upgrade any model with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any model with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    select: 1,
    model: true
  });
});

test("Parse 'Upgrade any model with any:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any model with any:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    select: "any",
    model: true
  });
});

test("Parse 'Upgrade any model with up to two:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any model with up to two:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    select: 2,
    model: true
  });
});

test("Parse 'Upgrade all weapons with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade all weapons with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    affects: "all",
    replaceWhat: ["weapons"]
  });
});

test("Parse 'Upgrade all [weapons] with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade all Crossbows with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    affects: "all",
    replaceWhat: ["Crossbows"]
  });
});

test("Parse 'Upgrade all weapons with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade all weapons with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "all",
    replaceWhat: ["weapons"]
  });
});

test("Parse 'Upgrade all [weapons] with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade all Heavy Rifles with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "all",
    replaceWhat: ["Heavy Rifles"]
  });
});

test("Parse 'Upgrade any [weapons] with one:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any Heavy Rifle with one:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    select: 1,
    replaceWhat: ["Heavy Rifle"]
  });
});

test("Parse 'Upgrade any [weapons] with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade any Heavy Rifle with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    affects: "any",
    replaceWhat: ["Heavy Rifle"]
  });
});

test("Parse 'Upgrade up to two models with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade up to two models with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 2,
    model: true
  });
});

//#endregion

//#region Upgrades other

test("Parse 'Take one [weapon] attachment:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Take one Heavy Rifle attachment:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    attachment: true,
    replaceWhat: ["Heavy Rifle"]
  });
});

test("Parse 'Add one model:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Add one model:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    attachModel: true
  });
});

test("Parse 'Add one model with:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Add one model with:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    attachModel: true
  });
});

test("Parse 'One model may take one [weapon] attachment:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("One model may take one Heavy Rifle attachment:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    affects: 1,
    model: true,
    attachment: true,
    replaceWhat: ["Heavy Rifle"]
  });
});

test("Parse 'Any model may take one [weapon] attachment:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Any model may take one Heavy Rifle attachment:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    affects: "any",
    model: true,
    attachment: true,
    replaceWhat: ["Heavy Rifle"]
  });
});

//#endregion

//#region Upgrades "replace"

test("Parse 'Replace [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace Gauss Rifle:");
  expect(upgrade).toMatchObject({
    type: "replace",
    replaceWhat: ["Gauss Rifle"]
  });
});

test("Parse 'Replace one [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace one CCW:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: 1,
    replaceWhat: ["CCW"]
  });
});

test("Parse 'Replace 2x [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace 2x Armblades:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: 2,
    replaceWhat: ["Armblades"]
  });
});

test("Parse 'Replace 2x [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace 2x Walker Fists:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: 2,
    replaceWhat: ["Walker Fists"]
  });
});

test("Parse 'Replace any [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace any Assault Rifle:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: "any",
    replaceWhat: ["Assault Rifle"]
  });
});

test("Parse 'Replace all [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace all Assault Rifles:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: "all",
    replaceWhat: ["Assault Rifles"]
  });
});

test("Parse 'Replace up to two [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace up to two Assault Rifles:");
  expect(upgrade).toMatchObject({
    type: "replace",
    select: 2,
    replaceWhat: ["Assault Rifles"]
  });
});

test("Parse 'Replace up to three [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace up to three Assault Rifles:");
  expect(upgrade).toMatchObject({
    type: "replace",
    select: 3,
    replaceWhat: ["Assault Rifles"]
  });
});

test("Parse 'Replace [weapon] and [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace Pistol and CCW:");
  expect(upgrade).toMatchObject({
    type: "replace",
    replaceWhat: ["Pistol", "CCW"]
  });
});

test("Parse 'Replace one [weapon] and [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace one Pistol and CCW:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: 1,
    replaceWhat: ["Pistol", "CCW"]
  });
});

test("Parse 'Replace any [weapon] and [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace any Pistol and CCW:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: "any",
    replaceWhat: ["Pistol", "CCW"]
  });
});

test("Parse 'Replace all [weapon] and [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace all Pistols and CCWs:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: "all",
    replaceWhat: ["Pistols", "CCWs"]
  });
});

test("Parse 'Replace up to two [weapon] and [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace up to two Pistols and CCWs:");
  expect(upgrade).toMatchObject({
    type: "replace",
    select: 2,
    replaceWhat: ["Pistols", "CCWs"]
  });
});

test("Parse 'Any model may replace one Razor Claws:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("any model may replace one Razor Claws:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: "any",
    select: 1,
    replaceWhat: ["Razor Claws"],
    model: true,
    attachment: false
  });
});

test("Parse 'Replace [weapon], [weapon] and [weapon]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace Spear-Rifle, Spear and 2x Destroyers:");
  expect(upgrade).toMatchObject({
    type: "replace",
    replaceWhat: ["Spear-Rifle", "Spear", "2x Destroyers"]
  });
});

test("Parse 'Replace any [weapon1] and [weapon2] / [weapon3] and [weapon4]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Replace one R-Carbine and CCW / G-Rifle and CCW:");
  expect(upgrade).toMatchObject({
    type: "replace",
    affects: 1,
    replaceWhat: [
      ["R-Carbine", "CCW"],
      ["G-Rifle", "CCW"],
    ]
  });
});

//#endregion

//#region Upgrades "upgradeRule"

test("Parse 'Upgrade [rule]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Upgrade Psychic(1):");
  expect(upgrade).toMatchObject({
    type: "upgradeRule",
    replaceWhat: ["Psychic(1)"]
  });
});

//#endregion

//#region Upgrade special cases

test("Parse 'Take one [equipment]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Take one Carbine attachment:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    attachment: true,
    replaceWhat: [
      "Carbine"
    ]
  });
});

// No examples of this?
test("Parse 'Take 1 [equipment]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Take 1 Carbine attachment:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1,
    attachment: true,
    replaceWhat: [
      "Carbine"
    ]
  });
});

// No examples of this?
test("Parse 'Take any [equipment]:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Take any Carbine attachments:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: "any",
    attachment: true,
    replaceWhat: [
      "Carbine"
    ]
  });
});

// No examples of this?
test("Parse 'Mount on:'", () => {
  const upgrade = DataParsingService.parseUpgradeText("Mount on:");
  expect(upgrade).toMatchObject({
    type: "upgrade",
    select: 1
  });
});

//#endregion

//#region Equipment

const parse = (str: string, isUpgrade: boolean = false) => {
  const e = DataParsingService.parseEquipment(str, isUpgrade);
  delete e.id;
  if (e.gains)
    for (let g of e.gains)
      delete g.id;
  return e;
}

test("Parse simple melee weapon", () => {
  const e = parse("Sword (A3)");

  expect(e).toStrictEqual({
    label: "Sword",
    attacks: 3,
    specialRules: []
  });
});

test("Parse simple melee weapon", () => {
  const e = parse("Razor Claws (A3) +0pts", true);

  expect(e).toStrictEqual({
    label: "Razor Claws (A3)",
    name: "Razor Claws",
    cost: 0,
    attacks: 3,
    specialRules: [],
    type: "ArmyBookWeapon"
  });
});

test("Parse melee weapon with rules", () => {
  const e = parse("Sword (A3, Rending, AP(1))");

  expect(e).toStrictEqual({
    label: "Sword",
    attacks: 3,
    specialRules: ["Rending", "AP(1)"]
  });
});

test("Parse multiple melee weapon with rules", () => {
  const e = parse("2x Sword (A3, Rending, AP(1))");

  expect(e).toStrictEqual({
    label: "Sword",
    count: 2,
    attacks: 3,
    specialRules: ["Rending", "AP(1)"]
  });
});

test("Parse melee weapon with rules and cost", () => {
  const e = parse("Sword (A3, Rending, AP(1)) +5pts", true);

  expect(e).toStrictEqual({
    label: "Sword (A3, Rending, AP(1))",
    name: "Sword",
    cost: 5,
    attacks: 3,
    specialRules: [
      {
        key: "rending",
        name: "Rending",
        label: "Rending",
        rating: "",
        type: "ArmyBookRule", modify: false
      },
      {
        key: "ap",
        name: "AP",
        label: "AP(1)",
        rating: "1",
        type: "ArmyBookRule", modify: false
      }
    ],
    type: "ArmyBookWeapon"
  });
});

test("Parse Free weapon", () => {
  const e = parse("Sword (A3, AP(1)) Free", true);

  expect(e).toStrictEqual({
    label: "Sword (A3, AP(1))",
    name: "Sword",
    cost: 0,
    attacks: 3,
    specialRules: [
      {
        key: "ap",
        name: "AP",
        rating: "1",
        label: "AP(1)",
        type: "ArmyBookRule", modify: false
      }
    ],
    type: "ArmyBookWeapon"
  });
});

test("Parse simple ranged weapon", () => {
  const e = parse("Pistol (6\", A3)");

  expect(e).toStrictEqual({
    label: "Pistol",
    range: 6,
    attacks: 3,
    specialRules: []
  });
});

test("Parse ranged weapon with rules", () => {
  const e = parse("Pistol (6\", A3, Rending, AP(1))");

  expect(e).toStrictEqual({
    label: "Pistol",
    range: 6,
    attacks: 3,
    specialRules: ["Rending", "AP(1)"]
  });
});

test("Parse standard rule", () => {
  const e = parse("Field Radio +5pts", true);

  expect(e).toStrictEqual({
    label: "Field Radio",
    cost: 5,
    gains: [
      {
        key: "field-radio",
        name: "Field Radio",
        label: "Field Radio",
        rating: "",
        type: "ArmyBookRule", modify: false
      }
    ]
  });
});

test("Parse standard rule", () => {
  const e = parse("Gloom-Protocol +5pts", true);

  expect(e).toStrictEqual({
    label: "Gloom-Protocol",
    cost: 5,
    gains: [
      {
        key: "gloom-protocol",
        name: "Gloom-Protocol",
        label: "Gloom-Protocol",
        rating: "",
        type: "ArmyBookRule", modify: false
      }
    ]
  });
});

test("Parse standard rule", () => {
  const e = parse("SHOOT! +15pts", true);

  expect(e).toStrictEqual({
    label: "SHOOT!",
    cost: 15,
    gains: [
      {
        key: "shoot!",
        name: "SHOOT!",
        label: "SHOOT!",
        rating: "",
        type: "ArmyBookRule", modify: false
      }
    ]
  });
});

test("Parse parameterised rule", () => {
  const e = parse("Psychic(2) +15pts", true);

  expect(e).toStrictEqual({
    "label": "Psychic(2)",
    "cost": 15,
    "gains": [
      {
        "key": "psychic",
        "name": "Psychic",
        "type": "ArmyBookRule",
        "label": "Psychic(2)",
        "rating": "2",
        modify: false
      }
    ]
  });
});

test("Parse weapon pairing with non-standard rules", () => {
  const e = parse("Light Shields (Defense +1 in melee) and Shield Bash (A2) Free", true);

  expect(e).toStrictEqual({
    label: "Light Shields (Defense +1 in melee) and Shield Bash (A2)",
    cost: 0,
    gains: [
      {
        label: "Light Shields (Defense +1 in melee)",
        name: "Light Shields",
        content: [
          {
            key: "defense",
            name: "Defense",
            label: "Defense +1 in melee",
            rating: "1",
            condition: "in melee",
            type: "ArmyBookRule"
          }
        ],
        type: "ArmyBookItem"
      },
      {
        label: "Shield Bash (A2)",
        name: "Shield Bash",
        attacks: 2,
        specialRules: [],
        type: "ArmyBookWeapon"
      }
    ]
  });
});

test("Parse weapon pairing", () => {
  const e = parse("Plasma Pistol (12”, A1, AP(2)) and CCW (A2) +5pts", true);

  expect(e).toStrictEqual({
    label: "Plasma Pistol (12”, A1, AP(2)) and CCW (A2)",
    cost: 5,
    gains: [
      {
        label: "Plasma Pistol (12”, A1, AP(2))",
        name: "Plasma Pistol",
        range: 12,
        attacks: 1,
        specialRules: [
          {
            key: "ap",
            name: "AP",
            rating: "2",
            label: "AP(2)",
            type: "ArmyBookRule",
            modify: false
          }
        ],
        type: "ArmyBookWeapon"
      },
      {
        label: "CCW (A2)",
        name: "CCW",
        attacks: 2,
        specialRules: [],
        type: "ArmyBookWeapon"
      }
    ]
  });
});

test("multiple profile weapon 1", () => {
  const e = parse('Grenade Launcher-pick one to fire: HE (24”,A1,Blast(3)) AT (24”, A1, AP(1), Deadly(3)) +5pts', true);
  for (let g of e.gains)
    for (let p of g.profiles)
      delete p.id;

  expect(e).toStrictEqual({
    label: "Grenade Launcher-pick one to fire: HE (24”,A1,Blast(3)) AT (24”, A1, AP(1), Deadly(3))",
    cost: 5,
    gains: [
      {
        name: "Grenade Launcher-pick one to fire",
        type: "ArmyBookMultiWeapon",
        profiles: [
          {
            label: "HE (24”,A1,Blast(3))",
            name: "HE",
            range: 24,
            attacks: 1,
            specialRules: [
              {
                key: "blast",
                name: "Blast",
                label: "Blast(3)",
                rating: "3",
                type: "ArmyBookRule",
                modify: false
              }
            ],
            type: "ArmyBookWeapon"
          },
          {
            label: "AT (24”, A1, AP(1), Deadly(3))",
            name: "AT",
            range: 24,
            attacks: 1,
            specialRules: [
              {
                key: "ap",
                name: "AP",
                label: "AP(1)",
                rating: "1",
                type: "ArmyBookRule",
                modify: false
              },
              {
                key: "deadly",
                name: "Deadly",
                label: "Deadly(3)",
                rating: "3",
                type: "ArmyBookRule", modify: false
              }
            ],
            type: "ArmyBookWeapon"
          }
        ]
      }
    ]
  });
});

test("Parse equipment with rule", () => {
  const e = parse("Camo Cloaks (Stealth) +10pts", true);

  expect(e).toStrictEqual({
    label: "Camo Cloaks (Stealth)",
    name: "Camo Cloaks",
    type: "ArmyBookItem",
    cost: 10,
    content: [
      {
        key: "stealth",
        name: "Stealth",
        label: "Stealth",
        rating: "",
        type: "ArmyBookRule", modify: false
      }
    ]
  });
});

test("Parse equipment with rule", () => {
  const e = parse("Grenadiers (Defense +1) +10pts", true);

  expect(e).toStrictEqual({
    label: "Grenadiers (Defense +1)",
    name: "Grenadiers",
    type: "ArmyBookItem",
    cost: 10,
    content: [
      {
        key: "defense",
        name: "Defense",
        label: "Defense +1",
        rating: "1",
        condition: "",
        type: "ArmyBookRule"
      }
    ]
  });
});

test("Parse equipment with rule", () => {
  const e = parse("Demo Experts (Rending in melee) +10pts", true);

  expect(e).toStrictEqual({
    label: "Demo Experts (Rending in melee)",
    name: "Demo Experts",
    type: "ArmyBookItem",
    cost: 10,
    content: [
      {
        key: "rending",
        name: "Rending",
        label: "Rending in melee",
        rating: "",
        type: "ArmyBookRule", modify: false,
        condition: "in melee"
      }
    ]
  });
});

test("Parse AoF format mount 2", () => {
  const mount = parse('Ancestral Stone - Tough(+3) +70pts');

  const expected = {
    type: "mount",
    cost: 70,
    equipment: [
      {
        label: "Ancestral Stone",
        specialRules: ["Tough(+3)"]
      }
    ]
  };

  //expect(mount).toStrictEqual(expected);
});

test("Parse AoF format mount 3", () => {
  const mount = parse('Shield Carriers - Hand Weapons (A4), Tough(+3) +80pts');

  const expected = {
    type: "mount",
    cost: 80,
    equipment: [
      {
        label: "Shield Carriers",
        specialRules: ["Tough(+3)"],
      },
      {
        label: "Shield Carriers - Hand Weapons",
        attacks: 4,
      }
    ]
  };

  //expect(mount).toStrictEqual(expected);
});

test("Parse AoF format mount 4", () => {
  const mount = parse('Beast - Claws(A1), Impact(1), Swift +15pts');

  const expected = {
    type: "mount",
    cost: 15,
    equipment: [
      {
        label: "Beast",
        specialRules: ["Impact(1)", "Swift"],
      },
      {
        label: "Beast - Claws",
        attacks: 1
      }
    ]
  };

  //expect(mount).toStrictEqual(expected);
});

test("Parse GFF format mount", () => {
  const e = DataParsingService.parseEquipment('Combat Bike (Fast, Impact(1), Swift, Twin Assault Rifle (24”,A2)) +30pts');

  const expected = {
    type: "mount",
    cost: 30,
    equipment: [
      {
        label: "Combat Bike",
        specialRules: [
          "Fast",
          "Impact(1)",
          "Swift",
        ]
      },
      {
        label: "Combat Bike Twin Assault Rifle",
        attacks: 2,
        range: 24,
      },
    ]
  };

  //expect(e).toStrictEqual(expected);
});

//#endregion

//#region Special equipment cases

//
test("Parse melee weapon with rules and cost", () => {
  const e = parse("Whip Limb and Sword Claw (A3, Deadly(6)) +10pts", true);

  expect(e).toStrictEqual({
    label: "Whip Limb and Sword Claw (A3, Deadly(6))",
    name: "Whip Limb and Sword Claw",
    cost: 10,
    attacks: 3,
    type: "ArmyBookWeapon",
    specialRules: [
      {
        key: "deadly",
        name: "Deadly",
        label: "Deadly(6)",
        rating: "6",
        type: "ArmyBookRule", modify: false
      }
    ]
  });
});

//#endregion

//#region Number from name

test("Parse one", () => {
  const num: number = DataParsingService.numberFromName("one");
  expect(num).toBe(1);
});

test("Parse seven", () => {
  const num: number = DataParsingService.numberFromName("seven");
  expect(num).toBe(7);
});

//#endregion


//#region Parse Spells

test("Parse Spells from pdf", () => {
  const input = `
Spite Rune (4+): Target enemy unit within 12” gets -1 to hit in melee next time it fights.
Smiting Rune (4+): Target enemy unit within 12” takes 4 automatic hits.
Battle Rune (5+): Target friendly unit within 12” gets +6” next time it moves.
Breaking Rune (5+): Target enemy model within 12” takes 2 automatic hits with AP(2).
Drill Rune (6+): Target piece of terrain within 6” may be moved by up to 6” in any direction or may be removed from play.
Cleaving Rune (6+): Target 2 enemy units within 12” take 6 automatic hits each.
`;

  const spells = DataParsingService.parseSpells(input);

  expect(spells.length).toBe(6);
});

//#endregion

test("Prime bros tank parse", () => {
  const input = `Combat Bike (Fast, Impact(1), Twin Assault Rifle (24”,A2)) +5pts`;
  const result = parse(input, true)
  //expect(result).toStrictEqual({});
});

test("High Elf weapon platform", () => {
  var input = 'Gun Platform (Star Cannon (36”, A2, AP(2))) +20pts';
  var result = parse(input);
  //expect(result).toStrictEqual({});
});