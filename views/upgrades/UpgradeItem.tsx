import styles from "./UpgradeItem.module.css";
import { ISelectedUnit, IUpgrade, IUpgradeGains, IUpgradeOption, IUpgradeGainsWeapon, IUpgradeGainsItem, IUpgradeGainsRule, IUpgradeGainsMultiWeapon } from '../../data/interfaces';
import UpgradeService from '../../services/UpgradeService';
import UpgradeRadio from './controls/UpgradeRadio';
import UpgradeCheckbox from './controls/UpgradeCheckbox';
import UpgradeUpDown from './controls/UpgradeUpDown';
import { groupBy } from '../../services/Helpers';
import pluralise from "pluralize";
import RuleList from '../components/RuleList';

function UpgradeItemDisplay({ eqp, count, isValid }) {
  const name = count > 1 ? pluralise.plural(eqp.name || eqp.label) : eqp.name || eqp.label;
  const invalidColour = "rgba(0,0,0,.5)";
  const colour = isValid ? "#000000" : invalidColour;
  const subtextColour = isValid ? "#656565" : invalidColour;

  switch (eqp.type) {
    case "ArmyBookDefense":
    case "ArmyBookRule": {
      const rule = eqp as IUpgradeGainsRule;
      return (
        <span style={{ color: colour }}>
          <RuleList specialRules={[rule]} />
        </span>
      );
    }
    case "ArmyBookMultiWeapon": {
      const multiWeapon = eqp as IUpgradeGainsMultiWeapon;
      return (
        <>
          {count > 1 && <span>{count}x </span>}
          <span className={styles.upgradeName} style={{ color: colour }}>{name} </span>
          <span className={styles.upgradeRules} style={{ color: subtextColour }}>
            ({multiWeapon.profiles.map((profile, i) => (<>{i === 0 ? "" : ", "}<UpgradeItemDisplay eqp={profile} count={count} isValid={isValid} /></>))})
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
          <span className={styles.upgradeName} style={{ color: colour }}>{name} </span>
          <span className={styles.upgradeRules} style={{ color: subtextColour }}>
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
          <span className={styles.upgradeName} style={{ color: colour }}>{name} </span>
          <span className={styles.upgradeRules} style={{ color: subtextColour }}>
            ({item.content.map((c, i) => (<>{i === 0 ? "" : ", "}<UpgradeItemDisplay eqp={c} count={count} isValid={isValid} /></>))})
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
      <div className="is-flex-grow-1 pr-2" style={{ color: "red" }}>
        {
          gainsGroups ? Object.keys(gainsGroups).map((key, i) => {
            const group: IUpgradeGains[] = gainsGroups[key];
            const e = group[0];
            const count = group.reduce((c, next) => c + (next.count || 1), 0);

            return <UpgradeItemDisplay key={i} eqp={e} count={count} isValid={isValid} />;
          }) : <span style={{ color: "#000000" }}>None</span>
        }
      </div>
      <div style={{ color: isValid ? null : "rgba(0,0,0,.5)" }}>{option?.cost ? `${option.cost}pts` : "Free"}&nbsp;</div>
      { selectedUnit.selectionId !== "dummy" &&
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