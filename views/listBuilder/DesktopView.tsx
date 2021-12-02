import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../data/store';
import { UnitSelection } from "../UnitSelection";
import { MainList } from "../MainList";
import { Upgrades } from "../upgrades/Upgrades";
import MainMenu from "../components/MainMenu";
import { Paper } from "@mui/material";
import UpgradePanelHeader from "../components/UpgradePanelHeader";
import ListConfigurationDialog from "../ListConfigurationDialog";
import ValidationErrors from "../ValidationErrors";
import UndoRemoveUnit from "../components/UndoRemoveUnit";
import { selectUnit, addUnit, removeUnit } from "../../data/listSlice";
import { ISelectedUnit, IUnit } from "../../data/interfaces";
import UnitService from "../../services/UnitService";

export default function DesktopView() {

  const list = useSelector((state: RootState) => state.list);
  const [editListOpen, setEditListOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [showUndoRemove, setShowUndoRemove] = useState(false);

  const dispatch = useDispatch();

  const columnStyle: any = { overflowY: "scroll", maxHeight: "100%" };

  const setScrolled = (e) => {
    let elem = e.target
    if (elem.scrollTop) {
      elem.classList.add("scrolled")
    } else {
      elem.classList.remove("scrolled")
    }
  }

  const onAddUnit = useCallback((unit: IUnit, dummy = false) => {
    if (dummy) {
      if (list.units.some(u => u.selectionId === "dummy")) {
        dispatch(removeUnit("dummy"))
      }
    }
    dispatch(addUnit(UnitService.getRealUnit(unit, dummy)));
  }, [list])

  const onSelectUnit = useCallback((unit: ISelectedUnit) => {
    if (list.selectedUnitId !== unit.selectionId) {
      if (list.selectedUnitId === "dummy") {
        dispatch(removeUnit("dummy"))
      }
      dispatch(selectUnit(unit.selectionId));
    }
  }, [list])

  return (
    <>
      <Paper elevation={1} color="primary" square>
        <MainMenu setListConfigurationOpen={setEditListOpen} setValidationOpen={setValidationOpen} />
      </Paper>
      <div className="columns my-0" style={{ height: "calc(100vh - 64px)" }}>
        <div className="column py-0 pr-0" style={columnStyle} onScroll={setScrolled}>
          <UnitSelection onSelected={onSelectUnit} addUnit={onAddUnit} />
        </div>
        <div className="column p-0" style={columnStyle} onScroll={setScrolled}>
          <MainList onSelected={onSelectUnit} onUnitRemoved={() => setShowUndoRemove(true)} />
        </div>
        <div className="column py-0 px-0 mr-4" style={columnStyle} onScroll={setScrolled}>
          <Paper square className="px-4 pt-4 sticky" sx={{backgroundColor: "white"}}>
            <UpgradePanelHeader />
          </Paper>
          <Upgrades />
        </div>
      </div>
      <ValidationErrors
        open={validationOpen}
        setOpen={setValidationOpen} />
      <ListConfigurationDialog
        isEdit={true}
        open={editListOpen}
        setOpen={setEditListOpen}
        customArmies={null} />
      <UndoRemoveUnit
        open={showUndoRemove}
        setOpen={setShowUndoRemove} />
    </>
  );
}
