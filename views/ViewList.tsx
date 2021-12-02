import React, { Fragment, useEffect } from "react";
import { useSelector } from 'react-redux'
import { RootState } from '../data/store'
import { useRouter } from "next/router";
import { Paper, Card } from "@mui/material";
import RuleList from "../views/components/RuleList";
import DataParsingService from "../services/DataParsingService";
import { IGameRule } from "../data/armySlice";
import UpgradeService from "../services/UpgradeService";
import { Accordion, AccordionDetails, AccordionSummary, IconButton } from "@mui/material";
import UnitService from "../services/UnitService";
import { ISelectedUnit, IUpgradeGains, IUpgradeGainsItem, IUpgradeGainsMultiWeapon, IUpgradeGainsRule, IUpgradeGainsWeapon } from "../data/interfaces";
import pluralise from "pluralize";
import _ from "lodash";

export default function ViewList({ showPsychic, showFullRules, showPointCosts }) {

  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);
  const router = useRouter();

  const gameRules = army.rules;
  const armyRules = army.data?.specialRules;
  const spells = army.data?.spells || [];
  const ruleDefinitions: IGameRule[] = gameRules.concat(armyRules);

  return (
    <div>
      {
        (list?.units || []).map((s: ISelectedUnit, index: number) => {

          const upgrades: IUpgradeGains[] = s.equipment
            .concat(s.selectedUpgrades.reduce((val, next) => val.concat(next.gains), []))
            .filter(u => u.count > 0);

          const displayUpgrade = (eqp: IUpgradeGains, count) => {

            const name = count > 1 ? pluralise.plural(eqp.name || eqp.label) : eqp.name || eqp.label;

            if (!count)
              return null;

            switch (eqp.type) {
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
                    <span style={{ color: "#000000" }}>{name} </span>
                    <span style={{ color: "#656565" }}>
                      ({multiWeapon.profiles.map((profile, i) => (<>{i === 0 ? "" : ", "}{displayUpgrade(profile, 1)}</>))})
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
                    <span style={{ color: "#000000" }}>{name} </span>
                    <span style={{ color: "#656565" }}>
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
                    <span style={{ color: "#000000" }}>{name} </span>
                    <span style={{ color: "#656565" }}>
                      ({item.content.map((c, i) => (<>{i === 0 ? "" : ", "}{displayUpgrade(c, c.count)}</>))})
                    </span>
                  </>
                );
              }
              default: {
                console.log("Cannot display upgrade: ", eqp)
              }
            }
          };

          const upgradeGroups = _.groupBy(upgrades, u => u.name + u.attacks);

          return (
            <Accordion
              square
              disableGutters
              elevation={1}
              expanded={true}
              style={{ backgroundColor: (list.selectedUnitId === s.selectionId ? "rgba(249, 253, 255, 1)" : null) }}>
              <AccordionSummary>
                <div className="is-flex is-flex-grow-1 is-align-items-center">
                  <div className="is-flex-grow-1">
                    <p className="mb-1" style={{ fontWeight: 600 }}>{s.customName || s.name} {s.size > 1 ? `[${s.size}]` : ''}</p>
                    <div className="is-flex" style={{ fontSize: "14px", color: "#666" }}>
                      <p>Qua {s.quality}+</p>
                      <p className="ml-2">Def {s.defense}+</p>
                    </div>
                  </div>
                  {showPointCosts && <p className="mr-2">{UpgradeService.calculateUnitTotal(s)}pts</p>}
                </div>
              </AccordionSummary>
              <AccordionDetails className="pt-0">
                <div style={{ fontSize: "14px", color: "#666666" }}>
                  <div>
                    {
                      Object.keys(upgradeGroups).map(key => {
                        const group: IUpgradeGains[] = upgradeGroups[key];
                        const u = group[0];
                        const count = group.reduce((val, next) => val + next.count, 0);
                        return (
                          <div>{displayUpgrade(u, count)}</div>
                        );
                      })
                    }
                  </div>
                  <RuleList specialRules={s.specialRules.concat(UnitService.getAllUpgradedRules(s))} />
                </div>
              </AccordionDetails>
            </Accordion>
          );
        })
      }
      {showPsychic &&
        <Card elevation={1}>
          <div className="mb-4">
            <div className="card-body">
              <h3 className="is-size-4 my-2" style={{ fontWeight: 500, textAlign: "center" }}>Psychic/Spells</h3>
              <hr className="my-0" />

              <Paper square elevation={0}>
                <div className="px-2 my-2">
                  {spells.map(spell => (
                    <p key={spell.id}>
                      <span style={{ fontWeight: 600 }}>{spell.name} ({spell.threshold}+): </span>
                      <span>{spell.effect}</span>
                    </p>
                  ))}
                </div>
              </Paper>
            </div>
          </div>
        </Card>}
    </div>
  );
}