import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  Grid,
  useMediaQuery,
} from "@material-ui/core";
import { YouTube } from "@material-ui/icons/";

import AddSong from "./AddSong";
import SongPlayer from "./SongPlayer";

const useStyles = makeStyles((theme) => ({
  songPlayer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
  },
  title: {
    marginLeft: theme.spacing(1),
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
  },
}));

export default function Header() {
  const classes = useStyles();
  const greaterThanSm = useMediaQuery((theme) => theme.breakpoints.up("sm"));

  return (
    <AppBar position="fixed" color="secondary">
      <Grid container spacing={1}>
        {greaterThanSm && (
          <Grid item md={4}>
            <Toolbar>
              <YouTube style={{ fontSize: 40 }} color="primary" />
              <Typography variant="h5" component="h1" className={classes.title}>
                YouTube Music Share
              </Typography>
            </Toolbar>
          </Grid>
        )}
        <Grid item md={4}>
          <AddSong />
        </Grid>
        <Grid item md={4} className={classes.songPlayer}>
          <SongPlayer/>
        </Grid>
      </Grid>
    </AppBar>
  );
}
