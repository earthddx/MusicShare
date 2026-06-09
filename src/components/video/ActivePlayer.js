import { useState, useEffect, useRef } from "react";
import { Box, CardMedia, IconButton, Tooltip } from "@mui/material";
import { Close, Fullscreen, Pause, PlayArrow } from "@mui/icons-material";
import ReactPlayer from "react-player";
import PlayerControls from "./PlayerControls";

const MODAL_CONTROLS_HEIGHT = 80;

export default function ActivePlayer({
  video,
  isVideoExpanded,
  repeatVideo,
  volume,
  playbackRate,
  reactPlayerRef,
  initialSecondsRef,
  hasRestoredSeek,
  showControls,
  onTogglePlay,
  onVideoEnd,
  onProgress,
  controlsProps,
  dispatch,
  listMode = false,
}) {
  // On mobile, YouTube blocks playVideo() from JS unless the user tapped the iframe directly.
  // We keep pointer events enabled on the iframe until the video actually starts playing,
  // so the user can tap YouTube's native play button if autoplay was blocked.
  const [hasStarted, setHasStarted] = useState(false);
  const ignorePauseRef = useRef(false);
  useEffect(() => {
    setHasStarted(false);
  }, [video.url]);

  const sharedPlayerProps = {
    ref: reactPlayerRef,
    url: video.url,
    playing: controlsProps.isPlaying,
    volume,
    playbackRate,
    loop: repeatVideo,
    playsinline: true,
    width: "100%",
    height: "100%",
    muted: !hasStarted,
    style: { pointerEvents: "none" },
    config: { youtube: { playerVars: { playsinline: 1 } } },
    onReady: () => {
      if (!hasRestoredSeek.current) {
        reactPlayerRef.current?.seekTo(initialSecondsRef.current, "seconds");
        hasRestoredSeek.current = true;
      }
    },
    onPlay: () => {
      // When muted flips to false after hasStarted, YouTube fires onPause then onPlay.
      // Flag the upcoming spurious onPause so we don't reset isPlaying.
      ignorePauseRef.current = true;
      setHasStarted(true);
      if (!controlsProps.isPlaying) dispatch({ type: "PLAY_VIDEO" });
    },
    onPause: () => {
      if (ignorePauseRef.current) { ignorePauseRef.current = false; return; }
      if (controlsProps.isPlaying) dispatch({ type: "PAUSE_VIDEO" });
    },
    onEnded: onVideoEnd,
    onProgress,
    onDuration: (d) => {
      if (d > 0) dispatch({ type: "SET_DURATION", payload: { duration: d } });
    },
  };

  const audioOnly = listMode && !isVideoExpanded;

  return (
    <>
      {/* Fullscreen backdrop */}
      {isVideoExpanded && (
        <Box
          onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.85)",
            zIndex: 1300,
          }}
        />
      )}

      <Box
        onClick={audioOnly ? undefined : onTogglePlay}
        sx={
          isVideoExpanded
            ? {
                position: "fixed",
                top: { xs: 0, sm: "50%" },
                left: { xs: 0, sm: "50%" },
                transform: { xs: "none", sm: "translate(-50%, -50%)" },
                width: { xs: "100vw", sm: "80vw" },
                height: { xs: "100vh", sm: "45vw" },
                zIndex: 1301,
                bgcolor: "black",
              }
            : { width: "100%", height: "100%" }
        }
      >
        {/* ReactPlayer always mounted — preserves position across mode changes */}
        <Box
          sx={
            audioOnly
              ? {
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  pointerEvents: "none",
                }
              : { width: "100%", height: "100%" }
          }
        >
          <ReactPlayer
            {...sharedPlayerProps}
            height={
              isVideoExpanded
                ? `calc(100% - ${MODAL_CONTROLS_HEIGHT}px)`
                : "100%"
            }
          />
        </Box>

        {/* List mode: thumbnail covers the hidden video */}
        {audioOnly && (
          <CardMedia
            component="img"
            src={video.thumbnail}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Modal close button */}
        {isVideoExpanded && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "flex-end",
              px: 1,
              pt: 1,
              zIndex: 1,
            }}
          >
            <Tooltip title="Close">
              <IconButton onClick={() => dispatch({ type: "COLLAPSE_VIDEO" })}>
                <Close sx={{ color: "white" }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Modal controls */}
        {isVideoExpanded && (
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              px: 2,
              pb: 1,
              pt: 3,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
            }}
          >
            <PlayerControls {...controlsProps} />
          </Box>
        )}
      </Box>

      {/* Tiles mode: inline controls overlay */}
      {!isVideoExpanded && !listMode && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
            px: 1,
            pb: 0.5,
            pt: 4,
            opacity: showControls ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <PlayerControls
            compact
            showExpand
            onExpand={() => dispatch({ type: "EXPAND_VIDEO" })}
            {...controlsProps}
          />
        </Box>
      )}

      {/* List mode: play/pause + expand overlays */}
      {audioOnly && (
        <>
          <Box
            onClick={onTogglePlay}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: showControls ? 1 : 0,
              transition: "opacity 0.2s",
              cursor: "pointer",
            }}
          >
            <IconButton
              sx={{
                bgcolor: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
                width: 40,
                height: 40,
                pointerEvents: "none",
              }}
            >
              {controlsProps.isPlaying ? (
                <Pause sx={{ color: "white", fontSize: 22 }} />
              ) : (
                <PlayArrow sx={{ color: "white", fontSize: 22 }} />
              )}
            </IconButton>
          </Box>

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "EXPAND_VIDEO" });
            }}
            size="small"
            sx={{
              position: "absolute",
              bottom: 4,
              right: 4,
              opacity: showControls ? 1 : 0,
              transition: "opacity 0.2s",
              bgcolor: "rgba(0,0,0,0.5)",
              "&:hover": { bgcolor: "rgba(0,0,0,0.85)" },
            }}
          >
            <Fullscreen sx={{ fontSize: 18, color: "white" }} />
          </IconButton>
        </>
      )}
    </>
  );
}
