import React, { useState, useContext, useRef, useEffect } from "react";
import QueuedSongList from "./QueuedSongList";
import {
  CardContent,
  Typography,
  IconButton,
  Card,
  Slider,
  CardMedia,
  makeStyles
} from "@material-ui/core";
import { SkipPrevious, PlayArrow, SkipNext, Pause } from "@material-ui/icons";
import { SongContext } from "../App";
import { useQuery } from "@apollo/react-hooks";
import { GET_QUEUED_SONGS } from "../graphql/queries";
import ReactPlayer from "react-player";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    justifyContent: "space-between"
  },
  details: {
    display: "flex",
    flexDirection: "column",
    padding: "0px 15px"
  },
  content: {
    flex: "1 0 auto"
  },
  thumbnail: {
    width: 150
  },
  controls: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  playIcon: {
    height: 40,
    width: 40
  }
}));

export default function SongPlayer() {
  const { data } = useQuery(GET_QUEUED_SONGS);
  const reactPlayerRef = useRef(); //after user is done seeking thru the song adjust react player to the users position
  const { state, dispatch } = useContext(SongContext);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0); //duration
  const [seeking, setSeeking] = useState(false); //user's seeking song
  const [posInQueue, setPosInQueue] = useState(0);
  const classes = useStyles();

  useEffect(() => {
    //find the index of the current song
    const songIndex = data.queuedSongs.findIndex(
      song => song.id === state.song.id
    );
    //if its not found, return -1
    setPosInQueue(songIndex);
  }, [data.queuedSongs, state.song.id]);

  useEffect(() => {
    //jump on to next song in queue
    const nextSong = data.queuedSongs[posInQueue + 1];
    if (played >= 0.99 && nextSong) {//because step is .01 compare not to ===1 but step slightly less than 1
      //if at the end of the current song and not the end of the queue list
      setPlayed(0);
      dispatch({ type: "SET_SONG", payload: { song: nextSong } }); //play next song
    }
  }, [data.queuedSongs, played, dispatch, posInQueue]);

  function handleTogglePlay() {
    dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
  }

  function handleSliderChange(event, newValue) {
    setPlayed(newValue);
  }

  function handleSeekMouseDown() {
    setSeeking(true);
  }

  function handleSeekMouseUp() {
    setSeeking(false);
    reactPlayerRef.current.seekTo(played); //jump to position that user seeked
  }

  function formatDuration(seconds) {
    //change duration format to hh:mm:ss
    return new Date(seconds * 1000).toISOString().substr(11, 8);
  }

  function handlePlayNextSong() {
    const nextSong = data.queuedSongs[posInQueue + 1];
    if (nextSong) {
      dispatch({ type: "SET_SONG", payload: { song: nextSong } });
    }
  }

  function handlePlayPrevSong() {
    const prevSong = data.queuedSongs[posInQueue - 1];
    if (prevSong) {
      dispatch({ type: "SET_SONG", payload: { song: prevSong } });
    }
  }

  return (
    <>
      <Card variant="outlined" className={classes.container}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="h5" component="h3">
              {state.song.title}
            </Typography>
            <Typography variant="subtitle1" component="p" color="textSecondary">
              {state.song.artist}
            </Typography>
          </CardContent>
          <div className={classes.controls}>
            <IconButton onClick={handlePlayPrevSong}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={handleTogglePlay}>
              {state.isPlaying ? (
                <Pause className={classes.playIcon} />
              ) : (
                <PlayArrow className={classes.playIcon} />
              )}
            </IconButton>
            <IconButton onClick={handlePlayNextSong}>
              <SkipNext />
            </IconButton>
            <Typography variant="subtitle1" component="p" color="textSecondary">
            {formatDuration(playedSeconds)}
            {` / `}{formatDuration(state.song.duration)}
            </Typography>
          </div>
          <Slider
            onMouseDown={handleSeekMouseDown}
            onMouseUp={handleSeekMouseUp}
            onChange={handleSliderChange}
            value={played}
            type="range"
            min={0}
            max={1}
            step={0.01}
          />
        </div>
        <ReactPlayer
          ref={reactPlayerRef}
          onProgress={({ played, playedSeconds }) => {
            if (!seeking) {
              setPlayed(played); //slider auto move on song's progress
              setPlayedSeconds(playedSeconds); //update durtation progress
            }
          }}
          hidden={true}
          url={state.song.url}
          playing={state.isPlaying}
        />
        <CardMedia className={classes.thumbnail} image={state.song.thumbnail} />
      </Card>
      <QueuedSongList queue={data.queuedSongs} />
    </>
  );
}
