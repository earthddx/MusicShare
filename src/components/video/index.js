import { useState, useContext } from "react";
import { Box, Snackbar } from "@mui/material";
import { VideoContext } from "../../store/VideoContext";
import { useHighlight } from "../../hooks/useHighlight";
import { useQueueState } from "../../hooks/useQueueState";
import { usePlayback } from "../../hooks/usePlayback";
import VideoThumbnailArea from "./VideoThumbnailArea";
import ActivePlayer from "./ActivePlayer";
import VideoInfoRow from "./VideoInfoRow";

export default function Video({ video, handleDeleteVideo, queue, allVideos, viewMode = "tiles" }) {
  const { artist, title, thumbnail } = video;
  const { state, dispatch } = useContext(VideoContext);
  const isCurrentVideo = !!state.video.id && video.id === state.video.id;

  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const highlighted = useHighlight(video.id);
  const { currVideoInQueue, positionInQueue, handleAddToQueue } = useQueueState(video, queue);
  const {
    played, setPlayed,
    playedSeconds, setPlayedSeconds,
    isUserSeeking, setIsUserSeeking,
    repeatVideo, setRepeatVideo,
    reactPlayerRef,
    initialSecondsRef,
    hasRestoredSeek,
    lastDispatchedSecondsRef,
    handleVideoEnd,
  } = usePlayback({ isCurrentVideo, state, dispatch, video, queue, positionInQueue, allVideos });

  const volume = state.volume ?? 1;
  const setVolume = (v) => dispatch({ type: "SET_VOLUME", payload: { volume: v } });

  const handleTogglePlay = () => {
    if (isCurrentVideo) {
      dispatch(state.isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" });
    } else {
      dispatch({ type: "SET_VIDEO", payload: { video } });
      dispatch({ type: "PLAY_VIDEO" });
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url).then(() => setCopied(true));
  };

  const controlsProps = {
    played,
    playedSeconds,
    duration: state.duration || video.duration,
    volume,
    isPlaying: state.isPlaying,
    repeatVideo,
    positionInQueue,
    queueLength: queue.length,
    onSeekChange: (v) => setPlayed(v),
    onSeekStart: () => setIsUserSeeking(true),
    onSeekCommit: (v) => { setIsUserSeeking(false); reactPlayerRef.current?.seekTo(v); },
    onVolumeChange: setVolume,
    onPlayPrev: () => { const prev = queue[positionInQueue - 1]; if (prev) dispatch({ type: "SET_VIDEO", payload: { video: prev } }); },
    onPlayNext: () => { const next = queue[positionInQueue + 1]; if (next) dispatch({ type: "SET_VIDEO", payload: { video: next } }); },
    onTogglePlay: handleTogglePlay,
    onRepeatToggle: () => setRepeatVideo(!repeatVideo),
    playbackRate: state.playbackRate ?? 1,
    onSpeedChange: () => {
      const speeds = [0.75, 1, 1.25, 1.5, 2];
      const next = speeds[(speeds.indexOf(state.playbackRate ?? 1) + 1) % speeds.length];
      dispatch({ type: "SET_PLAYBACK_RATE", payload: { playbackRate: next } });
    },
  };

  const handleProgress = ({ played: p, playedSeconds: ps }) => {
    if (isUserSeeking) return;
    setPlayed(p);
    setPlayedSeconds(ps);
    window.dispatchEvent(new CustomEvent("playerProgress", { detail: { playedSeconds: ps } }));
    if (ps - lastDispatchedSecondsRef.current >= 5) {
      lastDispatchedSecondsRef.current = ps;
      dispatch({ type: "SET_PLAYED_SECONDS", payload: { playedSeconds: ps } });
    }
  };

  const showControls = isCurrentVideo && !state.isVideoExpanded && (hovered || !state.isPlaying);
  const isListMode = viewMode === "list";

  return (
    <>
      <Box
        data-video-id={video.id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          cursor: "pointer",
          borderRadius: 2,
          overflow: "hidden",
          px: 1,
          pt: isListMode ? 0.5 : 1,
          pb: isListMode ? 0.5 : 0,
          display: isListMode ? "flex" : "block",
          alignItems: isListMode ? "center" : undefined,
          gap: isListMode ? 1.5 : undefined,
          transition: "background-color 0.2s",
          ...(isCurrentVideo && { bgcolor: "rgba(239,83,80,0.08)" }),
          "&:hover": {
            bgcolor: isCurrentVideo
              ? "rgba(239,83,80,0.14)"
              : (theme) => theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          },
          "@keyframes videoHighlight": {
            "0%": { backgroundColor: isCurrentVideo ? "rgba(239,83,80,0.08)" : "transparent", boxShadow: "0 0 0 0px rgba(239,83,80,0)" },
            "25%": { backgroundColor: "rgba(239,83,80,0.13)", boxShadow: "0 0 0 2px rgba(239,83,80,0.7)" },
            "50%": { backgroundColor: "rgba(239,83,80,0.10)", boxShadow: "0 0 0 2px rgba(239,83,80,0.5)" },
            "100%": { backgroundColor: isCurrentVideo ? "rgba(239,83,80,0.08)" : "transparent", boxShadow: "0 0 0 0px rgba(239,83,80,0)" },
          },
          ...(highlighted && { animation: "videoHighlight 3.2s ease-in-out" }),
        }}
      >
        <Box sx={
          isListMode
            ? { position: "relative", width: 128, flexShrink: 0, aspectRatio: "16/9", bgcolor: "black", borderRadius: "8px", overflow: "hidden" }
            : { position: "relative", aspectRatio: "16/9", width: "100%", bgcolor: "black", borderRadius: "10px", overflow: "hidden" }
        }>
          {isCurrentVideo ? (
            <ActivePlayer
              video={video}
              isVideoExpanded={state.isVideoExpanded}
              repeatVideo={repeatVideo}
              volume={volume}
              playbackRate={state.playbackRate ?? 1}
              reactPlayerRef={reactPlayerRef}
              initialSecondsRef={initialSecondsRef}
              hasRestoredSeek={hasRestoredSeek}
              showControls={showControls}
              onTogglePlay={handleTogglePlay}
              onVideoEnd={handleVideoEnd}
              onProgress={handleProgress}
              controlsProps={controlsProps}
              dispatch={dispatch}
              listMode={isListMode}
            />
          ) : (
            <VideoThumbnailArea
              thumbnail={thumbnail}
              hovered={hovered}
              onPlay={handleTogglePlay}
              onExpand={() => {
                dispatch({ type: "SET_VIDEO", payload: { video } });
                dispatch({ type: "PLAY_VIDEO" });
                dispatch({ type: "EXPAND_VIDEO" });
              }}
            />
          )}
        </Box>

        <VideoInfoRow
          videoId={video.id}
          title={title}
          artist={artist}
          hovered={hovered}
          isCurrentVideo={isCurrentVideo}
          isPlaying={state.isPlaying}
          currVideoInQueue={currVideoInQueue}
          onAddToQueue={handleAddToQueue}
          onShare={handleShare}
          onDelete={() => handleDeleteVideo(video.id)}
          compact={isListMode}
        />
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </>
  );
}
