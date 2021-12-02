import { useState, forwardRef, useEffect, Fragment } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../data/store'
import { useRouter } from 'next/router';
import { Button, CircularProgress, Dialog, List, ListItem, ListItemText, Slide, TextField } from "@mui/material";
import { AppBar, IconButton, Toolbar, Typography, FormGroup, FormControlLabel, Checkbox, Radio } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { createList, updateListSettings } from "../data/listSlice";
import { TransitionProps } from "@mui/material/transitions";
import DataService from "../services/DataService";
import { loadArmyData } from "../data/armySlice";
import ArmyImage from "./components/ArmyImage";
import PersistenceService from "../services/PersistenceService";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ListConfigurationDialog({ isEdit, open, setOpen, customArmies }) {

  const army = useSelector((state: RootState) => state.army);
  const list = useSelector((state: RootState) => state.list);

  const [armyName, setArmyName] = useState(isEdit ? list.name : "");
  const [pointsLimit, setPointsLimit] = useState(isEdit ? list.pointsLimit : null);
  const [autoSave, setAutoSave] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const isLive = typeof (window) !== "undefined"
    ? window.location.host === "opr-army-forge.vercel.app" || window.location.host === "army-forge.onepagerules.com"
    : true;

  const factionRelation = army.childData?.filter(c => c.factionRelation)[0]?.factionRelation;

  // Update default name once data comes in
  useEffect(() => {
    if (!isEdit && army.data && army.data.name) {
      var armyName = (army.data.uid && customArmies) ? customArmies?.find(t => t.uid === army.data.uid).name : army.data.name
      setArmyName(armyName);
      setSelectedChild(armyName);
    }
  }, [army.data, customArmies, isEdit]);

  const create = () => {

    if (army.childData?.length > 0 && !selectedChild)
      return alert("Must select a " + factionRelation);

    const finish = (army) => {
      const name = armyName || "My List";

      const creationTime = autoSave ? PersistenceService.createSave(army, name) : null;

      dispatch(createList({ name, pointsLimit: pointsLimit || 0, creationTime }));

      router.push('/list');
    };

    if (factionRelation) {

      const childArmy = army.childData.find(child => child.name === selectedChild);

      DataService.getApiData(childArmy.uid, afData => {

        dispatch(loadArmyData(afData));

        finish({ ...army, ...childArmy, data: afData });
      }, err => {throw(err)});

    } else {
      finish(army);
    }
  };

  const update = () => {
    dispatch(updateListSettings({ name: armyName, pointsLimit: pointsLimit || 0 }));
    setOpen(false);
  };

  const selectChild = (child) => {
    console.log(child)
    router.replace({ query: { ...router.query, armyId: child.uid } }, null, { shallow: true });
    setSelectedChild(child.name);
  }

  const childItem = (child) => (
    <ListItem
      divider
      className="px-0"
      style={{ cursor: child.isLive ? "pointer" : "" }}
      onClick={() => child.isLive ? selectChild(child) : null}>
      <ListItemText
        style={{ color: !child.isLive ? "#999" : "" }}
        primary={child.name === army.data.name ? "None" : child.name} />
      <Radio
        disabled={!child.isLive}
        value={child}
        checked={selectedChild === child.name}
        onChange={() => child.isLive ? selectChild(child) : null} />
    </ListItem>
  );

  const close = () => {
    router.replace({ query: { ...router.query, armyId: null } }, null, { shallow: true });
    setOpen(false);
  }

  const rootArmy = army.childData && army.childData.find(c => c.name === army.data.name);

  return (
    <Dialog fullScreen open={open} onClose={close} TransitionComponent={Transition}>
      <AppBar position="static" elevation={0} color="transparent">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={close}
          >
            <ClearIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {army.data?.name || "New Army"}
          </Typography>
        </Toolbar>
      </AppBar>
      <div>
        <div className="mx-auto" style={{ maxWidth: "480px" }}>
          <div className="is-flex is-flex-direction-column p-4 mx-auto">
            <div className="mb-6">
              <ArmyImage name={army.data?.name} />
            </div>
            <TextField variant="filled" label="List Name" className="mb-4" value={armyName} onChange={(e) => setArmyName(e.target.value)} />
            <TextField variant="filled" label="Points Limit" type="number" className="mb-4" value={pointsLimit ?? ""} onChange={(e) => setPointsLimit(e.target.value ? parseInt(e.target.value) : null)} />
            {!isEdit && <FormGroup className="mb-0 is-flex-direction-row is-align-items-center">
              <FormControlLabel control={
                <Checkbox checked={autoSave} onClick={() => setAutoSave(!autoSave)} />
              } label="Auto Save List" />
            </FormGroup>}
            {
              !isEdit && army.childData && <>
                <h3 className="mt-4 mb-0" style={{ fontWeight: 600 }}>{factionRelation}</h3>
                <List className="pt-0">
                  {rootArmy && childItem(rootArmy)}
                  {army.childData.filter(c => c.name !== army.data.name).map((child, index) => (
                    <Fragment key={index}>
                      {childItem(child)}
                    </Fragment>
                  ))}
                </List>
              </>
            }
            {
              isEdit
                ? <Button className="mt-4" variant="contained" onClick={() => update()}>Save Changes</Button>
                : customArmies
                  ? <Button className="mt-4" variant="contained" onClick={() => create()}>Create List</Button>
                  : (
                    <div className="is-flex is-flex-direction-column is-align-items-center	">
                      <CircularProgress />
                      <p>Loading army data...</p>
                    </div>
                  )
            }
          </div>
        </div>
      </div>
    </Dialog>
  );
}