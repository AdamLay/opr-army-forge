import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux'
import { Button, IconButton, TextField } from "@mui/material";
import EditIcon from '@mui/icons-material/Create';
import UpgradeService from "../../services/UpgradeService";
import { makeReal, renameUnit } from "../../data/listSlice";
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
    <>
      <div className="is-flex is-align-items-center">
        {editMode ? (
          <TextField
            autoFocus
            variant="standard"
            className=""
            value={customName}
            onChange={e => { setCustomName(e.target.value); debounceSave(e.target.value); }}
          />
        ) : (
          <div className="is-flex" style={{ maxWidth: "calc(100% - 7rem)" }}>
            <h3 className="is-size-4 has-text-left unitName">{selectedUnit.customName || selectedUnit.name} {`[${UnitService.getSize(selectedUnit)}]`}</h3>
          </div>
        )}
        {!dummy && <IconButton color="primary" className="ml-2" onClick={() => toggleEditMode()}>
          <EditIcon />
        </IconButton>}
        <p className="ml-4 is-flex-grow-1" style={{ textAlign: "right" }}>{UpgradeService.calculateUnitTotal(selectedUnit)}pts</p>
      </div>
      {dummy && <Button variant="contained" className="mt-2 mb-2" style={{width:"100%"}} onClick={() => dispatch(makeReal())}>Add to My List</Button>}
    </>
  );
}