import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Grid,
  useMediaQuery,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { YouTube, InfoOutlined, Menu as MenuIcon, EditNote } from "@mui/icons-material";
import AddVideo from "./add-video";
import AboutDialog from "./AboutDialog";
import NotesDialog from "./NotesDialog";

export default function Header({ onToggleSidebar }) {
  const greaterThanMd = useMediaQuery((theme) => theme.breakpoints.up("md"));
  const [aboutOpen, setAboutOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <AppBar position="fixed" color="secondary">
      <Grid container alignItems="center" sx={{ minHeight: 64 }}>
        {greaterThanMd && (
          <Grid item md={3}>
            <Toolbar sx={{ gap: 1 }}>
              <Tooltip title="Toggle sidebar">
                <IconButton size="small" onClick={onToggleSidebar} color="inherit">
                  <MenuIcon />
                </IconButton>
              </Tooltip>
              <YouTube sx={{ fontSize: 36 }} color="primary" />
              <Typography
                variant="h6"
                component="h1"
                noWrap
                sx={{ ml: 1, fontWeight: "light" }}
              >
                Video Share
              </Typography>
            </Toolbar>
          </Grid>
        )}

        {/* AddVideo — full width on mobile, 6 cols on desktop */}
        <Grid item xs={10} md={greaterThanMd ? 6 : 10} sx={{ px: { xs: 0, md: 2 } }}>
          <AddVideo />
        </Grid>

        {/* Right section — always visible */}
        <Grid
          item
          xs={2}
          md={3}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          {greaterThanMd && (
            <>
              <Button
                color="inherit"
                startIcon={<EditNote />}
                onClick={() => setNotesOpen(true)}
                sx={{ "&.Mui-focusVisible": { outline: "2px solid currentColor", outlineOffset: 2 } }}
              >
                Notes
              </Button>
              <Button
                color="inherit"
                startIcon={<InfoOutlined />}
                onClick={() => setAboutOpen(true)}
                sx={{ "&.Mui-focusVisible": { outline: "2px solid currentColor", outlineOffset: 2 } }}
              >
                About
              </Button>
            </>
          )}
        </Grid>
      </Grid>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <NotesDialog open={notesOpen} onClose={() => setNotesOpen(false)} />
    </AppBar>
  );
}
