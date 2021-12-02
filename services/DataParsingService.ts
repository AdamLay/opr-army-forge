import { ISpecialRule, IUpgrade, IUpgradeGainsRule } from '../data/interfaces';
import { nanoid } from "nanoid";

export default class DataParsingService {

  // Only 0-9 covered - probably OK?
  public static numberFromName(number: string): number {
    const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const index = numbers.indexOf(number.toLocaleLowerCase());
    if (index >= 0)
      return index;
    return null;
  }

  public static parseUpgradeText(text: string): IUpgrade {
    const groups = {
      type: 1,
      affects: 2,
      upgradeWhat: 3,
      select: 4,
      upTo: 5,
      replaceWhat: 6
    }

    const mountMatch = /mount on/i.test(text);
    if (mountMatch)
      return {
        id: nanoid(7),
        type: "upgrade",
        select: 1
      };

    const takeMatch = /^Take\s([\d]+|one|two|any)?\s?(.+?)\sattachments?:/.exec(text);
    if (takeMatch)
      return {
        id: nanoid(7),
        type: "upgrade",
        attachment: true,
        select: takeMatch[1] ? (parseInt(takeMatch[1]) || this.numberFromName(takeMatch[1]) || takeMatch[1] as any) : 1,
        replaceWhat: [takeMatch[2]]
      };

    const anyModelMatch = /^(any|one) model may (replace|take) (\d+|one|two|three) (.+?)(?: attachment)?:/gi.exec(text);
    if (anyModelMatch) {
      return {
        id: nanoid(7),
        type: anyModelMatch[2] === "replace" ? "replace" : "upgrade",
        attachment: anyModelMatch[2] === "take",
        affects: anyModelMatch[1].toLowerCase() === "any" ? "any" : this.numberFromName(anyModelMatch[1].toLowerCase()),
        model: true,
        select: parseInt(anyModelMatch[3]) || this.numberFromName(anyModelMatch[3]) || anyModelMatch[3] as any,
        replaceWhat: [anyModelMatch[4]]
      }
    }

    // Honestly I just don't want to change the monster below...
    const upgradeUpToModelsMatch = /Upgrade up to two models with/i.exec(text);
    if (upgradeUpToModelsMatch)
      return {
        id: nanoid(7),
        type: "upgrade",
        model: true,
        select: 2
      };

    const addModelMatch = /Add one model ?(?:with)?/i.exec(text);
    if (addModelMatch)
      return {
        id: nanoid(7),
        type: "upgrade",
        attachModel: true,
        select: 1
      };

    text = text.endsWith(":") ? text.substring(0, text.length - 1) : text;

    const match = /(Upgrade|Replace)\s?(any|one|all|\d+x)?\s?(?:models?)?(?:(.+)\swith)?\s?(?:with)?\s?(one|any)?(?:up to (.+?)(?:\s|$))?(.+)?/.exec(text);

    if (!match) {
      throw (new Error("Cannot match: " + text))
      return null;
    }

    const replaceWhat = match[groups.replaceWhat];

    const result: IUpgrade = {
      id: nanoid(7),
      type: match[groups.type]?.toLowerCase() as any,
      model: text.indexOf("model") > -1
    };

    if (match[groups.affects])
      result.affects = parseInt(match[groups.affects]) || this.numberFromName(match[groups.affects]) || match[groups.affects] as any;

    if (match[groups.select])
      result.select = parseInt(match[groups.select]) || this.numberFromName(match[groups.select]) || match[groups.select] as any;

    if (match[groups.upTo])
      result.select = parseInt(match[groups.upTo]) || this.numberFromName(match[groups.upTo]) || match[groups.upTo] as any;

    if (match[groups.upgradeWhat])
      result.replaceWhat = [match[groups.upgradeWhat]];

    if (replaceWhat) {
      // has alternative replave options like "Replace one R-Carbine and CCW / G-Rifle and CCW:"
      if (replaceWhat.indexOf("/") > -1) {
        result.replaceWhat = replaceWhat
          .split("/")
          .map(part => part.trim())
          .map(part => part.split(" and "))
          .map(part => part.map(p => p.split(", ")).reduce((arr, next) => arr.concat(next), []));
      } else {
        result.replaceWhat = replaceWhat
          .split(" and ")
          .map(part => part.split(", "))
          .reduce((arr, next) => arr.concat(next), []);
      }
    }

    // TODO: Better way of doing this?
    if (result.type === "upgrade" && result.replaceWhat && !result.affects && !result.select && !result.model)
      result.type = "upgradeRule";

    if (result.model === false) {
      delete result.model;
    }

    return result;
  }

