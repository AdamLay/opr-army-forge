import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISelectedUnit, IUnit, IUpgrade, IUpgradeOption } from './interfaces';
import UpgradeService from '../services/UpgradeService';
import { debounce } from 'throttle-debounce';
import { current } from 'immer';
import PersistenceService from '../services/PersistenceService';
import { nanoid } from "nanoid";
import UnitService from '../services/UnitService';
import { makeCopy } from '../services/Helpers';
import { IShipClass } from './ftlSlice';

export interface ListState {
  creationTime: string;
  name: string;
  pointsLimit?: number;
  units: ISelectedUnit[];
  undoUnitRemove?: ISelectedUnit[];
  selectedUnitId?: string;
  points: number;
  unitPreview?: ISelectedUnit;
  campaignMode?: boolean;
}

const initialState: ListState = {
  creationTime: null,
  name: null,
  pointsLimit: 0,
  units: [],
  selectedUnitId: null,
  undoUnitRemove: null,
  points: 0,
  unitPreview: null,
  campaignMode: false
};

const debounceSave = debounce(1500, (state: ListState) => {
  PersistenceService.updateSave(state);
});

export const listSlice = createSlice({
  name: 'army',
  initialState,
  reducers: {
    resetList: (state) => {
      return initialState;
    },
    createList: (state, action: PayloadAction<ListState>) => {
      return action.payload;
    },
    updateCreationTime: (state, action: PayloadAction<string>) => {
      state.creationTime = action.payload;
      debounceSave(current(state));
    },
    updateListSettings: (state, action: PayloadAction<{ name: string, pointsLimit?: number }>) => {
      const { name, pointsLimit } = action.payload;
      state.name = name;
      state.pointsLimit = pointsLimit;
      debounceSave(current(state));
    },
    loadSavedList(state, action: PayloadAction<ListState>) {
      return { ...action.payload };
    },
    addUnit: (state, action: PayloadAction<IUnit>) => {
      const selectedUnit = UnitService.createUnitFromDefinition(action.payload);
      const unit = UpgradeService.buildUpgrades(selectedUnit)
      state.units.push(unit);
      state.selectedUnitId = unit.selectionId;
      state.unitPreview = null;
      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    addCombinedUnit: (state, action: PayloadAction<string>) => {
      const parentindex = state.units.findIndex((t) => action.payload == t.selectionId);

      let parentUnit = state.units[parentindex];
      parentUnit.combined = true;

      let newUnit = {
        ...parentUnit,
        selectionId: nanoid(5)
      };

      newUnit.joinToUnit = parentUnit.selectionId;
      //parentUnit.joinToUnit = newUnit.selectionId;

      state.units.splice(parentindex + 1, 0, newUnit);
      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    addUnits: (state, action: PayloadAction<ISelectedUnit[]>) => {
      const units = action.payload;
      let unitsMapped = units.map(u => ({
        ...u,
        selectionId: nanoid(5)
      }));

      units.forEach((u, i) => {
        if (u.joinToUnit) {
          //console.log(action.payload.units)
          //console.log(`${u.name} is joined to unit ${u.joinToUnit}...`)
          let joinedIndex = units.findIndex((t) => { return t.selectionId === u.joinToUnit })
          //console.log(`unit ${u.joinToUnit} found at index ${joinedIndex}...`)
          if (joinedIndex >= 0) {
            unitsMapped[i].joinToUnit = unitsMapped[joinedIndex].selectionId
          } else {
            unitsMapped[i].joinToUnit = null
            unitsMapped[i].combined = false
          }
        }
        if (u.combined) {
          unitsMapped[i].combined = units.some((t) => { return (t.selectionId === u.joinToUnit) || (t.joinToUnit === u.selectionId) })
        }
      })

      //state.units.splice(index ?? -1, 0, ...unitsMapped)
      state.units.push(...unitsMapped);
      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    selectUnit: (state, action: PayloadAction<string>) => {
      state.selectedUnitId = action.payload;
      state.unitPreview = null
    },
    removeUnit: (state, action: PayloadAction<string>) => {
      const unitId = action.payload
      const removeIndex = state
        .units
        .findIndex(u => u.selectionId === unitId);

      if (removeIndex == -1) return null

      let unit = state.units[removeIndex]

      //console.log(`removing: ${unit.name} - ${unitId}`)
      if (unit.combined) {
        //console.log(`units is combined - clearing up friend...`)
        if (!unit.joinToUnit) {
          state.undoUnitRemove = state.units.splice(removeIndex, 1);
          let childIndex = state.units.findIndex(t => { return (t.combined && t.joinToUnit === unitId) })
          if (childIndex !== -1) {
            state.undoUnitRemove = state.undoUnitRemove.concat(state.units.splice(childIndex, 1));
          }
        } else {
          //console.log(`unit has no child, so must have parent... finding it.`)
          let parent = state.units.find(t => { return t.combined && (unit.joinToUnit === t.selectionId) })
          //console.log(`parent: ${parent.name} - ${parent.selectionId}`)
          if (parent) {
            console.log(`parent: ${parent.name} - ${parent.selectionId}`)
            parent.combined = false
          }
          // don't bother saving it in the undoRemove stuff.
          state.units.splice(removeIndex, 1);
        }

      } else {
        state.undoUnitRemove = state.units.splice(removeIndex, 1);
      }

      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    undoRemoveUnit: (state) => {
      state.units = state.units.concat(state.undoUnitRemove);

      state.undoUnitRemove = null;

      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    renameUnit: (state, action: PayloadAction<{ unitId: string, name: string }>) => {
      const { unitId, name } = action.payload;
      const unit = state.units.filter(u => u.selectionId === unitId)[0];
      unit.customName = name;
      if (unit.combined) {
        let partner = state.units.find(t => (t.selectionId === unit.joinToUnit) || (t.combined && t.joinToUnit === unitId))
        partner.customName = name;
      }

      debounceSave(current(state));
    },
    moveUnit: (state, action: PayloadAction<{ from: number, to: number }>) => {
      let { from, to } = action.payload;
      to = (to <= from) ? to : to - 1;
      if (from == to) return;
      const unit = state.units[from];
      state.units.splice(from, 1);
      state.units.splice(to, 0, unit);
      debounceSave(current(state));
    },
    reorderList: (state, action: PayloadAction<Array<number>>) => {
      let update = false;
      let newunits = action.payload.map((v, i) => {
        if (v != i) { update = true }
        return state.units[v]
      })
      if (update) {
        state.units = newunits
        debounceSave(current(state));
      }
    },
    toggleUnitCombined: (state, action: PayloadAction<string>) => {
      const unitId = action.payload;
      const unit = state.units.filter(u => u.selectionId === unitId)[0];

      if (unit) {

        state.points = UpgradeService.calculateListTotal(state.units);

        debounceSave(current(state));
      }
    },
    joinUnit: (state, action: PayloadAction<{ unitId: string, joinToUnitId: string }>) => {
      const { unitId, joinToUnitId } = action.payload;
      const unit = state.units.filter(u => u.selectionId === unitId)[0];

      unit.joinToUnit = joinToUnitId;

      debounceSave(current(state));
    },
    applyUpgrade: (state, action: PayloadAction<{ unitId: string, upgrade: IUpgrade, option: IUpgradeOption }>) => {

      // TODO: Refactor, break down, unit test...

      const { unitId, upgrade, option } = action.payload;
      const unit = state.units.filter(u => u.selectionId === unitId)[0];

      UpgradeService.apply(unit, upgrade, option);
      if (unit.combined && upgrade.affects == "all") {
        const partner = state.units.find(t => (t.selectionId == unit.joinToUnit) || (t.combined && (t.joinToUnit == unit.selectionId)))
        UpgradeService.apply(partner, upgrade, option);
      }

      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    removeUpgrade: (state, action: PayloadAction<{ unitId: string, upgrade: IUpgrade, option: IUpgradeOption }>) => {

      // TODO: Refactor, break down, unit test...

      const { unitId, upgrade, option } = action.payload;
      const unit = state.units.filter(u => u.selectionId === unitId)[0];

      UpgradeService.remove(unit, option);
      if (unit.combined && upgrade.affects == "all") {
        const partner = state.units.find(t => (t.selectionId == unit.joinToUnit) || (t.combined && (t.joinToUnit == unit.selectionId)))
        UpgradeService.remove(partner, option);
      }

      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    removeUnitsForBook(state, action: PayloadAction<string>) {
      const armyBookId = action.payload;
      state.units = state.units.filter(unit => unit.armyId !== armyBookId);
    },
    previewUnit(state, action: PayloadAction<ISelectedUnit>) {
      const unit: ISelectedUnit = makeCopy(action.payload);
      unit.selectedUpgrades = [];
      state.unitPreview = UpgradeService.buildUpgrades(unit);
      state.selectedUnitId = null;
    },
    clearPreview(state) {
      state.unitPreview = null;
    },
    adjustXp(state, action: PayloadAction<{ unitId: string, xp: number }>) {
      const { unitId, xp } = action.payload;
      const unit = state.units.find(u => u.selectionId === unitId);
      if (!unit.xp)
        unit.xp = 0;
      unit.xp += xp;
      debounceSave(current(state));
    },
    toggleTrait(state, action: PayloadAction<{ unitId: string, trait: string }>) {
      const { unitId, trait } = action.payload;
      const unit = state.units.find(u => u.selectionId === unitId);
      const existingTraitIndex = unit.traits.findIndex(t => t === trait);
      if (existingTraitIndex >= 0) {
        unit.traits.splice(existingTraitIndex, 1);
      } else {
        unit.traits.push(trait);
      }

      debounceSave(current(state));
    },
    setUnitNotes(state, action: PayloadAction<{ unitId: string, notes: string }>) {
      const { unitId, notes } = action.payload;
      const unit = state.units.find(u => u.selectionId === unitId);
      unit.notes = notes;
      debounceSave(current(state));
    }
  },
})

// Action creators are generated for each case reducer function
export const {
  resetList,
  createList,
  addUnit,
  applyUpgrade,
  removeUpgrade,
  addCombinedUnit,
  addUnits,
  selectUnit,
  removeUnit,
  renameUnit,
  moveUnit,
  reorderList,
  toggleUnitCombined,
  joinUnit,
  loadSavedList,
  updateListSettings,
  updateCreationTime,
  undoRemoveUnit,
  removeUnitsForBook,
  previewUnit,
  clearPreview,
  adjustXp,
  toggleTrait,
  setUnitNotes
} = listSlice.actions;

export default listSlice.reducer;