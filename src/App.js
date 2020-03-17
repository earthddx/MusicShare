import React, {createContext, useContext, useReducer} from "react";
import Header from "./components/Header";
import AddSong from "./components/AddSong";
import SongList from "./components/SongList";
import SongPlayer from "./components/SongPlayer";
import { Grid, useMediaQuery } from "@material-ui/core";
import songReducer from './reducer'

export const SongContext = createContext({
  song: {
    id: "f8b52ae9-ebe9-4e73-a077-c875b86d8f4e",
    title: "Toxicity",
    artist: "System Of A Down",
    thumbnail: "http://img.youtube.com/vi/iywaBOMvYLI/0.jpg",
    url: "https://www.youtube.com/watch?v=iywaBOMvYLI",
    duration: 224
  },
  isPlaying: false
})

function App() {
  const initialSongState = useContext(SongContext)
  const [state, dispatch] = useReducer(songReducer, initialSongState)
  const greaterThanMd = useMediaQuery(theme => theme.breakpoints.up("md"));
  const greaterThanSm = useMediaQuery(theme => theme.breakpoints.up("sm"));

  return (
    <SongContext.Provider value={{state, dispatch}}>
      { greaterThanSm && <Header />}
      <Grid container spacing={3}>
        <Grid style={{ paddingTop: greaterThanSm ? 80 : 10}} item xs={12} md={7}>
          <AddSong />
          <SongList />
        </Grid>
        <Grid   
          item
          xs={12}
          md={5}
          style={
            greaterThanMd
              ? { position: "fixed", width: "100%", right: 0, top: 70 }
              : {
                  position: "fixed",
                  left: "0",
                  bottom: "0",
                  width: "100%"
                }
          }
        >
          <SongPlayer />
        </Grid>
      </Grid>
    </SongContext.Provider>
  );
}

export default App;
