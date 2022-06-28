import { List, Paper, Typography, ListItem, ListItemText } from "@mui/material";

export default function FtlFaction({ name }) {
  return (
    <>
      <Typography className="my-2" fontWeight={600}>
        Selected Faction
      </Typography>
      <Paper sx={{ background: "rgba(33, 33, 33, 0.08)" }} elevation={0}>
        <List>
          <ListItem>
            <ListItemText primary={name} />
          </ListItem>
        </List>
      </Paper>
    </>
  );
};