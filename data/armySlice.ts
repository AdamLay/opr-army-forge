import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUnit, IUpgradePackage } from './interfaces';

export interface IGameRule {
  name: string;
  description: string;
  options: string[];
}

export interface ArmyState {
  loaded: boolean;
  gameSystem: string;
  armyFile: string;
  data: IArmyData;
  childData: IArmyData[];
  rules: IGameRule[];
}

export interface IArmyData {
  uid: string;
  name: string;
  factionName: string;
  factionRelation: string;
  versionString: string;
  dataToolVersion: string;
  units: IUnit[];
  upgradePackages: IUpgradePackage[];
  specialRules: IGameRule[];
  spells: { id: string; name: string; effect: string; threshold: number; }[];
  isLive: boolean;
  official: boolean;
  coverImagePath: string;
  username?: string;
}

const initialState: ArmyState = {
  loaded: false,
  armyFile: null,
  gameSystem: null,
  data: null,
  childData: null,
  rules: []
}

export const armySlice = createSlice({
  name: 'army',
  initialState: initialState,
  reducers: {
    loadArmyData: (state, action: PayloadAction<IArmyData>) => {
      return {
        ...state,
        data: action.payload,
        loaded: true
      };
    },
    loadChildArmyData: (state, action: PayloadAction<IArmyData[]>) => {
      return {
        ...state,
        childData: action.payload
      };
    },
    setGameSystem: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        gameSystem: action.payload
      };
    },
    setArmyFile: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        armyFile: action.payload
      };
    },
    setGameRules: (state, action: PayloadAction<IGameRule[]>) => {
      return {
        ...state,
        rules: action.payload
      };
    }
  },
})

// Action creators are generated for each case reducer function
export const { loadArmyData, loadChildArmyData, setGameSystem, setArmyFile, setGameRules } = armySlice.actions;

export default armySlice.reducer;
