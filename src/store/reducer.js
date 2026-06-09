const videoReducer = (state, action) => {
  switch (action.type) {
    case "PLAY_VIDEO": {
      return { ...state, isPlaying: true };
    }
    case "PAUSE_VIDEO": {
      return { ...state, isPlaying: false };
    }
    case "SET_VIDEO": {
      return { ...state, video: action.payload.video, duration: 0 };
    }
    case "SET_DURATION": {
      return { ...state, duration: action.payload.duration };
    }
    case "SET_PLAYED_SECONDS": {
      return { ...state, playedSeconds: action.payload.playedSeconds };
    }
    case "EXPAND_VIDEO": {
      return { ...state, isVideoExpanded: true };
    }
    case "COLLAPSE_VIDEO": {
      return { ...state, isVideoExpanded: false };
    }
    case "SEEK_TO": {
      return { ...state, seekTo: action.payload.fraction };
    }
    case "SEEK_TO_DONE": {
      return { ...state, seekTo: null };
    }
    case "SET_VOLUME": {
      return { ...state, volume: action.payload.volume };
    }
    case "SET_PLAYBACK_RATE": {
      return { ...state, playbackRate: action.payload.playbackRate };
    }
    default:
      return state;
  }
};

export default videoReducer;
