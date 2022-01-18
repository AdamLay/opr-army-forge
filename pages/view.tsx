import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import { RootState } from '../data/store'
import { useRouter } from "next/router";
import ViewCards from "../views/ViewCards";
import ViewList from "../views/ViewList";
import { AppBar, Button, IconButton, Paper, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Switch, ListItemButton, Divider } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UpgradeService from "../services/UpgradeService";
import ClearIcon from "@mui/icons-material/Clear";

export default function View() {

  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);
  const router = useRouter();

  const [isCardView, setCardView] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPsychic, setShowPsychic] = useState(listContainsPyschic(list));
  const [showOrgChart, setShowOrgChart] = useState(false);
  const [showFullRules, setShowFullRules] = useState(false);
  const [showRulesSummary, setShowRulesSummary] = useState(true);
  const [showPointCosts, setShowPointCosts] = useState(true);
  const [combineIdentical, setCombineIdentical] = useState(true);

  return (
    <>
      {/* <Head>
        <title>OPR Army Forge</title>
        <link rel="icon" href="/favicon.ico" />
      </Head> */}
      <Paper elevation={2} color="primary" square>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => router.back()}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {list.name} • {list.points}pts
            </Typography>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Paper>
      <Drawer anchor="right" open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <div className="is-flex p-4">
          <h3 className="is-size-4" style={{ flex: 1 }}>Display Settings</h3>
          <IconButton onClick={() => setSettingsOpen(false)}>
            <ClearIcon />
          </IconButton>
        </div>
        <List sx={{minWidth: "18rem"}}>
          <ListItem sx={{marginTop: "-0.5rem"}}>
            <ListItemText sx={{textAlign: "start"}}>Display Mode</ListItemText>
            <Button onClick={() => setCardView(!isCardView)} sx={{placeContent: "end"}}>
              <span>{isCardView ? "Card View" : "List View"}&nbsp;</span>
              {isCardView ? <DashboardIcon /> : <ViewAgendaIcon />}
            </Button>
          </ListItem>
          <Divider />
          {isCardView && <>
            <ListItem>
              <ListItemText>Combine Identical Units</ListItemText>
              <Switch edge="end" checked={combineIdentical} onChange={() => setCombineIdentical(!combineIdentical)} disabled={!isCardView} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText>Show point costs</ListItemText>
              <Switch edge="end" checked={showPointCosts} onChange={() => setShowPointCosts(!showPointCosts)} disabled={!isCardView} />
            </ListItem>
            <ListItem>
              <ListItemText>Show full special rules text</ListItemText>
              <Switch edge="end" checked={showFullRules} onChange={() => setShowFullRules(!showFullRules)} disabled={!isCardView} />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText>Show Rules Summary</ListItemText>
              <Switch edge="end" checked={showRulesSummary} onChange={() => setShowRulesSummary(!showRulesSummary)} disabled={!isCardView || showFullRules} />
            </ListItem>
            <ListItem>
              <ListItemText>Show Organisation Chart</ListItemText>
              <Switch edge="end" checked={showOrgChart} onChange={() => setShowOrgChart(!showOrgChart)} disabled={!isCardView} />
            </ListItem>
          </>}
          <ListItem>
            <ListItemText>Show Psychic Spells</ListItemText>
            <Switch edge="end" checked={showPsychic} onChange={() => setShowPsychic(!showPsychic)} />
          </ListItem>
        </List>
      </Drawer>
      {/*
      <div className="is-flex px-4 py-2 no-print" style={{ alignItems: "center" }}>
        <div className="is-flex-grow-1"></div>
        <Button onClick={() => setCardView(!isCardView)}>
          {isCardView ? <DashboardIcon /> : <ViewAgendaIcon />}
          <span className="pl-1 full-compact-text">{isCardView ? "cards" : "list"}</span>
        </Button>
      </div>
      */}
      <div className="px-4">
        {
          isCardView
            ? <ViewCards showPsychic={showPsychic} showFullRules={showFullRules} showRulesSummary={showRulesSummary} showPointCosts={showPointCosts} showOrgChart={showOrgChart} combineIdentical={combineIdentical} />
            : <ViewList showPsychic={showPsychic} showFullRules={showFullRules} showPointCosts={showPointCosts} />
        }
      </div>
    </>
  );
}


// TODO: extract these as global helper functions
function listContainsPyschic(list) {
  // TODO: get the special rule def from a well known location
  return listContainsSpecialRule(list, { key: 'psychic', name: 'Psychic', rating: '1' })
}

function listContainsSpecialRule(list, specialRule) {
  return list.units.some(({ specialRules }) => Boolean(specialRules.find(({ name }) => name === specialRule.name)));
}
