import React, { useState, useEffect } from "react";
import { TextField, Button, makeStyles } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ReactPlayer from "react-player/youtube";

import AddSongDialog from "./AddSongDialog";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    alignItems: "center",
  },
  urlInput: {
    margin: theme.spacing(2),
  },
  textInput: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightLight,
  },
  addSongButton: {
    margin: theme.spacing(0),
  },
  dialog: {
    textAlign: "center",
    backdropFilter: "blur(5px)",
  },
  thumbnail: {
    width: "100%",
  },
}));

export default function AddSong() {
  const [dialog, setDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [playable, setPlayable] = useState(false);
  const [song, setSong] = useState({
    duration: 0,
    title: "",
    artist: "",
    thumbnail: "",
  });
  const classes = useStyles();

  useEffect(() => {
    const isPlayable = ReactPlayer.canPlay(url);
    setPlayable(isPlayable);
  }, [url]);

  const handleEditSong = ({ player }) => {
    const nestedPlayer = player.player.player;
    let songData;
    songData = getYouTubeInfo(nestedPlayer);
    setSong({
      ...songData,
      url,
    });
  };

  const getYouTubeInfo = (player) => {
    const duration = player.getDuration();
    const { title, video_id, author } = player.getVideoData();
    const thumbnail = `https://img.youtube.com/vi/${video_id}/0.jpg`;
    return {
      duration,
      title,
      artist: author,
      thumbnail,
    };
  };

  return (
    <div className={classes.container}>
      <AddSongDialog
        url={url}
        setUrl={setUrl}
        setDialog={setDialog}
        dialog={dialog}
        song={song}
        setSong={setSong}
      />
      <TextField
        fullWidth
        margin="normal"
        size="small"
        id="filled-basic"
        label="Add"
        variant="filled"
        type="url"
        className={classes.urlInput}
        InputProps={{
          classes: {
            input: classes.textInput,
          },
        }}
        onChange={(e) => setUrl(e.target.value)}
        value={url}
      />
      <Button
        variant="outlined"
        size="large"
        onClick={() => setDialog(true)}
        className={classes.addSongButton}
        disabled={!playable}
      >
        <AddIcon />
      </Button>
      <ReactPlayer url={url} hidden onReady={handleEditSong} />
    </div>
  );
}
