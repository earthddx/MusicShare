import React from "react";
import { Grid, CircularProgress } from "@material-ui/core";

import { useSubscription, useMutation } from "@apollo/react-hooks";

import { GET_SONGS } from "../graphql/subscriptions";
import { DELETE_SONG } from "../graphql/mutations";

import Song from "./Song";


export default function SongList({ queue }) {
  const { data, loading, error } = useSubscription(GET_SONGS);
  const [deleteSong] = useMutation(DELETE_SONG);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 250,
        }}
      >
        <CircularProgress size="10rem" />
      </div>
    );
  }

  if (error) {
    return <div>Error fetching songs </div>;
  }

  const handleDeleteSong = (id) => {
    if (window.confirm("⚠️ Are you sure you want to delete song?")) {
      deleteSong({
        variables: { id },
      });
    }
  };

  return (
    <div>
      <Grid container spacing={0}>
        {data.songs.map((song) => (
          <Grid item md={4} key={song.id}>
            <Song
              song={song}
              handleDeleteSong={handleDeleteSong}
              queue={queue}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );

  // function Song({ song }) {
  //   const { artist, title, thumbnail } = song;
  //   const { state, dispatch } = useContext(SongContext);
  //   const [currSongPlaying, setCurrSongPlaying] = useState(false);
  //   const [currSongInQueue, setCurrSongInQueue] = useState(false);
  //   const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_SONG_FROM_QUEUE, {
  //     onCompleted: (data) => {
  //       localStorage.setItem(
  //         "queue",
  //         JSON.stringify(data.addOrRemoveFromQueue)
  //       );
  //     },
  //   });

  //   useEffect(() => {
  //     const isSongPlaying = state.isPlaying && song.id === state.song.id;
  //     setCurrSongPlaying(isSongPlaying);
  //     const isSongInQueue = queue.some((item) => item.id === song.id);
  //     setCurrSongInQueue(isSongInQueue);
  //   }, [song.id, state.song.id, state.isPlaying]);

  //   const handleTogglePlay = () => {
  //     dispatch({ type: "SET_SONG", payload: { song } });
  //     dispatch(
  //       state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" }
  //     );
  //   };

  //   const handleAddToQueue = () => {
  //     addOrRemoveFromQueue({
  //       variables: { input: { ...song, __typename: "Song" } },
  //     });
  //   };

  //   return (
  //     <Card className={classes.container}>
  //       <div className={classes.songInfoContainer}>
  //         <div className={classes.deleteSong}>
  //           <Tooltip title="Delete song">
  //             <IconButton onClick={() => handleDeleteSong(song.id)}>
  //               <Cancel style={{ fontSize: 30 }} color="primary" />
  //             </IconButton>
  //           </Tooltip>
  //         </div>
  //         <CardMedia image={thumbnail} className={classes.thumbnail} />
  //         <div className={classes.songInfo}>
  //           <CardContent className={classes.typography}>
  //             <Typography gutterBottom variant="body1" component="h6">
  //               {title}
  //             </Typography>
  //             <Typography variant="body1" component="h6" color="textSecondary">
  //               {artist}
  //             </Typography>
  //           </CardContent>
  //           <CardActions>
  //             <IconButton
  //               size="small"
  //               color="primary"
  //               onClick={handleTogglePlay}
  //             >
  //               {currSongPlaying ? <Pause /> : <PlayArrow />}
  //             </IconButton>
  //             <Tooltip title={currSongInQueue ? "Added" : "Add to queue"}>
  //               <span>
  //                 {currSongInQueue ? (
  //                   <IconButton size="small" color="secondary" disabled>
  //                     <Check />
  //                   </IconButton>
  //                 ) : (
  //                   <IconButton
  //                     size="small"
  //                     color="secondary"
  //                     onClick={handleAddToQueue}
  //                   >
  //                     <Queue />
  //                   </IconButton>
  //                 )}
  //               </span>
  //             </Tooltip>
  //           </CardActions>
  //         </div>
  //       </div>
  //     </Card>
  //   );
  // }
}
