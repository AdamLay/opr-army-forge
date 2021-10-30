import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux'
import { RootState } from '../data/store'
import { useRouter } from "next/router";
import ViewCards from "../views/ViewCards";
import ViewList from "../views/ViewList";
import { AppBar, Button, IconButton, Paper, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Switch } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UpgradeService from "../services/UpgradeService";


export default function View() {

  const list = useSelector((state: RootState) => state.list);
  const army = useSelector((state: RootState) => state.army);
  const router = useRouter();

  const [isCardView, setCardView] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showPsychic, setShowPsychic] = useState(listContainsPyschic(list));
  const [showFullRules, setShowFullRules] = useState(true);

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
        <h3 className="is-size-4 p-4">Display Settings</h3>
        <List>
          <ListItem>
            <ListItemText>Show Psychic Spells</ListItemText>
            <Switch edge="end" checked={showPsychic} onChange={() => setShowPsychic(!showPsychic)} />
          </ListItem>
          <ListItem>
            <ListItemText>Show full special rules text</ListItemText>
            <Switch edge="end" checked={showFullRules} onChange={() => setShowFullRules(!showFullRules)} />
          </ListItem>
        </List>
      </Drawer>
      <div id="view-selector" className="is-flex px-4 py-2" style={{ alignItems: "center" }}>
        <div className="is-flex-grow-1"></div>
        <Button onClick={() => setCardView(!isCardView)}>
          {isCardView ? <DashboardIcon /> : <ViewAgendaIcon />}
          <span className="pl-1 full-compact-text">{isCardView ? "cards" : "list"}</span>
        </Button>
      </div>
      <div className="px-4">
        {
          isCardView
            ? <ViewCards showPsychic={showPsychic} showFullRules={showFullRules} />
            : <ViewList showPsychic={showPsychic} showFullRules={showFullRules} />
        }
      </div>
    </>
  );
}


// TODO: extract these as global helper functions
function listContainsPyschic(list) {
  // TODO: get the special rule def from a well known location
  return listContainsSpecialRule(list, {key: 'psychic', name: 'Psychic', rating: '1'})
}

function listContainsSpecialRule(list, specialRule) {
  return list.units.some(({specialRules}) => Boolean(specialRules.find(({name}) => name === specialRule.name)));
}