  public static parseUpgrades(upgrades: string) {
    const results = {};
    const groupNames = {
      setLetter: 1,
      upgradeText: 2,
    };
    let groupIndex = 1;
    let lastGroupId = null;
    let lastUpgradeText = null;
    for (let line of upgrades.split("\n").filter((l) => !!l?.trim())) {
      try {
        const parsedUpgrade = /^(\D\s)?(.+?)(?<!to fire):|(.+?)\s\((.+)\)\s?([+-]\d+)?/.exec(line);

        const setLetter =
          parsedUpgrade && parsedUpgrade[groupNames.setLetter]?.trim();
        const upgradeText =
          parsedUpgrade && parsedUpgrade[groupNames.upgradeText];
        const isNewGroup = !!setLetter;
        const isUpgrade = !!upgradeText;

        if (isNewGroup) {
          const groupExists = !!results[setLetter + groupIndex];
          if (groupExists)
            groupIndex++;

          const groupId = setLetter + groupIndex;

          results[groupId] = {
            uid: groupId,
            hint: groupId,
            sections: [
              {
                label: upgradeText,
                ...DataParsingService.parseUpgradeText(upgradeText + ":"),
                options: [],
              },
            ],
          };
          lastGroupId = groupId;
          lastUpgradeText = upgradeText;
        } else if (isUpgrade) {
          results[lastGroupId].sections.push({
            label: upgradeText,
            ...DataParsingService.parseUpgradeText(upgradeText + ":"),
            options: [],
          });
          lastUpgradeText = upgradeText;
        } else {

          const countRegex = /^(\d+)x\s/;
          const costRegex = /\s?[+-]\d+pts$/;
          const option = this.parseEquipment(line, true);
          const cost = option.cost;
          const gains = [];
          for (let e of (option.gains || [option])) {
            const count = e.count || 1;
            delete e.id;
            delete e.cost;
            delete e.count;
            for (let i = 0; i < count; i++) {
              gains.push({ ...e, label: (e.label || e.name)?.replace(countRegex, "").replace(costRegex, "") });
            }
          }

          // Find section
          const sections = results[lastGroupId].sections.filter((u) => u.label === lastUpgradeText);
          const section = sections[sections.length - 1];

          // Add to options!
          section.options.push({
            id: option.id || nanoid(5),
            type: "ArmyBookUpgradeOption",
            cost: parseInt(cost),
            label: line.replace(costRegex, ""),
            gains: gains
          });
        }
      } catch (e) {
        console.log(e);
        console.log(line);
      }
    }

    return Object.keys(results).reduce((curr, next) => curr.concat(results[next]), []);
  }

  public static parseUnits(units: string, pageNumber: number) {

    const results = [];

    for (let line of units.split("\n").filter((l) => !!l)) {
      const parsedUnit =
        /^(.+)\[(\d+)\]\s(\d+\+|-)\s(\d+\+|-)\s(.*?\)\s|-)(.+?)((?:[A-Z],?\s?|-\s?)+)(\d+)pt/gm.exec(
          line
        );
      try {

        const parsed = {
          id: nanoid(7),
          name: parsedUnit[1].trim(),
          size: parseInt(parsedUnit[2]),
          quality: parseInt(parsedUnit[3]),
          defense: parseInt(parsedUnit[4]),
          equipment: DataParsingService.parseEquipmentList(parsedUnit[5]),
          specialRules: parsedUnit[6].split(",").map((s) => s.trim()).map(this.parseRule),
          upgrades:
            parsedUnit[7] && parsedUnit[7].trim() === "-"
              ? []
              : parsedUnit[7].split(",").map((s) => s.trim()),
          cost: parseInt(parsedUnit[8]),
          costMode: "manually",
          splitPageNumber: pageNumber
        };

        results.push(parsed);
      }
      catch (e) {
        console.error(e);
        console.log(line);
        throw e;
      }
    }

