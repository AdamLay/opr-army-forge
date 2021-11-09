import { Checkbox, FormControlLabel, FormGroup, Paper, FormControl, MenuItem, InputLabel, Select } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../data/store';
import styles from "../../styles/Upgrades.module.css";
import UpgradeGroup from './UpgradeGroup';
import UnitEquipmentTable from '../UnitEquipmentTable';
import RuleList from '../components/RuleList';
import { ISpecialRule, IUpgradePackage } from '../../data/interfaces';
import UnitService from '../../services/UnitService';
import { toggleUnitCombined, joinUnit, addCombinedUnit, removeUnit, moveUnit } from '../../data/listSlice';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SpellsTable from '../SpellsTable';
import { CustomTooltip } from '../components/CustomTooltip';
import UpgradeService from '../../services/UpgradeService';
import LinkIcon from '@mui/icons-material/Link';

export function Upgrades({mobile = false}) {

  const list = useSelector((state: RootState) => state.list);
  const gameSystem = useSelector((state: RootState) => state.army.gameSystem);
  const army = useSelector((state: RootState) => state.army.data);
  const spells = army?.spells;
  const dispatch = useDispatch();

  const selectedUnit = UnitService.getSelected(list);

  const getUpgradeSet = (id) => army.upgradePackages.filter((s) => s.uid === id)[0];

  const equipmentSpecialRules: ISpecialRule[] = selectedUnit && selectedUnit
    .equipment
    .filter(e => !e.attacks && e.specialRules?.length) // No weapons, and only equipment with special rules
    .reduce((value, e) => value.concat(e.specialRules), []); // Flatten array of special rules arrays

  const unitUpgradeRules: ISpecialRule[] = selectedUnit && UnitService
    .getAllUpgradedRules(selectedUnit);

  const specialRules = selectedUnit && (selectedUnit.specialRules || [])
    .concat(equipmentSpecialRules)
    .concat(unitUpgradeRules)
    .filter(r => r.name !== "-");

  const isSkirmish = gameSystem !== "gf" && gameSystem !== "aof";
  const isHero = selectedUnit ? selectedUnit.specialRules.findIndex(sr => sr.name === "Hero") > -1 : false;
  const isPsychic = specialRules?.findIndex(r => r.name === "Psychic" || r.name === "Wizard") > -1;

  const joinToUnit = (e) => {
    const joinToUnitId = e.target.value;

    dispatch(joinUnit({
      unitId: selectedUnit.selectionId,
      joinToUnitId: joinToUnitId
    }));
    if (!!joinToUnitId) {
      dispatch(moveUnit({
        from: list.units.findIndex(t => t.selectionId == selectedUnit.selectionId),
        to: list.units.findIndex(t => t.selectionId == joinToUnitId)
      }))
    }
  };

  const originalUpgradeSets = (selectedUnit?.upgrades || [])
    .map((setId) => getUpgradeSet(setId))
    .filter((s) => !!s); // remove empty sets?

  const upgradeSets = isHero
    ? originalUpgradeSets
    : [
      ...originalUpgradeSets.splice(1),
      originalUpgradeSets[0]
    ].filter((s) => !!s);

  const toggleCombined = () => {
    if (selectedUnit.combined) {
      if (selectedUnit.joinToUnit) {
        dispatch(removeUnit(selectedUnit.joinToUnit))
      } else {
        dispatch(removeUnit(selectedUnit.selectionId))
      }
    } else {
      dispatch(addCombinedUnit(selectedUnit.selectionId))
    }
  };

  const unitsWithAttachedHeroes = list.units
    .filter(u => u.specialRules.some(rule => rule.name === "Hero"))
    .filter(u => u.joinToUnit)
    .map(u => u.joinToUnit);

  const joinCandidates = list.units
    .filter(u => u.size > 1 && !(u.combined && !u.joinToUnit))
    .filter(u => unitsWithAttachedHeroes.indexOf(u.selectionId) === -1 || u.selectionId == selectedUnit?.joinToUnit);

  return (
    <div className={styles["upgrade-panel"]}>

      {selectedUnit && <Paper square elevation={0}>
        {/* Combine unit */}
        {selectedUnit.size > 1 && !isSkirmish && <FormGroup className="px-4 pt-2 is-flex-direction-row is-align-items-center">
          <FormControlLabel control={
            <Checkbox checked={selectedUnit.combined} onClick={() => toggleCombined()
            }  disabled={(selectedUnit.combined && !selectedUnit.joinToUnit && mobile)} />} label="Combined Unit" className="mr-2" />
          <CustomTooltip title={"When preparing your army you may merge units by deploying two copies of the same unit as a single big unit, as long as any upgrades that are applied to all models are bought for both."} arrow enterTouchDelay={0} leaveTouchDelay={5000}>
            <InfoOutlinedIcon color="primary" />
          </CustomTooltip>
        </FormGroup>}
        {/* Join to unit */}
        {!isSkirmish && isHero && <FormGroup className="px-4 pt-2 pb-3">
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label" sx={{ zIndex: "unset" }}>Join To Unit</InputLabel>
            <Select
              value={selectedUnit?.joinToUnit || ""}
              label="Join To Unit"
              onChange={joinToUnit}
            >
              <MenuItem value={null}>None</MenuItem>
              {joinCandidates.map((u, index) => (
                <MenuItem key={index} value={u.selectionId}>{u.customName || u.name} [{u.size * (u.combined ? 2 : 1)}]</MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGroup>}
        {/* Equipment */}
        <div className="px-4 pt-2">
          <UnitEquipmentTable unit={selectedUnit} />
        </div>
        {isPsychic && <div className="px-4 pt-2">
          <SpellsTable />
        </div>}
        {/* Rules */}
        {specialRules?.length > 0 &&
          <div className="p-4 mb-4">
            <h4 style={{ fontWeight: 600, fontSize: "14px" }}>Special Rules</h4>
            <RuleList specialRules={specialRules} />
          </div>}

      </Paper>}

      {upgradeSets.map((pkg: IUpgradePackage) => (
        <div key={pkg.uid}>
          {/* <p className="px-2">{set.id}</p> */}
          {pkg.sections.map((u, i) => (
            <div className={"mt-4"} key={i}>
              <div className="px-4 is-flex is-align-items-center">
                {(selectedUnit.combined && (u.affects === "all")) &&
                  <CustomTooltip title="This option will be the same on both combined units." arrow enterTouchDelay={0} leaveTouchDelay={5000}>
                    <LinkIcon sx={{ fontSize: 22 }} className="mr-2" />
                  </CustomTooltip>}
                <p className="pt-0" style={{ fontWeight: "bold", fontSize: "14px", lineHeight: 1.7 }}>
                  {/* {UpgradeService.displayName(u, selectedUnit)}: */}
                  {u.label}
                </p>
              </div>
              <UpgradeGroup upgrade={u} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}