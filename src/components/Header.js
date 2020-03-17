import React from "react";
import { AppBar, Toolbar, Typography, makeStyles } from "@material-ui/core";
import MusicNoteIcon from '@material-ui/icons/MusicNote';

const useStyles = makeStyles(theme => ({
    title: {
        marginLeft: theme.spacing(2)
    }
}))

export default function Header() {
    const classes = useStyles()
  return (
    <AppBar color="primary" position="fixed">
      <Toolbar>
        <MusicNoteIcon />
          <Typography className={classes.title} variant="h6" component="h1">
            Music Share
          </Typography>
      </Toolbar>
    </AppBar>
  );
}
