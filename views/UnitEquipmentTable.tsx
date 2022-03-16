import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ISelectedUnit, IUpgradeGains, IUpgradeGainsItem, IUpgradeGainsMultiWeapon, IUpgradeGainsRule, IUpgradeGainsWeapon } from '../data/interfaces';
import EquipmentService from '../services/EquipmentService';
import pluralise from "pluralize";
import RuleList from './components/RuleList';
import UnitService from '../services/UnitService';
import DataParsingService from '../services/DataParsingService';
import { Fragment } from 'react';
import _ from "lodash";

export function WeaponRow({ unit, e, isProfile }: { unit: ISelectedUnit, e: IUpgradeGainsWeapon, isProfile: boolean }) {

  const count = e.count;
  const name = e.count > 1 ? pluralise.plural(e.name) : e.name;
  const weaponCount = count > 1 ? `${count}x ` : null;
  const rules = e.specialRules//.filter(r => r.name !== "AP");

  const cellStyle = { paddingLeft: "8px", paddingRight: "8px" };
  const borderStyle = {
    borderBottom: "none",
    borderTop: isProfile ? "none" : "1px solid rgb(224, 224, 224)"
  };


  return (
    <TableRow>
      <TableCell style={{ ...borderStyle, ...cellStyle, fontWeight: 600 }}>
        {weaponCount}{isProfile ? `- ${name}` : name}
      </TableCell>
      <TableCell style={borderStyle}>{e.range ? e.range + '"' : '-'}</TableCell>
      <TableCell style={borderStyle}>{e.attacks ? "A" + e.attacks : '-'}</TableCell>
      {/*<TableCell style={borderStyle}>{EquipmentService.getAP(e) || '-'}</TableCell>*/}
      <TableCell style={borderStyle}>
        {rules && rules.length > 0 ? <RuleList specialRules={rules} /> : <span>-</span>}
      </TableCell>
    </TableRow>
  );
}

export default function UnitEquipmentTable({ unit, square }: { unit: ISelectedUnit, square: boolean }) {

  const isWeapon = e => e.attacks;

  const equipment = unit.equipment.filter(e => !isWeapon(e));
  const itemUpgrades = UnitService.getAllUpgradeItems(unit);
  const weapons = UnitService.getAllWeapons(unit);

  const hasEquipment = equipment.length > 0 || itemUpgrades.length > 0;
  const hasWeapons = weapons.length > 0;

  const combinedEquipment = equipment.map(e => ({
    label: e.label || e.name,
    specialRules: e.specialRules.map(DataParsingService.parseRule)
  })).concat(itemUpgrades.map(u => ({
    label: u.name,
    specialRules: u.content.filter(c => c.type === "ArmyBookRule" || c.type === "ArmyBookDefense") as IUpgradeGainsRule[]
  })));

  const weaponGroups = _.groupBy(weapons, w => pluralise.singular(w.name ?? w.label) + w.attacks);
  const itemGroups = _.groupBy(combinedEquipment, w => pluralise.singular(w.name ?? w.label));

  const headerStyle = { fontWeight: 600 };
  const cellStyle = { ...headerStyle, paddingLeft: "8px", paddingRight: "8px", borderBottom: "none" };

  return (
    <>
      {hasWeapons && <TableContainer component={Paper} square={square} elevation={0} style={{ border: "1px solid rgba(0,0,0,.12)" }}>
        <Table size="small">
          <TableHead>
            <TableRow style={{ backgroundColor: "#EBEBEB", fontWeight: 600 }}>
              <TableCell style={cellStyle}>Weapon</TableCell>
              <TableCell style={headerStyle}>R</TableCell>
              <TableCell style={headerStyle}>A</TableCell>
              {/*<TableCell style={headerStyle}>AP</TableCell>*/}
              <TableCell style={headerStyle}>Special</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              Object.keys(weaponGroups).map(key => {
                const group = weaponGroups[key]
                const upgrade = group[0];
                const count = group.reduce((c, next) => c + next.count, 0);
                const e = { ...upgrade, count };

                // Upgrade may have been replaced
                if (!e.count)
                  return null;

                if (upgrade.type === "ArmyBookMultiWeapon") {
                  console.log(upgrade.profiles);
                  return (
                    <Fragment key={key}>
                      <TableRow>
                        <TableCell style={{ border: "none", borderTop: "1px solid rgb(224, 224, 224)" }} colSpan={5}>{upgrade.name}</TableCell>
                      </TableRow>
                      {upgrade.profiles.map((profile, i) => (
                        <WeaponRow key={i} unit={unit} e={profile} isProfile={true} />
                      ))}
                    </Fragment>
                  );
                }

                return (
                  <WeaponRow key={key} unit={unit} e={e} isProfile={false} />
                );
              })
            }
          </TableBody>
        </Table>
      </TableContainer>}
      {hasEquipment && <TableContainer component={Paper} className="mt-2" elevation={0} style={{ border: "1px solid rgba(0,0,0,.12)" }}>
        <Table size="small">
          <TableHead>
            <TableRow style={{ backgroundColor: "#EBEBEB", fontWeight: 600 }}>
              <TableCell style={cellStyle}>Equipment</TableCell>
              <TableCell style={cellStyle}>Special</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              Object.values(itemGroups).map((group: any[], index) => {

                const e = group[0];
                const count = group.reduce((c, next) => c + (next.count || 1), 0);

                return (
                  <TableRow key={index}>
                    <TableCell style={cellStyle}>{count > 1 ? `${count}x ` : ""}{e.label}</TableCell>
                    <TableCell style={cellStyle}>
                      <RuleList specialRules={e.specialRules} />
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </TableContainer>}
    </>
  );
}