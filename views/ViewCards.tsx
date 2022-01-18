import React from "react";
import { useSelector } from 'react-redux'
import { RootState } from '../data/store'
import style from "../styles/Cards.module.css";
import UnitEquipmentTable from "../views/UnitEquipmentTable";
import { Paper, Card } from "@mui/material";
import RulesService from "../services/RulesService";
import DataParsingService from "../services/DataParsingService";
import { IGameRule } from "../data/armySlice";
import { groupBy } from "../services/Helpers";
import UnitService from "../services/UnitService";
import UpgradeService from "../services/UpgradeService";
import _ from "lodash";
import { ISelectedUnit, IUpgradeGainsMultiWeapon, IUpgradeGainsWeapon } from "../data/interfaces";
import RuleList from "./components/RuleList";

export default function ViewCards({ showPsychic = false, showFullRules = false, showRulesSummary = true, showPointCosts = true, showOrgChart = false, combineIdentical = true }) {

  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);

  const gameRules = army.rules;
  const armyRules = army.data?.specialRules;
  const spells = army.data?.spells || [];
  const ruleDefinitions: IGameRule[] = gameRules.concat(armyRules);

  const units = (list?.units ?? []).filter(u => u.selectionId !== "dummy").map(u => (
    {...u,
       id: undefined, 
       equipment: _.sortBy(u.equipment.map(e => (
        {...e, 
          dependencies: _.sortBy(_.uniq(e.dependencies))
        })), [e => e.label]),
       selectedUpgrades: _.sortBy(u.selectedUpgrades.map(up => (
        {...up, 
          gains: up.gains.map(g => ({...g, id: undefined}))
        })), [up => up.id]) 
    }));
  if (combineIdentical) for (let unit of units) {
    delete unit.selectionId
    delete unit.joinToUnit
    delete unit.combined
  }
  console.log(units.map(u => JSON.stringify(u)))

  var usedRules = []

  const unitGroups = _.groupBy(units, u => JSON.stringify(u));
  const baseUnits = list.units.filter(u => !u.joinToUnit)

  const MiniUnit = ({unit, children="", sx={}, ...props}) => {
    return (
      <p style={{paddingLeft: "1rem", textIndent: "-1rem", ...sx}} {...props}>
        <span style={{ fontWeight: 600 }}>
          {children}
          {unit.customName || unit.name}
        </span>
        {Object.keys(unit.selectedUpgrades).length > 0 ? <span style={{ fontWeight: 400 }}>&nbsp;({Object.entries(_.countBy(unit.selectedUpgrades, upg => upg.label.split(/\s[\(-]/)[0])).map(e => `${e[1] > 1 ? e[1] + "x " : ""}${e[0]}`).join(", ")})</span>: ""}
      </p>
      )
    }

  return (
    <>
      <div className={style.grid}>
        {Object.values(unitGroups).map((grp: ISelectedUnit[], i) => {

          const u = grp[0];
          const count = grp.length;
          const equipmentSpecialRules = u
            .equipment
            .filter(e => !e.attacks && e.specialRules?.length) // No weapons, and only equipment with special rules
            .reduce((value, e) => value.concat(e.specialRules), []); // Flatten array of special rules arrays

          const specialRules = (u.specialRules || [])
            .concat(equipmentSpecialRules.map(DataParsingService.parseRule))
            .filter(r => r.name != "-");

          const equipmentRules = UnitService.getAllUpgradedRules(u);
          //console.log(equipmentRules);

          const rules = specialRules.concat(equipmentRules).filter(r => !!r && r.name != "-");
          const ruleGroups = groupBy(rules, "name");
          const ruleKeys = Object.keys(ruleGroups);
          const toughness = toughFromUnit(u);

          const weaponSpecialRules = _.compact(u.equipment.flatMap(e => e.attacks && e.specialRules)).map(r => r.name)
          const upgradeWeaponsSpecialRules = UnitService.getAllUpgradeWeapons(u).flatMap(w => {
            if ((w as IUpgradeGainsMultiWeapon).profiles) return (w as IUpgradeGainsMultiWeapon).profiles.flatMap(w => w.specialRules)
            return (w as IUpgradeGainsWeapon).specialRules
          }).map(r => r.name)
          usedRules = usedRules.concat(ruleKeys).concat(weaponSpecialRules).concat(upgradeWeaponsSpecialRules)
          // Sort rules alphabetically
          ruleKeys.sort((a, b) => a.localeCompare(b));

          

          return (
            <div key={i} className={style.card}>
              <Card elevation={1}>
                <div className="mb-4">
                  <div className="card-body">
                    <h3 className="is-size-4 my-2" style={{ fontWeight: 500, textAlign: "center" }}>
                      {count > 1 ? `${count}x ` : ""}{u.customName || u.name}
                      {(u.size > 1) && <span className="" style={{ color: "#666666" }}> [{u.size}]</span>}
                      {showPointCosts && <span className="is-size-6 ml-1" style={{ color: "#666666" }}>- {UpgradeService.calculateUnitTotal(u)}pts</span>}</h3>
                    <hr className="my-0" />

                    <div className="is-flex mb-2" style={{ justifyContent: "center" }}>

                      <div className={style.profileStat}>
                        <p>Quality</p>
                        <p>
                          {u.quality}+
                        </p>
                      </div>
                      <div className={style.profileStat}>
                        <p>Defense</p>
                        <p>
                          {u.defense}+
                        </p>
                      </div>
                      {toughness > 1 && <div className={style.profileStat}>
                        <p>Tough</p>
                        <p>
                          {toughness}
                        </p>
                      </div>}

                    </div>
                    <UnitEquipmentTable unit={u} square={true} />
                    {/* {specialRules?.length && <Paper square elevation={0}>
                                            <div className="px-4 mb-4">
                                                <h4 style={{ fontWeight: 600 }}>Special Rules</h4>
                                                <RuleList specialRules={specialRules} />
                                            </div>
                                        </Paper>} */}
                    {rules?.length > 0 && <Paper square elevation={0}>
                      <div className="px-2 my-2">
                        {ruleKeys.map((key, index) => {

                          const group = ruleGroups[key];

                          if (!showFullRules)
                            return (
                              <span key={index} style={{ fontWeight: 600 }}>
                                {index === 0 ? "" : ", "}
                                {/* <RuleList specialRules={[{ ...rule, rating, count }]} /> */}
                                <RuleList specialRules={group} />
                              </span>
                            );

                          const rule = group[0];
                          const rating = group.reduce((total, next) => next.rating ? total + parseInt(next.rating) : total, 0);

                          const ruleDefinition = ruleDefinitions
                            .filter(r => /(.+?)(?:\(|$)/.exec(r.name)[0] === rule.name)[0];

                          return (
                            <p key={index}>
                              <span style={{ fontWeight: 600 }}>
                                {RulesService.displayName({ ...rule, rating }, count)} -
                              </span>
                              <span> {ruleDefinition?.description || ""}</span>
                            </p>
                          );
                        })}
                      </div>
                    </Paper>}
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
        {showPsychic && <div className={style.card} >
          <Card elevation={1}>
            <div className="mb-4">
              <div className="card-body">
                <h3 className="is-size-4 my-2" style={{ fontWeight: 500, textAlign: "center" }}>{["gf", "gff"].includes(army.gameSystem) ? "Psychic Spells" : "Wizard Spells"}</h3>
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
          </Card>
        </div >}
        {showOrgChart && <div className={style.card} >
          <Card elevation={1}>
            <div className="mb-4">
              <div className="card-body">
                <h3 className="is-size-4 my-2" style={{ fontWeight: 500, textAlign: "center" }}>Organisation Chart</h3>
                <hr className="my-0" />

                <Paper square elevation={0}>
                  <div className="px-2 my-2">
                    <ul>
                    {baseUnits.map(u => {
                      let joinedUnits = list.units.filter(t => t.joinToUnit === u.selectionId)
                      return (
                      <li style={{marginBottom: "0.5rem"}}><MiniUnit unit={u} />
                        {joinedUnits.length > 0 ? <ul style={{marginLeft: "0.25rem", paddingLeft: "0.75rem", borderLeft: "1pt solid lightgrey", paddingBottom: "0.25rem", borderBottom: "1pt solid lightgrey", marginRight: "1rem"}}>{joinedUnits.map(j => {return <li><MiniUnit unit={j}></MiniUnit></li>})}</ul> : ""}
                      </li>
                      )
                    })}
                    </ul>
                  </div>
                </Paper>
              </div>
            </div>
          </Card>
        </div >}
      </div >
      {!showFullRules && showRulesSummary && <div className={`mx-4 ${style.card}`} >
        <Card elevation={1}>
          <div className="mb-4">
            <div className="card-body">
              <h3 className="is-size-4 my-2" style={{ fontWeight: 500, textAlign: "center" }}>Special Rules</h3>
              <hr className="my-0" />

              <Paper square elevation={0}>
                <div className={`px-2 my-2 ${style.grid} has-text-left`}>
                  {_.uniq(usedRules).sort().map((r, i) => {
                    let desc = ruleDefinitions.find(t => t.name === r)?.description
                    return desc ?
                    <p key={i} style={{breakInside: "avoid"}}>
                      <span style={{ fontWeight: 600 }}>{r} - </span>
                      <span>{desc}</span>
                    </p> : null
                  })}
                </div>
              </Paper>
            </div>
          </div>
        </Card>
      </div >}
    </>
  );
}

function toughFromUnit(unit) {
  let baseTough: number = 0;

  baseTough += unit.specialRules.reduce((tough, rule) => {
    if (rule.name === "Tough") {
      tough += parseInt(rule.rating);
    }
    return tough;
  }, 0);

  baseTough += UnitService.getAllUpgradedRules(unit).reduce((tough, { name, rating }) => {
    if (name === "Tough") {
      tough += parseInt(rating);
    }
    return tough;
  }, 0)

  return baseTough || 1;
}
