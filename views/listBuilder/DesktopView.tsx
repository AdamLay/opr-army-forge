import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../data/store";
import { UnitSelection } from "../UnitSelection";
import { MainList } from "../MainList";
import { Upgrades } from "../upgrades/Upgrades";
import MainMenu from "../components/MainMenu";
import { Card, Paper } from "@mui/material";
import UpgradePanelHeader from "../components/UpgradePanelHeader";
import ValidationErrors from "../ValidationErrors";
import UndoRemoveUnit from "../components/UndoRemoveUnit";
import { FtlShipSelection } from "../FtlShipSelection";

export default function DesktopView() {
  const list = useSelector((state: RootState) => state.list);
  const ftl = useSelector((state: RootState) => state.ftl);
  const loadedArmyBooks = useSelector((state: RootState) => state.army.loadedArmyBooks);
  const [validationOpen, setValidationOpen] = useState(false);
  const [showUndoRemove, setShowUndoRemove] = useState(false);

  const armyData = loadedArmyBooks?.[0];
  const columnStyle: any = { overflowY: "scroll", maxHeight: "100%" };

  const setScrolled = (e) => {
    let elem = e.target;
    if (elem.scrollTop) {
      elem.classList.add("scrolled");
    } else {
      elem.classList.remove("scrolled");
    }
  };

  const unitSelectionColumn = (
    <div className="column py-0 pr-0" style={columnStyle} onScroll={setScrolled}>
      <Card square elevation={3}>
        <h3 className="p-4 is-size-4 is-hidden-mobile">
          {ftl.loaded
            ? ftl.selectedFaction.faction
            : loadedArmyBooks.length > 1
            ? "Army Books"
            : `${armyData.name} - ${armyData.versionString}`}
        </h3>
      </Card>
      {ftl.loaded ? <FtlShipSelection /> : <UnitSelection />}
    </div>
  );

  const mainListColumn = (
    <div className="column p-0" style={columnStyle} onScroll={setScrolled}>
      <Card square elevation={3}>
        <h3 className="p-4 is-size-4 is-hidden-mobile">
          {`My List - ${list.points}` + (list.pointsLimit ? `/${list.pointsLimit}` : "") + "pts"}
        </h3>
      </Card>
      <MainList onSelected={() => {}} onUnitRemoved={() => setShowUndoRemove(true)} />
    </div>
  );

  const upgradesColumn = (
    <div className="column py-0 px-0 mr-4" style={columnStyle} onScroll={setScrolled}>
      <Card square elevation={1} className="px-4 pt-4 pb-2 sticky">
        <UpgradePanelHeader />
      </Card>
      <Upgrades />
    </div>
  );

  return (
    <>
      <Paper elevation={1} color="primary" square>
        <MainMenu />
      </Paper>
      <div className="columns my-0" style={{ height: "calc(100vh - 64px)" }}>
        {unitSelectionColumn}
        {mainListColumn}
        {upgradesColumn}
      </div>
      <ValidationErrors open={validationOpen} setOpen={setValidationOpen} />
      <UndoRemoveUnit open={showUndoRemove} setOpen={setShowUndoRemove} />
    </>
  );
}
