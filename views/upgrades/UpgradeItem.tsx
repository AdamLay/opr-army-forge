import styles from "./UpgradeItem.module.css";
import { ISelectedUnit, IUpgrade, IUpgradeGains, IUpgradeOption, IUpgradeGainsWeapon, IUpgradeGainsItem, IUpgradeGainsRule, IUpgradeGainsMultiWeapon } from '../../data/interfaces';
import EquipmentService from '../../services/EquipmentService';
import UpgradeService from '../../services/UpgradeService';
import UpgradeRadio from './controls/UpgradeRadio';
import UpgradeCheckbox from './controls/UpgradeCheckbox';
import UpgradeUpDown from './controls/UpgradeUpDown';
import { Fragment } from 'react';
import { groupBy } from '../../services/Helpers';
import pluralise from "pluralize";
import RulesService from '../../services/RulesService';
import UnitService from '../../services/UnitService';
import RuleList from '../components/RuleList';

function UpgradeItemDisplay({ eqp, count }) {
  const name = count > 1 ? pluralise.plural(eqp.name || eqp.label) : eqp.name || eqp.label;

  switch (eqp.type) {
    case "ArmyBookDefense":
    case "ArmyBookRule": {
      const rule = eqp as IUpgradeGainsRule;
      return (
        <span style={{ color: "#000000" }}>
          <RuleList specialRules={[rule]} />
        </span>
      );
    }
    case "ArmyBookMultiWeapon": {
      const multiWeapon = eqp as IUpgradeGainsMultiWeapon;
      return (
        <>
          {count > 1 && <span>{count}x </span>}
          <span className={styles.upgradeName} style={{ color: "#000000" }}>{name} </span>
          <span className={styles.upgradeRules} style={{ color: "#656565" }}>
            ({multiWeapon.profiles.map((profile, i) => (<>{i === 0 ? "" : ", "}<UpgradeItemDisplay eqp={profile} count={count} /></>))})
          </span>
        </>
      );
    }
    case "ArmyBookWeapon": {
      const weapon = eqp as IUpgradeGainsWeapon;
      const range = weapon && weapon.range ? `${weapon.range}"` : null;
      const attacks = weapon && weapon.attacks ? `A${weapon.attacks}` : null;
      const weaponRules = weapon.specialRules;
      const rules = (<RuleList specialRules={weaponRules} />);
      return (
        <>
          {count > 1 && <span>{count}x </span>}
          <span className={styles.upgradeName} style={{ color: "#000000" }}>{name} </span>
          <span className={styles.upgradeRules} style={{ color: "#656565" }}>
            ({[range, attacks].filter(r => r).join(", ") + (weaponRules?.length > 0 ? ", " : "")}{rules})
          </span>
        </>
      );
    }
    case "ArmyBookItem": {
      const item = eqp as IUpgradeGainsItem;
      return (
        <>
          {count > 1 && <span>{count}x </span>}
          <span className={styles.upgradeName} style={{ color: "#000000" }}>{name} </span>
          <span className={styles.upgradeRules} style={{ color: "#656565" }}>
            ({item.content.map((c, i) => (<>{i === 0 ? "" : ", "}<UpgradeItemDisplay eqp={c} count={count} /></>))})
          </span>
        </>
      );
    }
    default: {
      console.log("Cannot display upgrade: ", eqp)
    }
  }
}

export default function UpgradeItem({ selectedUnit, upgrade, option }: { selectedUnit: ISelectedUnit, upgrade: IUpgrade, option: IUpgradeOption }) {

  const controlType = UpgradeService.getControlType(selectedUnit, upgrade);
  // Somehow display the count?
  const gainsGroups = option ? groupBy(option.gains, "name") : null;
  const isValid = option ? UpgradeService.isValid(selectedUnit, upgrade, option) : true;

  return (
    <div className="is-flex is-align-items-center mb-1">
      <div className="is-flex-grow-1 pr-2">
        {
          gainsGroups ? Object.keys(gainsGroups).map((key, i) => {
            const group: IUpgradeGains[] = gainsGroups[key];
            const e = group[0];
            const count = group.reduce((c, next) => c + (next.count || 1), 0);

            return <UpgradeItemDisplay key={i} eqp={e} count={count} />;
          }) : <span className="is-size-6" style={{ color: "#888888" }}>{
            upgrade.replaceWhat && upgrade.type == "replace" ? 
              <><span className="is-size-6" style={{ color: "#61526c" }}>{upgrade.replaceWhat.map((e, i) => {
                let w = EquipmentService.findLast(selectedUnit.equipment, e)
                return `${i > 0 ? ", " : ""}${w ? EquipmentService.formatString(w) : e}`
              })}</span> (default)</>
            : "None"}</span>
        }
      </div>
      <div>
      {
         option?.cost ? `${option.cost}pts` : "Free"
         //option?.cost ? `${option.cost * (selectedUnit.combined && upgrade.affects === "all" ? 2 : 1)}pts` : "Free"
         }&nbsp;</div>
      {
        (() => {
          switch (controlType) {
            case "check": return <UpgradeCheckbox selectedUnit={selectedUnit} upgrade={upgrade} option={option} />;
            case "radio": return <UpgradeRadio selectedUnit={selectedUnit} upgrade={upgrade} option={option} isValid={isValid} />;
            case "updown": return <UpgradeUpDown selectedUnit={selectedUnit} upgrade={upgrade} option={option} />;
          }
        })()
      }
    </div >
  );
}