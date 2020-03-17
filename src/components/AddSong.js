import React, { useState, useEffect} from "react";
import { useMutation } from '@apollo/react-hooks';
import {
  TextField,
  InputAdornment,
  Button,
  DialogContent,
  Dialog,
  DialogTitle,
  DialogActions,
  makeStyles
} from "@material-ui/core";
import { Link, AddBoxOutlined } from "@material-ui/icons";
import SoundcloudPlayer from "react-player/lib/players/SoundCloud";
import YoutubePlayer from "react-player/lib/players/YouTube";
import ReactPlayer from "react-player";
import { ADD_SONG } from "../graphql/mutations";

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "center"
  },
  urlInput: {
    margin: theme.spacing(1)
  },
  addSongButton: {
    margin: theme.spacing(1)
  },
  dialog: {
    textAlign: "center"
  },
  thumbnail: {
    width: "90%"
  }
}));

const DEFAULT_SONG = {
  duration: 0,
  title: "",
  artist: "",
  thumbnail: ""
}

export default function AddSong() {
  const classes = useStyles();
  const [addSong, { error }] = useMutation(ADD_SONG);
  const [url, setUrl] = useState("");
  const [playable, setPlayable] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [song, setSong] = useState(DEFAULT_SONG);

  useEffect(() => {
    const isPlayable =
      SoundcloudPlayer.canPlay(url) || YoutubePlayer.canPlay(url);
    setPlayable(isPlayable);
  }, [url]);

  function handleChangeSong(event) {
    const { name, value } = event.target;
    setSong(prevSong => ({
      ...prevSong,
      [name]: value
    }));
  }

  function handleSetDialog() {
    setDialog(false);
  }

  async function handleEditSong({ player }) {
    const nestedPlayer = player.player.player;
    let songData;
    if (nestedPlayer.getVideoData) {
      songData = getYoutubeInfo(nestedPlayer);
    } else if (nestedPlayer.getCurrentSound) {
      songData = await getSoundcloudInfo(nestedPlayer);
    }
    setSong({ ...songData, url });
  }

  async function handleAddSong() {
    try {
      const { url, thumbnail, duration, title, artist } = song;
      await addSong({
        variables: {
          url: url.length > 0 ? url : null,
          thumbnail: thumbnail.length > 0 ? thumbnail : null,
          duration: duration > 0 ? duration : null,
          title: title.length > 0 ? title : null,
          artist: artist.length > 0 ? artist : null
        }
      });
      handleSetDialog()
      setSong(DEFAULT_SONG)
      setUrl('')
    } catch (error) {
      console.error("Error adding song", error)
    }
  }

  function getYoutubeInfo(player) {
    const duration = player.getDuration();
    const { title, video_id, author } = player.getVideoData();
    const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;
    return {
      duration,
      title,
      artist: author,
      thumbnail
    };
  }

  function getSoundcloudInfo(player) {
    return new Promise(resolve => {
      player.getCurrentSound(songData => {
        if (songData) {
          resolve({
            duration: Number(songData.duration / 1000),
            title: songData.title,
            artist: songData.user.username,
            thumbnail: songData.artwork_url.replace("-large", "-t500x500")
          });
        }
      });
    });
  }

function handleInputError(field){
  return error && error.graphQLErrors[0].extensions.path.includes(field)//only if theres an error
}

  const { thumbnail, title, artist } = song;

  return (
    <div className={classes.container}>
      <Dialog
        className={classes.dialog}
        open={dialog}
        onClose={handleSetDialog}
      >
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <img
            className={classes.thumbnail}
            src={thumbnail}
            alt="Song thumbnail"
          />
          <TextField
            value={title}
            onChange={handleChangeSong}
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            error={handleInputError('title')}//check if theres an error (empy string)
            helperText={handleInputError('title') && 'Fill out field'}
          />
          <TextField
            value={artist}
            onChange={handleChangeSong}
            margin="dense"
            name="artist"
            label="Artist"
            fullWidth
            error={handleInputError('artist')}
            helperText={handleInputError('artist') && 'Fill out field'}
          />
          <TextField
            value={thumbnail}
            onChange={handleChangeSong}
            margin="dense"
            name="thumbnail"
            label="Thumbnail"
            fullWidth
            error={handleInputError('thumbnail')}
            helperText={handleInputError('thumbnail') && 'Fill out field'}
          />
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={handleSetDialog}>
            Cancel
          </Button>
          <Button onClick={handleAddSong} color="primary" variant="outlined">
            Add Song
          </Button>
        </DialogActions>
      </Dialog>
      <TextField
        className={classes.urlInput}
        onChange={event => setUrl(event.target.value)}
        value={url}
        placeholder="Add YouTube or SoundCloud Url"
        fullWidth
        margin="normal"
        type="url"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Link />
            </InputAdornment>
          )
        }}
      />
      <Button
        disabled={!playable}
        className={classes.addSongButton}
        onClick={() => setDialog(true)}
        variant="contained"
        color="primary"
        endIcon={<AddBoxOutlined />}
      >
        Add
      </Button>
      <ReactPlayer url={url} hidden={true} onReady={handleEditSong} />
    </div>
  );
}
