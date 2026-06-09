import { useState } from "react";
import { useSubscription, useMutation } from "@apollo/client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { GET_NOTES } from "../graphql/subscriptions";
import { ADD_NOTE, DELETE_NOTE } from "../graphql/mutations";

export default function NotesDialog({ open, onClose }) {
  const [text, setText] = useState("");
  const { data, loading } = useSubscription(GET_NOTES);
  const [addNote] = useMutation(ADD_NOTE);
  const [deleteNote] = useMutation(DELETE_NOTE);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    addNote({ variables: { text: trimmed } });
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Notes</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={4}
            placeholder="Add a note… (Enter to submit)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="contained" onClick={handleAdd} disabled={!text.trim()} sx={{ flexShrink: 0 }}>
            Add
          </Button>
        </Box>

        {loading && <CircularProgress size={24} />}

        {!loading && data?.notes?.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No notes yet.
          </Typography>
        )}

        {!loading && data?.notes?.length > 0 && (
          <List disablePadding>
            {data.notes.map((note) => (
              <ListItem
                key={note.id}
                disablePadding
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => deleteNote({ variables: { id: note.id } })}>
                    <Delete fontSize="small" />
                  </IconButton>
                }
                sx={{ py: 0.5 }}
              >
                <ListItemText
                  primary={note.text}
                  primaryTypographyProps={{ variant: "body2", sx: { whiteSpace: "pre-wrap", pr: 4 } }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
