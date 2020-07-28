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
}
