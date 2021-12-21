import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { IconButton, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Create';
import AddIcon from '@mui/icons-material/AddBox';
import UpgradeService from "../../services/UpgradeService";
import { makeReal, renameUnit } from "../../data/listSlice";
import { ISelectedUnit } from "../../data/interfaces";
import { RootState } from "../../data/store";
import UnitService from "../../services/UnitService";
import { debounce } from 'throttle-debounce';

export default function UpgradePanelHeader() {

  const list = useSelector((state: RootState) => state.list);
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [dummy, setDummy] = useState(false)
  const [customName, setCustomName] = useState("");

  const selectedUnit = UnitService.getSelected(list);

  useEffect(() => {
    setCustomName(selectedUnit?.customName ?? selectedUnit?.name ?? "");
    setDummy(selectedUnit?.selectionId === "dummy")
  }, [selectedUnit?.selectionId]);

  const makeRealUnit = (e) => {
    dispatch(makeReal())
  }

  const debounceSave = useCallback(
    debounce(1000, 
      (name) => dispatch(renameUnit({ unitId: selectedUnit.selectionId, name }))
    )
    , [list]);

  if (!selectedUnit)
    return null;

  const toggleEditMode = () => {
    const toggleTo = !editMode;
    setEditMode(toggleTo);
    if (toggleTo) {
      // Focus
    }
  };

  return (
    <div className="is-flex is-align-items-center">
      {dummy && <IconButton size="small" color="primary" className="mr-1 onlyScrolled" onClick={makeRealUnit}>
        <AddIcon />
      </IconButton>}
      {editMode ? (
        <TextField
          autoFocus
          variant="standard"
          className=""
          value={customName}
          onChange={e => { setCustomName(e.target.value); debounceSave(e.target.value); }}
        />
      ) : (
        <div className="is-flex" style={{maxWidth: "calc(100% - 7rem)"}}>
          <h3 className="is-size-4 has-text-left unitName">{selectedUnit.customName || selectedUnit.name} {`[${UnitService.getSize(selectedUnit)}]`}</h3>
        </div>
      )}
      {!dummy && <IconButton color="primary" className="ml-2" onClick={() => toggleEditMode()}>
        <EditIcon />
      </IconButton>}
      <p className="ml-4 is-flex-grow-1" style={{ textAlign: "right" }}>{UpgradeService.calculateUnitTotal(selectedUnit)}pts</p>
    </div>
  );
}