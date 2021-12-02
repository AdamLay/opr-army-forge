import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../data/store'
import { UnitSelection } from "../UnitSelection";
import { MainList } from "../MainList";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'react-spring-bottom-sheet/dist/style.css';
import { Upgrades } from "../upgrades/Upgrades";
import { BottomSheet } from "react-spring-bottom-sheet";
import { AppBar, Paper, Tab, Tabs, Button } from "@mui/material";
import { selectUnit, addUnit } from "../../data/listSlice";
import UpgradePanelHeader from "../components/UpgradePanelHeader";
import Add from "@mui/icons-material/Add";
import MainMenu from "../components/MainMenu";
import ListConfigurationDialog from "../ListConfigurationDialog";
import ValidationErrors from "../ValidationErrors";
import UndoRemoveUnit from "../components/UndoRemoveUnit";
import ArmyImage from "../components/ArmyImage";
import { ISelectedUnit } from "../../data/interfaces";
import UnitService from "../../services/UnitService";

export default function MobileView() {

  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);

  const dispatch = useDispatch();

  const [selectedUnit, setselectedUnit] = useState(null);
  const [slider, setSlider] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(1);
  const [editListOpen, setEditListOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [showUndoRemove, setShowUndoRemove] = useState(false);

  // Open bottom sheet when unit is selected
  const onUnitSelected = useCallback((unit: ISelectedUnit) => {
    setSheetOpen(true);
  }, [])

  const onAddUnit = useCallback((unit: ISelectedUnit) => {
    dispatch(addUnit(UnitService.getRealUnit(unit)));
  }, [])

  // Reset selected unit when sheet is closed
  function onDismissSheet() {
    setSheetOpen(false);
    dispatch(selectUnit(null));
  }

  // Keep Tab bar and carousel in sync
  const handleSlideChange = (event, newValue) => {
    setSlideIndex(newValue);
    slider.slickGoTo(newValue);
  };

  // Slick carousel settings
  const sliderSettings = {
    dots: false,
    slidesToShow: 1,
    infinite: false,
    arrows: false,
    initialSlide: 1,
    beforeChange: (current, next) => handleSlideChange(null, next)
  };

  return (
    <>
      <Paper elevation={1} color="primary" square style={{ position: "sticky", top: 0, zIndex: 1 }}>
        <MainMenu setListConfigurationOpen={setEditListOpen} setValidationOpen={setValidationOpen} />
        <AppBar elevation={0} style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <Tabs value={slideIndex} onChange={handleSlideChange} centered variant="fullWidth" textColor="inherit" indicatorColor="primary">
            <Tab label={`${army?.data?.name} ${army?.data?.versionString}`} />
            <Tab label={`My List - ${list.points}pts`} />
          </Tabs>
        </AppBar>
      </Paper>

      <Slider {...sliderSettings} ref={slider => setSlider(slider)} style={{ maxHeight: "100%" }}>
        <div>
          <UnitSelection onSelected={() => {}} addUnit={onAddUnit} mobile />
        </div>
        <div className="">
          {list.units.length > 0 ? <MainList onSelected={onUnitSelected} onUnitRemoved={() => setShowUndoRemove(true)} mobile /> : (
            <div className="p-4 has-text-centered">
              <h3 className="is-size-3 mb-4">Your list is empty</h3>
              <Button variant="outlined" onClick={() => handleSlideChange(null, 0)}>
                <Add /> Add Units
              </Button>
              <div className="is-flex mt-6" style={{
                height: "160px",
                width: "100%",
                backgroundImage: `url("img/gf_armies/${army?.data?.name}.png")`,
                backgroundPosition: "center",
                backgroundSize: "contain",
                backgroundRepeat: 'no-repeat',
                position: "relative",
                zIndex: 1,
                opacity: 0.5
              }}></div>
            </div>
          )}
        </div>
      </Slider>

      <BottomSheet
        open={sheetOpen}
        onDismiss={onDismissSheet}
        initialFocusRef={false}
        expandOnContentDrag={true}
        onScrollCapture={(e) => e.preventDefault()}
        defaultSnap={({ snapPoints, lastSnap }) =>
          lastSnap ?? Math.min(...snapPoints)
        }
        snapPoints={({ minHeight, maxHeight }) => [
          minHeight,
          maxHeight * 0.9
        ]}
        header={<UpgradePanelHeader />}>
        <Upgrades mobile />
      </BottomSheet>

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
