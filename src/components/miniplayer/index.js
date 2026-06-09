import { useContext, useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Slider,
  Tooltip,
} from "@mui/material";
import MarqueeText from "../MarqueeText";
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";
import { formatDuration } from "../../helpers/formatDuration";
import { VideoContext } from "../../store/VideoContext";

export default function MiniPlayer({ queue }) {
  const { state, dispatch } = useContext(VideoContext);
  const {
    video,
    isPlaying,
    isVideoExpanded,
    volume = 1,
    playbackRate = 1,
  } = state;

  const duration = state.duration || video.duration;

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    dispatch({ type: "SET_PLAYBACK_RATE", payload: { playbackRate: next } });
  };

  const [playedSeconds, setPlayedSeconds] = useState(state.playedSeconds);

  useEffect(() => {
    const handler = (e) => setPlayedSeconds(e.detail.playedSeconds);
    window.addEventListener("playerProgress", handler);
    return () => window.removeEventListener("playerProgress", handler);
  }, []);

  if (!video.id || isVideoExpanded) return null;

  const played = duration > 0 ? playedSeconds / duration : 0;
  const positionInQueue = queue.findIndex((v) => v.id === video.id);
  const hasPrev = positionInQueue > 0;
  const hasNext = positionInQueue >= 0 && positionInQueue < queue.length - 1;

  const handlePrev = () => {
    const prev = queue[positionInQueue - 1];
    if (prev) dispatch({ type: "SET_VIDEO", payload: { video: prev } });
  };

  const handleNext = () => {
    const next = queue[positionInQueue + 1];
    if (next) dispatch({ type: "SET_VIDEO", payload: { video: next } });
  };

  const handleSeek = (_, v) => {
    dispatch({ type: "SEEK_TO", payload: { fraction: v } });
  };

  const handleScrollToVideo = () => {
    const el = document.querySelector(`[data-video-id="${video.id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.dispatchEvent(new CustomEvent("highlightVideo", { detail: { id: video.id } }));
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: "calc(100% - 32px)", sm: 580, md: 660 },
        zIndex: 1350,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 8,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Info + controls row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 1.5,
          pt: 1,
          pb: 0.5,
        }}
      >
        <Tooltip title="Scroll to video" placement="top">
          <Avatar
            variant="rounded"
            src={video.thumbnail}
            alt={video.title}
            onClick={handleScrollToVideo}
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              cursor: "pointer",
              transition: "opacity 0.15s",
              "&:hover": { opacity: 0.75 },
            }}
          />
        </Tooltip>

        <Tooltip title="Scroll to video" placement="top">
          <Box
            onClick={handleScrollToVideo}
            sx={{
              flex: 1,
              minWidth: 0,
              cursor: "pointer",
              "&:hover .scroll-title": { textDecoration: "underline" },
            }}
          >
            <MarqueeText
              always
              typographyProps={{
                variant: "body2",
                fontWeight: 600,
                className: "scroll-title",
              }}
            >
              {video.title}
            </MarqueeText>
            <MarqueeText
              always
              typographyProps={{ variant: "caption", color: "text.secondary" }}
            >
              {video.artist}
            </MarqueeText>
          </Box>
        </Tooltip>

        <Tooltip title="Previous">
          <span>
            <IconButton size="small" onClick={handlePrev} disabled={!hasPrev}>
              <SkipPrevious />
            </IconButton>
          </span>
        </Tooltip>

        <IconButton
          onClick={() =>
            dispatch(
              isPlaying ? { type: "PAUSE_VIDEO" } : { type: "PLAY_VIDEO" },
            )
          }
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <Tooltip title="Next">
          <span>
            <IconButton size="small" onClick={handleNext} disabled={!hasNext}>
              <SkipNext />
            </IconButton>
          </span>
        </Tooltip>

        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 0.5,
            ml: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() =>
              dispatch({
                type: "SET_VOLUME",
                payload: { volume: volume > 0 ? 0 : 1 },
              })
            }
          >
            {volume === 0 ? (
              <VolumeOff fontSize="small" />
            ) : (
              <VolumeUp fontSize="small" />
            )}
          </IconButton>
          <Slider
            value={Math.sqrt(volume)}
            min={0}
            max={1}
            step={0.01}
            size="small"
            onChange={(_, v) =>
              dispatch({ type: "SET_VOLUME", payload: { volume: v * v } })
            }
            sx={{ width: 72, "& .MuiSlider-thumb": { width: 10, height: 10 } }}
          />
          <Tooltip title="Playback speed">
            <IconButton size="small" onClick={handleSpeedChange} sx={{ width: 36 }}>
              <Typography component="span" sx={{ display: "block", fontSize: 11, fontWeight: 700, color: playbackRate !== 1 ? "primary.main" : "text.primary", lineHeight: 1 }}>
                {playbackRate}X
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Progress row with times */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, pb: 1 }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: 34, textAlign: "right", flexShrink: 0 }}
        >
          {formatDuration(playedSeconds, duration)}
        </Typography>

        <Slider
          value={played}
          min={0}
          max={1}
          step={0.001}
          size="small"
          onChange={handleSeek}
          sx={{
            flex: 1,
            "& .MuiSlider-thumb": {
              width: 10,
              height: 10,
              opacity: 0,
              transition: "opacity 0.15s",
              "&:hover, &.Mui-active": { opacity: 1 },
            },
          }}
        />

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ minWidth: 34, flexShrink: 0 }}
        >
          {formatDuration(duration, duration)}
        </Typography>
      </Box>
    </Box>
  );
}
