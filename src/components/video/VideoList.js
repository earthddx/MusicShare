import { useState, useEffect, useRef } from "react";
import {
  Grid,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import { useSubscription, useMutation, useApolloClient } from "@apollo/client";

import { GET_VIDEOS } from "../../graphql/subscriptions";
import { DELETE_VIDEO } from "../../graphql/mutations";
import { GET_QUEUED_VIDEOS } from "../../graphql/queries";

import Video from ".";

export default function VideoList({ queue, filter = "", viewMode = "tiles" }) {
  const { data, loading, error } = useSubscription(GET_VIDEOS);
  const [deleteVideo] = useMutation(DELETE_VIDEO);
  const apolloClient = useApolloClient();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const prevVideosRef = useRef(null);

  useEffect(() => {
    if (!data?.videos) return;

    // Skip the initial load — don't toast for existing videos
    if (prevVideosRef.current === null) {
      prevVideosRef.current = data.videos;
      return;
    }

    const prev = prevVideosRef.current;
    const curr = data.videos;
    const prevIds = new Set(prev.map((v) => v.id));
    const currIds = new Set(curr.map((v) => v.id));

    const added = curr.filter((v) => !prevIds.has(v.id));
    const removed = prev.filter((v) => !currIds.has(v.id));

    if (added.length > 0) {
      setToast({
        open: true,
        message: `"${added[0].title}" was added`,
        severity: "success",
      });
    } else if (removed.length > 0) {
      // Only notify if not triggered by the local user's delete action
      if (removed[0].id !== pendingDeleteId) {
        setToast({
          open: true,
          message: `"${removed[0].title}" was removed`,
          severity: "info",
        });
      }
    }

    prevVideosRef.current = data.videos;
  }, [data?.videos]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <CircularProgress size="10rem" />
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography color="text.secondary" gutterBottom>
          Connection lost. Please reload to reconnect.
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Box>
    );
  }

  const handleDeleteVideo = (id) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = () => {
    deleteVideo({ variables: { id: pendingDeleteId } });

    // Also remove from queue if present
    const cached = apolloClient.cache.readQuery({ query: GET_QUEUED_VIDEOS });
    if (cached?.queue?.some((v) => v.id === pendingDeleteId)) {
      const newQueue = cached.queue.filter((v) => v.id !== pendingDeleteId);
      apolloClient.cache.writeQuery({ query: GET_QUEUED_VIDEOS, data: { queue: newQueue } });
      localStorage.setItem("queue", JSON.stringify(newQueue));
    }

    setPendingDeleteId(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteId(null);
  };

  const query = filter.trim().toLowerCase();
  const matchesFilter = (v) =>
    !query ||
    v.title?.toLowerCase().includes(query) ||
    v.artist?.toLowerCase().includes(query);

  const hasResults = data.videos.some(matchesFilter);

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={3}>
        {data.videos.map((video) => (
          <Grid item xs={12} sm={viewMode === "tiles" ? 6 : 12} md={viewMode === "tiles" ? 4 : 12} key={video.id} sx={{ display: matchesFilter(video) ? undefined : "none" }}>
            <Video video={video} handleDeleteVideo={handleDeleteVideo} queue={queue} allVideos={data.videos} viewMode={viewMode} />
          </Grid>
        ))}
        {query && !hasResults && (
          <Grid item xs={12}>
            <Typography color="text.secondary">No videos match "{filter.trim()}"</Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={!!pendingDeleteId} onClose={handleCancelDelete} PaperProps={{ sx: { minWidth: 320 } }}>
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this video? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} variant="contained" sx={{ bgcolor: "white", color: "#000", "&:hover": { bgcolor: "grey.100" } }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
