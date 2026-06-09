import React, { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton, Tooltip } from "@mui/material";
import { Add, Clear } from "@mui/icons-material";
import ReactPlayer from "react-player";
import { useSubscription } from "@apollo/client";

import { GET_VIDEOS } from "../../graphql/subscriptions";
import AddVideoDialog from "./AddVideoDialog";

function sanitizeUrl(raw) {
  try {
    const parsed = new URL(raw);
    if (/youtube\.com/.test(parsed.hostname)) {
      const v = parsed.searchParams.get("v");
      return v ? `https://www.youtube.com/watch?v=${v}` : raw;
    }
    if (/youtu\.be/.test(parsed.hostname)) {
      return `https://www.youtube.com/watch?v=${parsed.pathname.slice(1)}`;
    }
  } catch (_) {}
  return raw;
}

export default function AddVideo() {
  const [dialog, setDialog] = useState(false);
  const [url, setUrl] = useState("");
  const [playable, setPlayable] = useState(false);
  const { data: videosData } = useSubscription(GET_VIDEOS);
  const isDuplicate = !!url && (videosData?.videos ?? []).some((v) => sanitizeUrl(v.url) === url);
  const [video, setVideo] = useState({
    duration: 0,
    title: "",
    artist: "",
    thumbnail: "",
  });

  useEffect(() => {
    const isPlayable = ReactPlayer.canPlay(url);
    setPlayable(isPlayable);
  }, [url]);

  const handleEditVideo = async ({ player }) => {
    // YouTube — use player API for full metadata
    try {
      const nestedPlayer = player.player.player;
      if (typeof nestedPlayer.getDuration === "function") {
        const duration = nestedPlayer.getDuration();
        const { title, video_id, author } = nestedPlayer.getVideoData();
        const thumbnail = `https://img.youtube.com/vi/${video_id}/0.jpg`;
        setVideo({ duration, title, artist: author, thumbnail, url });
        return;
      }
    } catch (_) {}

    // Vimeo — oEmbed API
    if (/vimeo\.com/.test(url)) {
      try {
        const res = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
        );
        const data = await res.json();
        setVideo((prev) => ({
          ...prev,
          url,
          title: data.title || "",
          thumbnail: data.thumbnail_url || "",
          duration: data.duration || 0,
        }));
        return;
      } catch (_) {}
    }

    // SoundCloud — oEmbed API (duration is captured at playback time via onDuration)
    if (/soundcloud\.com/.test(url)) {
      try {
        const res = await fetch(
          `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        );
        const data = await res.json();
        setVideo((prev) => ({
          ...prev,
          url,
          title: data.title || "",
          thumbnail: data.thumbnail_url || "",
        }));
        return;
      } catch (_) {}
    }

    // Fallback — no metadata available
    setVideo((prev) => ({ ...prev, url }));
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 8,
        padding: "12px 16px",
      }}
    >
      <AddVideoDialog
        url={url}
        setUrl={setUrl}
        setDialog={setDialog}
        dialog={dialog}
        video={video}
        setVideo={setVideo}
      />
      <TextField
        fullWidth
        size="small"
        label="Paste a video URL"
        variant="outlined"
        type="url"
        sx={{ maxWidth: 500 }}
        onChange={(e) => setUrl(sanitizeUrl(e.target.value))}
        value={url}
        placeholder="YouTube, Vimeo, SoundCloud…"
        error={isDuplicate}
        InputProps={{
          endAdornment: url ? (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={() => setUrl("")}>
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
      <Tooltip title={isDuplicate ? "Already in the library" : ""}>
        <span>
          <Button
            variant="contained"
            size="small"
            onClick={() => setDialog(true)}
            disabled={!playable || isDuplicate}
            startIcon={<Add />}
            sx={{ whiteSpace: "nowrap", flexShrink: 0, height: 40 }}
          >
            {isDuplicate ? "Already added" : "Add"}
          </Button>
        </span>
      </Tooltip>
      <ReactPlayer url={url} hidden onReady={handleEditVideo} />
    </div>
  );
}
