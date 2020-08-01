import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Typography,
  IconButton,
  Slider,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import {
  SkipPrevious,
  SkipNext,
  PlayArrow,
  Pause,
  VideoLabel,
  RepeatOne,
} from "@material-ui/icons";
import ReactPlayer from "react-player";
import { useQuery } from "@apollo/react-hooks";

import { SongContext } from "../App";
import { GET_QUEUED_SONGS } from "../graphql/queries";

const useStyles = makeStyles((theme) => ({
  songPlayer: {},
}));

export default function SongPlayer() {
  const { data } = useQuery(GET_QUEUED_SONGS);
  const { state, dispatch } = useContext(SongContext);
  const [volume, setVolume] = useState(1);
  const [repeatSong, setRepeatSong] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  const [positionInQueue, setPositionInQueue] = useState(0);
  const [toggleVideo, setToggleVideo] = useState(true);
  const reactPlayerRef = useRef();
  const classes = useStyles();

  useEffect(() => {
    const songIndex = data.queue.findIndex((song) => song.id === state.song.id);
    setPositionInQueue(songIndex);
  }, [state.song.id, data.queue]);

  useEffect(() => {
    const nextSong = data.queue[positionInQueue + 1];
    if (played >= 0.99 && nextSong && repeatSong === false) {
      setPlayed(0);
      dispatch({ type: "SET_SONG", payload: { song: nextSong } });
    }
  }, [data.queue, played, dispatch, positionInQueue, repeatSong]);

  const handleTogglePlay = () => {
    dispatch(state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
  };

  const handleSliderProgressChange = (e, newValue) => {
    setPlayed(newValue);
  };

  const handleSeekMouseDown = () => {
    setIsUserSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setIsUserSeeking(false);
    reactPlayerRef.current.seekTo(played);
  };

  const formatDuration = (seconds) => {
    const result = state.song.duration / 60;
    if (result >= 60) {
      if (result >= 600)
        return new Date(seconds * 1000).toISOString().substr(11, 8); // HH:MM:SS
      return new Date(seconds * 1000).toISOString().substr(12, 7); // H:MM:SS
    }
    return new Date(seconds * 1000).toISOString().substr(14, 5); // MM:SS
  };

  const handlePlayPrevSong = () => {
    const prevSong = data.queue[positionInQueue - 1];
    if (prevSong) {
      dispatch({ type: "SET_SONG", payload: { song: prevSong } });
    }
  };

  const handlePlayNextSong = () => {
    const nextSong = data.queue[positionInQueue + 1];
    if (nextSong) {
      dispatch({ type: "SET_SONG", payload: { song: nextSong } });
    }
  };

  function handleToggleVideo() {
    setToggleVideo(!toggleVideo);
  }

  const handleVolume = (event, newValue) => {
    setVolume(newValue);
  };

  const handleRepeatSong = () => {
    setRepeatSong(!repeatSong);
  };

  return (
    state.song.title &&
    state.song.artist && (
      <div style={{ display: "flex" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>
              <Tooltip title={state.song.title}>
                <Typography variant="body1" component="h3" color="primary">
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      width: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: 600,
                    }}
                  >
                    {state.song.title}
                  </div>
                </Typography>
              </Tooltip>
              <Tooltip title={state.song.artist}>
                <Typography variant="body1" component="h3">
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      width: 100,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {state.song.artist}
                  </div>
                </Typography>
              </Tooltip>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <IconButton onClick={handlePlayPrevSong}>
                  <SkipPrevious />
                </IconButton>
                <IconButton onClick={handleTogglePlay}>
                  {state.isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton onClick={handlePlayNextSong}>
                  <SkipNext />
                </IconButton>
              </div>
              <Tooltip title="Repeat song">
                <IconButton onClick={handleRepeatSong}>
                  <RepeatOne color={repeatSong ? "primary" : "inherit"} />
                </IconButton>
              </Tooltip>
              <Tooltip title={toggleVideo ? "Show Video" : "Close Video"}>
                <IconButton onClick={handleToggleVideo}>
                  <VideoLabel color={toggleVideo ? "inherit" : "primary"} />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="caption"
              component="h6"
              style={{ marginRight: 10 }}
            >
              {formatDuration(playedSeconds)}
            </Typography>
            <Slider
              value={played}
              type="range"
              min={0}
              max={1}
              step={0.01}
              onChange={handleSliderProgressChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
            />
            <Typography
              variant="caption"
              component="h6"
              style={{ marginLeft: 10 }}
            >
              {formatDuration(state.song.duration)}
            </Typography>
          </div>

          <div
            hidden={toggleVideo}
            style={{
              position: "absolute",
              right: 50,
              marginTop: 40,
            }}
          >
            <div
              style={{
                width: "20vw",
                height: "11.5vw",
                pointerEvents: "none",
              }}
            >
              <ReactPlayer
                width="100%"
                height="100%"
                loop={repeatSong}
                url={state.song.url}
                playing={state.isPlaying}
                volume={volume}
                onProgress={({ played, playedSeconds }) => {
                  if (!isUserSeeking) {
                    setPlayed(played);
                    setPlayedSeconds(playedSeconds);
                  }
                }}
                ref={reactPlayerRef}
                className={classes.songPlayer}
              />
            </div>
          </div>
        </div>
        <div style={{ height: 50, marginTop: 20 }}>
          <Slider
            orientation="vertical"
            value={volume}
            type="range"
            min={0}
            max={1}
            step={0.01}
            onChange={handleVolume}
          />
        </div>
      </div>
    )
  );
}
