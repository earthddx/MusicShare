import React, { useState, useEffect, useContext } from "react";
import {
  CardMedia,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { PlayArrow, Queue, Cancel, Pause, Check } from "@material-ui/icons";
import { useMutation } from "@apollo/react-hooks";
import UseAnimations from "react-useanimations";
import activity from "react-useanimations/lib/activity";

import { ADD_OR_REMOVE_SONG_FROM_QUEUE } from "../graphql/mutations";
import { SongContext } from "../App";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
    position: "relative",
  },
  songInfoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  songInfo: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  deleteSong: {
    position: "absolute",
    right: 2,
    top: 2,
    opacity: 0,
    transitionDuration: ".5s",
    "&:hover": {
      opacity: 1,
      borderRadius: 30,
      backgroundColor: "rgba(0,0,0,.75)",
    },
  },
  typography: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeightMedium,
    width: 230,
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },

  thumbnail: {
    objectFit: "cover",
    width: "100%",
    height: 180,
  },
}));

export default function Song({ song, handleDeleteSong, queue }) {
  const classes = useStyles();
  const { artist, title, thumbnail } = song;
  const { state, dispatch } = useContext(SongContext);
  const [currSongPlaying, setCurrSongPlaying] = useState(false);
  const [currSongInQueue, setCurrSongInQueue] = useState(false);
  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_SONG_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  useEffect(() => {
    const isSongPlaying = state.isPlaying && song.id === state.song.id;
    setCurrSongPlaying(isSongPlaying);
    const isSongInQueue = queue.some((item) => item.id === song.id);
    setCurrSongInQueue(isSongInQueue);
  }, [song.id, state.song.id, state.isPlaying, queue]);

  const handleTogglePlay = () => {
    dispatch({ type: "SET_SONG", payload: { song } });
    dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
  };

  const handleAddToQueue = () => {
    addOrRemoveFromQueue({
      variables: { input: { ...song, __typename: "Song" } },
    });
  };

  return (
    <Card className={classes.container}>
      <div className={classes.songInfoContainer}>
        <div className={classes.deleteSong}>
          <Tooltip title="Delete song">
            <IconButton onClick={() => handleDeleteSong(song.id)}>
              <Cancel style={{ fontSize: 30 }} color="primary" />
            </IconButton>
          </Tooltip>
        </div>
        <div style={{ width: "100%", height: "100%" }}>
          {currSongPlaying || song.id === state.song.id ? (
            <div
              style={{
                position: "absolute",
                backgroundColor: "rgba(0,0,0,.8)",
                width: "100%",
                height: 180,
              }}
            >
              <Typography
                style={{
                  position: "absolute",
                  top: "15%",
                  left: "50%",
                  transform: "translate(-50%, 0%)",
                }}
                variant="h5"
                color="primary"
              >
                <UseAnimations
                  animation={activity}
                  size={136}
                  strokeColor="white"
                />
              </Typography>
            </div>
          ) : null}
          <CardMedia image={thumbnail} className={classes.thumbnail} />
        </div>
        <div className={classes.songInfo}>
          <CardContent className={classes.typography}>
            <Tooltip title={title}>
              <Typography gutterBottom variant="body1" component="h6">
                {title}
              </Typography>
            </Tooltip>
            <Tooltip title={artist}>
              <Typography variant="body1" component="h6" color="textSecondary">
                {artist}
              </Typography>
            </Tooltip>
          </CardContent>
          <CardActions>
            <IconButton size="small" color="primary" onClick={handleTogglePlay}>
              {currSongPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <Tooltip title={currSongInQueue ? "Added" : "Add to queue"}>
              <span>
                {currSongInQueue ? (
                  <IconButton size="small" color="secondary" disabled>
                    <Check />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={handleAddToQueue}
                  >
                    <Queue />
                  </IconButton>
                )}
              </span>
            </Tooltip>
          </CardActions>
        </div>
      </div>
    </Card>
  );
}
