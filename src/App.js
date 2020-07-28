import React, { createContext, useContext, useReducer } from "react";
import { Grid, useMediaQuery } from "@material-ui/core";
import { useQuery } from "@apollo/react-hooks";

import Header from "./components/Header";
import SongList from "./components/SongList";
import QueudSongList from "./components/QueuedSongList";
import songReducer from "./reducer";
import { GET_QUEUED_SONGS } from "./graphql/queries";

export const SongContext = createContext({
  song: {
    artist: "",
    title: "",
    duration: 0,
    id: "",
    thumbnail: "",
    url: "",
  },
  isPlaying: false,
});

function App() {
  const { data } = useQuery(GET_QUEUED_SONGS);
  const context = useContext(SongContext);
  const [state, dispatch] = useReducer(songReducer, context);
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));

  return (
    <SongContext.Provider value={{ state, dispatch }}>
      <Header />
      <Grid container>
        {greaterThanMd && (
          <Grid
            item
            md={3}
            style={{
              paddingTop: 80,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <QueudSongList queue={data.queue} />
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sm={12}
          md={6}
          style={{
            paddingTop: 100,

          }}
        >
          <SongList queue={data.queue} />
        </Grid>
        <Grid item md={3} />
      </Grid>
    </SongContext.Provider>
  );
}

export default App;
