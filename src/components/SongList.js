import React, { useState, useContext, useEffect } from "react";
import {
  CircularProgress,
  CardContent,
  Typography,
  Card,
  CardMedia,
  IconButton,
  CardActions,
  makeStyles
} from "@material-ui/core";
import { Save, PlayArrow, Pause } from "@material-ui/icons";
import { useSubscription, useMutation } from "@apollo/react-hooks";
import { GET_SONGS } from "../graphql/subscriptions";
import { SongContext } from "../App";
import { ADD_OR_REMOVE_FROM_QUEUE } from '../graphql/mutations'

export default function SongList() {
  const { data, loading, error } = useSubscription(GET_SONGS);

  // const song = {
  //   title: "Calima",
  //   artist: "Jonas Saalbach",
  //   thumbnail: "https://i1.sndcdn.com/artworks-000491934594-vdelh2-t500x500.jpg"
  // };

  const useStyles = makeStyles(theme => ({
    container: {
      margin: theme.spacing(1)
    },
    songInfoContainer: {
      display: "flex",
      alignItems: "center"
    },
    songInfo: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between"
    },
    thumbnail: {
      objectFit: "cover",
      width: 140,
      height: 140
    }
  }));
  function Song({ song }) {
    const { thumbnail, title, artist } = song;
    const { state, dispatch } = useContext(SongContext);
    const [currentSongPlaying, setCurrentSongPlaying] = useState(false);
    const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
      onCompleted: data => { //save data to local storage so the queue is persistent
        localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
      }
    });
    const classes = useStyles();

    useEffect(() => {
      const isThisSongPlaying = state.isPlaying && song.id === state.song.id;
      setCurrentSongPlaying(isThisSongPlaying);
    }, [song.id, state.song.id, state.isPlaying]);

    function handleTogglePlay() {
      dispatch({ type: "SET_SONG", payload: { song } });
      dispatch(
        state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" }
      );
    }

    function handleAddOrRemoveFromQueue() {
      addOrRemoveFromQueue({
        variables: { input: { ...song, __typename: "Song"}}
      });
    }

    return (
      <Card className={classes.container} >
        <div className={classes.songInfoContainer}>
          <CardMedia className={classes.thumbnail} image={thumbnail} />
          <div className={classes.songInfo}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {title}
              </Typography>
              <Typography variant="body1" component="p" color="textSecondary">
                {artist}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton
                onClick={handleTogglePlay}
                size="small"
                color="primary"
              >
                {currentSongPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton
                onClick={handleAddOrRemoveFromQueue}
                size="small"
                color="secondary"
              >
                <Save />
              </IconButton>
            </CardActions>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "50"
        }}
      >
        <CircularProgress />
      </div>
    );
  }
  if (error) return <div>Error fetching songs</div>;
  return (
    <div>
      {data.songs.map(song => (
        <Song key={song.id} song={song} />
      ))}
    </div>
  );
}
