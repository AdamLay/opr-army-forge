import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ISelectedUnit, IUpgrade, IUpgradeOption } from './interfaces';
import UpgradeService from '../services/UpgradeService';
import { debounce } from 'throttle-debounce';
import { current } from 'immer';
import PersistenceService from '../services/PersistenceService';
import { nanoid } from "nanoid";
import UnitService from '../services/UnitService';

export interface ListState {
  creationTime: string;
  name: string;
  pointsLimit?: number;
  units: ISelectedUnit[];
  undoUnitRemove?: ISelectedUnit[];
  selectedUnitId?: string;
  points: number;
}

const initialState: ListState = {
  creationTime: null,
  name: "New Army",
  pointsLimit: 0,
  units: [],
  selectedUnitId: null,
  undoUnitRemove: null,
  points: 0
}

const debounceSave = debounce(1500, (state: ListState) => {
  PersistenceService.updateSave(state);
});

export const listSlice = createSlice({
  name: 'army',
  initialState,
  reducers: {
    resetList: (state) => {
      return {
        creationTime: null,
        name: "New Army",
        pointsLimit: 0,
        initialised: false,
        units: [],
        selectedUnitId: null,
        undoUnitRemove: null,
        points: 0
      };
    },
    createList: (state, action: PayloadAction<{ name: string; pointsLimit?: number; creationTime: string; }>) => {
      const { name, pointsLimit, creationTime } = action.payload;
      state.creationTime = creationTime;
      state.name = name;
      state.pointsLimit = pointsLimit;
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
    addUnit: (state, action: PayloadAction<any>) => {
      state.units.push(action.payload);

      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    makeReal: (state) => {
      const unit = state.units.find(u => u.selectionId === "dummy")
      state.selectedUnitId = unit.selectionId = nanoid(5)

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

      //newUnit.joinToUnit = parentUnit.selectionId;
      parentUnit.joinToUnit = newUnit.selectionId;

      state.units.splice(parentindex + 1, 0, newUnit);
      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    addUnits: (state, action: PayloadAction<any>) => {
      let units = action.payload.units.map(u => {
        return {
          ...u,
          selectionId: nanoid(5)
        }
      })

      action.payload.units.forEach((u, i) => {
        if (u.joinToUnit) {
          //console.log(action.payload.units)
          //console.log(`${u.name} is joined to unit ${u.joinToUnit}...`)
          let joinedIndex = action.payload.units.findIndex((t) => {return t.selectionId === u.joinToUnit})
          //console.log(`unit ${u.joinToUnit} found at index ${joinedIndex}...`)
          if (joinedIndex >= 0) {
            units[i].joinToUnit = units[joinedIndex].selectionId
          } else {
            units[i].joinToUnit = null
            units[i].combined = false
          }
        }
        if (u.combined) {
          units[i].combined = action.payload.units.some((t) => {return (t.selectionId === u.joinToUnit) || (t.joinToUnit === u.selectionId)})
        }
      })

      state.units.splice(action.payload.index ?? -1,0,...units)

      state.points = UpgradeService.calculateListTotal(state.units);

      debounceSave(current(state));
    },
    selectUnit: (state, action: PayloadAction<string>) => {
      state.selectedUnitId = action.payload;
    },
    removeUnit: (state, action: PayloadAction<string>) => {
      const removeIndex = state
        .units
        .findIndex(u => u.selectionId === action.payload);

      if (removeIndex == -1) return null

      let unit = state.units[removeIndex]
      console.log(`removing: ${unit.name} - ${unit.selectionId}`)
      if (unit.combined) {
        console.log(`units is combined - clearing up friend...`)
        if (unit.joinToUnit) {
          console.log(`unit has child... hopefully it's where I put it.'`)
          if (state.units.findIndex(t => { return unit.joinToUnit === t.selectionId }) == removeIndex + 1)
            state.undoUnitRemove = state.units.splice(removeIndex, 2);
          else {
            let child = state.units.find(t => { return unit.joinToUnit === t.selectionId })
            console.log(`child: ${child.name} - ${child.selectionId}`)
            if (child) {
              unit.combined = false
              unit.joinToUnit = null
              child.combined = false
            }
            state.undoUnitRemove = state.units.splice(removeIndex, 1);
          }
        } else {
          console.log(`unit has no child, so must have parent... finding it.`)
          let parent = state.units.find(t => { return t.combined && (t.joinToUnit === action.payload) })
          if (parent) {
            console.log(`parent: ${parent.name} - ${parent.selectionId}`)
            parent.combined = false
            parent.joinToUnit = null
          }
          // don't bother saving it in the undoRemove stuff.
          state.units.splice(removeIndex, 1);
        }
      } else {
        if (unit.selectionId === "dummy") {
          state.units.splice(removeIndex, 1);
        } else {
          state.undoUnitRemove = state.units.splice(removeIndex, 1);
        }
      }

      state.points = UpgradeService.calculateListTotal(state.units);
      console.log(state.undoUnitRemove)
      debounceSave(current(state));
    },
    undoRemoveUnit: (state) => {
      console.log(`restoring unit: `)
      console.log(state.undoUnitRemove)
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
      const joinToUnit = state.units.filter(u => u.selectionId === joinToUnitId)[0];

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

      UpgradeService.remove(unit, upgrade, option);
      if (unit.combined && upgrade.affects == "all") {
        const partner = state.units.find(t => (t.selectionId == unit.joinToUnit) || (t.combined && (t.joinToUnit == unit.selectionId)))
        UpgradeService.remove(partner, upgrade, option);
      }

      state.points = UpgradeService.calculateListTotal(state.units);

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
  makeReal,
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
  undoRemoveUnit
} = listSlice.actions

export default listSlice.reducer