    return results;
  }

  public static parseRule(r): ISpecialRule | IUpgradeGainsRule {
    const defenseMatch = /^(Defense) \+(\d+)\s?(in melee)?/.exec(r);
    if (defenseMatch) {
      return {
        key: defenseMatch[1].toLowerCase().replace(/\s+/g, "-"),
        name: defenseMatch[1],
        rating: defenseMatch[2] || "",
        condition: defenseMatch[3] || ""
      }
    }
    const rMatch = /^(.+?)(?:\((\+?)(\d+)\))?( in melee)?$/.exec(r);
    const result = {
      key: rMatch[1].toLowerCase().replace(/\s+/g, "-"),
      name: rMatch[1],
      rating: rMatch[3] || "",
      modify: rMatch[2] === "+",
      condition: rMatch[4] ? rMatch[4].trim() : null
    };
    if (!result.condition)
      delete result.condition;
    return result;
  }

  public static parseEquipmentList(str) {

    const parts = str
      .split(/(?<!\(\d)\),/)
      .map((part) => part.trim())
      .map((part) => (/(?<!\(\d)\)/.test(part) ? part : part + ")"))
      .map((part) => {

        // TODO: Can't remember why this is here?
        if (part === "-)")
          return null;

        return this.parseEquipment(part, false);
      })
      .filter((p) => !!p);
    return parts;
  }

  public static parseEquipment(part, isUpgrade: boolean = false): any {

    const groups = {
      count: 1,
      label: 2,
      rules: 3,
      cost: 4
    };

    const costRegex = /\s?([+-]?\d+pts|Free)$/;

    // Grenade Launcher-pick one to fire: HE (24”,A1,Blast(3)) AT (24”, A1, AP(1), Deadly(3)) +5pts
    if (part.indexOf("pick one to fire") > -1) {
      const multiWeaponSplit = part.split(":")
      const multiWeaponName = multiWeaponSplit[0].trim();
      const multiWeaponWeapons = multiWeaponSplit[1]
        .trim()
        .split(/(.+?\(.+?\)\s)/g)
        .filter(l => !!l && !l.endsWith("pts"));
      //.split(/((.+?)\((.+?)\)\s)/g);
      return {
        id: nanoid(7),
        cost: parseInt(/([+-]\d+)pts?$/.exec(part)[1]),
        label: part.replace(costRegex, "").trim(),
        gains: [
          {
            name: multiWeaponName,
            type: "ArmyBookMultiWeapon",
            profiles: multiWeaponWeapons.map(w => ({
              ...this.parseEquipment(w, isUpgrade),
              type: "ArmyBookWeapon"
            }))
          }
        ]
      };
    }

    // "A (...) and B (...) +10pts"
    if (part.indexOf(") and ") > 0) {
      const combinedMatch = /(.+?)(Free$|([-+]\d+)pts)$/.exec(part);
      const multiParts = combinedMatch[1]
        .split(" and ");
      return {
        id: nanoid(7),
        cost: combinedMatch[2] === "Free" ? 0 : parseInt(combinedMatch[3]),
        label: part.replace(costRegex, "").trim(),
        gains: multiParts
          .map(mp => this.parseEquipment(mp, isUpgrade))
      };
    }

    // GF/GFF format mount
    if (/^(.+)\(.+\(.+A\d+/.test(part)) {
      const mountMatch = /^(.+?)\((.+)\) ([+-]\d+)pt/.exec(part);
      const mountName = mountMatch[1].trim();
      const mountRules = [];
      let mountWeapon = null;
      const isOneWeapon = /^[^,]+\(.+\)$/.test(mountMatch[2]);
      if (isOneWeapon) {
        mountWeapon = this.parseEquipment(mountMatch[2], isUpgrade);
      } else {

        // Thanks Schnickers
        let itemParts = mountMatch[2]
          .replace(/(\)|\w),/gim, `$1#`)
          .split(/#/)
          .map(r => r.trim());

        // For each rule/weapon in the (Fast, Impact(1), Weapon (16", A2))
        // Split on any comma that is preceeded by a letter or )
        for (let rule of itemParts) {
          // If it's words only, it's a rule
          // or Parameter rules like Impact(1) Tough(2)
          if (/^[^\(\)]+$/.test(rule) || /\w+\(\d+\)/.test(rule)) {
            mountRules.push(this.parseRule(rule));
          } else { // It's a weapon
            mountWeapon = this.parseEquipment(rule, isUpgrade);
          }
        }
      }

      return {
        id: nanoid(7),
        cost: parseInt(mountMatch[3]),
        label: part.replace(costRegex, ""),
        gains: [
          {
            label: mountName,
            name: mountName,
            content: mountRules.map(r => ({
              ...r,
              label: r.name,
              rating: r.rating || "",
              condition: "",
              modify: false
            })).concat([
              {
                ...mountWeapon
              }
            ]).filter(e => !!e),
            type: "ArmyBookItem"
          },

        ]
      };
    }

    if (/ - /.test(part))
      return this.parseMount(part, isUpgrade);

    // "Field Medic"
    const singleRuleMatch = /^([\w\s-!]+)\s([-+]\d+)pt/.exec(part);
    if (singleRuleMatch) {
      return {
        id: nanoid(7),
        label: singleRuleMatch[1].trim(),
        gains: [
          {
            ...this.parseRule(singleRuleMatch[1].trim()),
            label: singleRuleMatch[1].trim(),
            type: "ArmyBookRule"
          }
        ],
        cost: parseInt(singleRuleMatch[2]),
      };
    }

    // Wizard(1)
    const paramRuleMatch = /^(\w+\(\d+\))\s([-+]\d+)pt/.exec(part);
    if (paramRuleMatch) {
      return {
        id: nanoid(7),
        label: paramRuleMatch[1].trim(),
        gains: [
          {
            ...this.parseRule(paramRuleMatch[1].trim()),
            label: paramRuleMatch[1].trim(),
            type: "ArmyBookRule"
          }
        ],
        cost: parseInt(paramRuleMatch[2]),
      };
    }

    // "Camo Cloaks (Stealth)"
    const itemRuleMatch = /^(([\w\s]+)\(([\w\s]+|Defense \+\d)( in melee)?(?<!A\d)\))\s([-+]\d+)pt/.exec(part);
    if (itemRuleMatch) {
      return {
        id: nanoid(7),
        label: part.replace(costRegex, "").trim(),
        name: itemRuleMatch[2].trim(),
        content: [
          {
            ...this.parseRule((itemRuleMatch[3] + (itemRuleMatch[4] ? itemRuleMatch[4] : "")).trim()),
            label: itemRuleMatch[3].trim(),
            type: "ArmyBookRule"
          }
        ],
        type: "ArmyBookItem",
        cost: parseInt(itemRuleMatch[5]),
      };
    }

    const match = /(?:(\d+)x\s?)?(.+?)\((.+)\)\s?([+-]\d+|Free)?/.exec(part);
    const attacksMatch = /A(\d+)[,\)]/.exec(part);
    const rangeMatch = /(\d+)["”][,\)]/.exec(part);
    const rules = match[groups.rules].split(",").map((r) => r.trim());
    const specialRules = rules.filter(
      (r) => !/^A\d+/.test(r) && !/^\d+["”]/.test(r)
    );

    const result: any = {
      id: nanoid(7),
      label: (isUpgrade ? part : match[groups.label]).replace(costRegex, "").trim(),
      name: isUpgrade ? match[groups.label].trim() : undefined
    };

    if (!isUpgrade)
      delete result.name;

    if (match[groups.count])
      result.count = parseInt(match[groups.count]);

    if (attacksMatch)
      result.attacks = parseInt(attacksMatch[1]);

    if (rangeMatch)
      result.range = parseInt(rangeMatch[1]);

    if (isUpgrade) {
      result.type = result.attacks ? "ArmyBookWeapon" : "ArmyBookItem";
      result[result.type === "ArmyBookWeapon" ? "specialRules" : "content"] = specialRules?.length > 0
        ? specialRules.map(r => ({
          ...this.parseRule(r),
          label: r,
          type: "ArmyBookRule"
        }))
        : [];
    }
    else {
      result.specialRules = specialRules?.length > 0 ? specialRules : [];
    }
    if (match[groups.cost] !== undefined)
      result.cost = match[groups.cost] === "Free" ? 0 : parseInt(match[groups.cost].trim());

    return result;
  }

  public static parseMount(text: string, isUpgrade: boolean): any {

    const textParts = text.split(" - ");
    const name = textParts[0].trim();
    const match = /(.+)([+-]\d+)pts$/.exec(textParts[1]);
    const weaponRegex = /((.+?)(?<!AP|Impact|Tough|Deadly|Blast|Psychic|Wizard)\((.+?)\))[,\s]/;
    const weaponMatch = weaponRegex.exec(match[1]);
    const rules = match[1].replace(weaponRegex, '').trim().split(/,\s+?/).map(this.parseRule);

    return {
      id: nanoid(7),
      cost: match[2],
      gains: [
        {
          label: name,
          name,
          content: rules.map(r => ({
            ...r,
            label: r.name + (r.rating ? `(${r.modify ? "+" : ""}${r.rating})` : ""),
            rating: r.rating || "",
            condition: "",
            modify: r.modify || false
          })).concat([
            weaponMatch && {
              ...this.parseEquipment(weaponMatch[1], isUpgrade),
              name: weaponMatch[2].trim()
            }
          ]).filter(e => !!e),
          type: "ArmyBookItem"
        },

      ]
    };
  }

  public static parseRules(rules: string) {

    const results = [];
    const bullet = /•|/;

    for (let line of rules.split("\n").map(line => line.trim()).filter(line => !!line)) {

      const rule = line.substring(0, line.indexOf(":"));;
      const description = line.substring(line.indexOf(":") + 1).trim();
      const lineParts = description.split(bullet).map(part => part.trim()).filter(p => !!p);
      if (lineParts.length === 1) {
        results.push({
          "id": nanoid(5),
          "key": rule.toLowerCase().replace(/\s+/g, "-"),
          "hint": description,
          "name": rule,
          "tags": [],
          "label": rule,
          "forUnit": true,
          "forWeapon": false,
          "hasRating": false,
          "description": description
        });
        continue;
      }

      results.push({
        "id": nanoid(5),
        "key": rule.toLowerCase().replace(/\s+/g, "-"),
        "hint": description,
        "name": rule,
        "tags": [],
        "label": rule,
        "forUnit": true,
        "forWeapon": false,
        "hasRating": false,
        "description": description
      });

      // results.push({
      //     name: rule,
      //     description: lineParts[0],
      //     options: lineParts.slice(1)
      // });
    }

    return results;
  }

  public static parseSpells(spells: string) {

    const results = [];

    for (let line of spells.split("\n").filter(line => !!line)) {

      const lineParts = line.split(":");
      const spell = lineParts[0].trim();
      const description = lineParts[1].trim();
      const spellMatch = /(.+)\s\((.+)\)/.exec(spell);
      results.push({
        id: nanoid(5),
        name: spellMatch[1],
        threshold: parseInt(spellMatch[2]),
        effect: description
      });
    }

    return results;
  }
}