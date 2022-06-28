import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import WebappApiService from '../services/WebappApiService';

export interface FtlState {
  factionData: IFtlData[];
  selectedFaction: IFtlData;
  ships: ISelectededShip[];
  loaded: boolean;
}

export interface IFtlData {
  key: string;
  faction: string;
  hint: string;
  version: string;
  shipClasses: IShipClass[];
  upgrades: IFtlUpgrade[];
  heroes: IFtlUpgrade[];
  titles: IFtlTitle[];
  specialRules: IFtlRule[];
}

export interface IShipClass {
  key: string,
  label: string,
  category: string,
  type: string,
  cost: number,
  speed: IFtlSpeed;
  turret: IFtlTurret;
  defense: IFtlDefense;
  upgradeSlotCount: 4;
  specialRules: IFtlRule[];
  faction: string;
}

export interface IFtlSpeed {
  move: number;
  cruise: number;
}

export interface IFtlDefense {
  evasion: number;
  toughness: number;
}

export interface IFtlTurret {
  type: string;
  key: string;
  label: string;
  range: number;
  attacks: number;
  strength: number;
}

export interface IFtlRule {
  type: string;
  key: string;
  label: string;
  effect: string;
}

export interface IFtlUpgrade {
  type: "upgrade";
  key: string;
  label: string;
  effect: string;
  modifiers: [],
  faction: string;
}

export interface IFtlHero {
  type: "hero",
  key: string;
  label: string;
  effect: string;
  cost: number;
  modifiers: any[];
}

export interface IFtlTitle {
  type: "title",
  key: string;
  label: string;
  effect: string;
  cost: number;
  modifiers: any[]
}

export interface ISelectededShip extends IShipClass {

}

const initialState: FtlState = {
  factionData: null,
  selectedFaction: null,
  ships: [],
  loaded: false
};

export const getFtlBooks = createAsyncThunk("army/getArmyBooks", async () => {
  const ftlData = await WebappApiService.getFtlData();
  console.log("Loaded FTL data", ftlData);
  return ftlData;
});

export const ftlSlice = createSlice({
  name: 'army',
  initialState: initialState,
  reducers: {
    selectFtlFaction(state, action: PayloadAction<IFtlData>) {
      const data: IFtlData = action.payload;
      const commonFaction = state
        .factionData
        .find(x => x.key === "common");

      state.selectedFaction = {
        ...data,
        shipClasses: data.shipClasses.concat(commonFaction.shipClasses),
        upgrades: data.upgrades.concat(commonFaction.upgrades),
        heroes: data.heroes.concat(commonFaction.heroes),
        titles: data.titles.concat(commonFaction.titles),
        specialRules: data.specialRules.concat(commonFaction.specialRules)
      };

      // TODO: where should this go?
      state.loaded = true;
    }
  },
  extraReducers(builder) {
    builder.addCase(getFtlBooks.fulfilled, (state, action) => {
      return { ...state, factionData: action.payload };
    });
  },
})

// Action creators are generated for each case reducer function
export const { selectFtlFaction } = ftlSlice.actions;

export default ftlSlice.reducer;
