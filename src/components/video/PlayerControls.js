import { Typography, IconButton, Tooltip, Box, Slider } from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipPrevious,
  SkipNext,
  RepeatOne,
  VolumeUp,
  Fullscreen,
} from "@mui/icons-material";
import { formatDuration } from "../../helpers/formatDuration";

export default function PlayerControls({
  played,
  playedSeconds,
  duration,
  volume,
  isPlaying,
  repeatVideo,
  positionInQueue,
  queueLength,
  compact = false,
  showExpand = false,
  onSeekChange,
  onSeekStart,
  onSeekCommit,
  onVolumeChange,
  onPlayPrev,
  onPlayNext,
  onTogglePlay,
  onRepeatToggle,
  onExpand,
  playbackRate = 1,
  onSpeedChange,
}) {
  const btnSize = compact ? "small" : undefined;
  const thumbSx = compact ? { width: 10, height: 10 } : { width: 12, height: 12 };
  const captionSx = compact
    ? { color: "white", fontSize: 10, minWidth: 30 }
    : { color: "white", minWidth: 36 };

  return (
    <>
      {/* Progress */}
      <Box sx={{ display: "flex", alignItems: "center", gap: compact ? 0.5 : 1 }}>
        <Typography variant="caption" sx={{ ...captionSx, textAlign: "right" }}>
          {formatDuration(playedSeconds, duration)}
        </Typography>
        <Slider
          value={played}
          min={0}
          max={1}
          step={0.01}
          size={compact ? "small" : undefined}
          onChange={(_, v) => onSeekChange(v)}
          onMouseDown={onSeekStart}
          onChangeCommitted={(_, v) => onSeekCommit(v)}
          sx={{ color: "white", "& .MuiSlider-thumb": thumbSx }}
        />
        <Typography variant="caption" sx={captionSx}>
          {formatDuration(duration, duration)}
        </Typography>
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton size={btnSize} onClick={onPlayPrev} disabled={positionInQueue <= 0}>
          <SkipPrevious sx={{ color: "white", ...(compact && { fontSize: 18 }) }} />
        </IconButton>
        <IconButton size={btnSize} onClick={onTogglePlay}>
          {isPlaying ? (
            <Pause sx={{ color: "white", fontSize: compact ? 18 : 32 }} />
          ) : (
            <PlayArrow sx={{ color: "white", fontSize: compact ? 18 : 32 }} />
          )}
        </IconButton>
        <IconButton size={btnSize} onClick={onPlayNext} disabled={positionInQueue >= queueLength - 1}>
          <SkipNext sx={{ color: "white", ...(compact && { fontSize: 18 }) }} />
        </IconButton>

        <Box sx={{ flex: 1 }} />

        <VolumeUp sx={{ color: "white", mr: compact ? 0.5 : 1, ...(compact && { fontSize: 14 }) }} />
        <Slider
          value={Math.sqrt(volume)}
          min={0}
          max={1}
          step={0.01}
          size={compact ? "small" : undefined}
          onChange={(_, v) => onVolumeChange(v * v)}
          sx={{ width: compact ? 56 : 80, color: "white", "& .MuiSlider-thumb": thumbSx }}
        />

        <Tooltip title="Repeat">
          <IconButton size={btnSize} onClick={onRepeatToggle} sx={{ ml: 0.5 }}>
            <RepeatOne
              sx={{ color: repeatVideo ? "primary.main" : "white", ...(compact && { fontSize: 16 }) }}
            />
          </IconButton>
        </Tooltip>

        {!compact && (
          <>
            <Tooltip title="Playback speed">
              <IconButton size={btnSize} onClick={onSpeedChange} sx={{ ml: 0.5 }}>
                <Typography component="span" sx={{ display: "block", color: playbackRate !== 1 ? "primary.main" : "white", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>
                  {playbackRate}×
                </Typography>
              </IconButton>
            </Tooltip>
          </>
        )}

        {showExpand && (
          <Tooltip title="Expand">
            <IconButton size={btnSize} onClick={onExpand} sx={{ ml: 0.5 }}>
              <Fullscreen sx={{ color: "white", ...(compact && { fontSize: 16 }) }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </>
  );
}
