import React, { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Collapse,
  IconButton,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import clsx from "clsx";
import { Cancel, ExpandMore, QueueMusic } from "@material-ui/icons/";
import { useMutation } from "@apollo/react-hooks";

import { ADD_OR_REMOVE_SONG_FROM_QUEUE } from "../graphql/mutations";

const useStyles = makeStyles((theme) => ({
  queuedSongList: {
    margin: " 0 auto",
  },
  avatar: {
    width: 44,
    height: 44,
  },
  text: {
    textOverflow: "ellipsis",
    overflow: "hidden",
  },
  container: {
    display: "grid",
    gridAutoFlow: "column",
    gridTemplateColumns: "50px auto 50px",
    gridGap: 12,
    alignItems: "center",
    marginTop: 10,
  },
  songInfoContainer: {
    overflow: "hidden",
    whiteSpace: "no-wrap",
  },

  root: {
    maxWidth: 275,
    minWidth: 275,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
}));

export default function QueuedSongList({ queue }) {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    queue.length > 0 && (
      <div className={classes.queuedSongList}>
        <div className={classes.root}>
          <CardActions disableSpacing>
            <Typography color="textPrimary">
              {expanded ? (
                <span style={{ fontWeight: 100 }}>
                  {queue.length} queued {queue.length === 1 ? "song" : "songs"}
                </span>
              ) : (
                <span style={{ fontWeight: 100 }}>
                  <Tooltip title="Queue">
                    <QueueMusic style={{ fontSize: 34 }} />
                  </Tooltip>
                </span>
              )}
            </Typography>
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMore />
            </IconButton>
          </CardActions>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Card>
              <CardContent>
                {queue.map((song, i) => (
                  <QueuedSong key={i} song={song} />
                ))}
              </CardContent>
            </Card>
          </Collapse>
        </div>
      </div>
    )
  );
}

function QueuedSong({ song }) {
  const classes = useStyles();
  const { thumbnail, artist, title } = song;
  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_SONG_FROM_QUEUE, {
    onCompleted: (data) => {
      localStorage.setItem("queue", JSON.stringify(data.addOrRemoveFromQueue));
    },
  });

  const handleRemoveFromQueue = () => {
    addOrRemoveFromQueue({
      variables: { input: { ...song, __typename: "Song" } },
    });
  };

  return (
    <div className={classes.container}>
      <Avatar
        variant="square"
        src={thumbnail}
        alt="song thumbnail"
        className={classes.avatar}
      />
      <div className={classes.songInfoContainer}>
        <Typography variant="subtitle2" className={classes.text}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          className={classes.text}
        >
          {artist}
        </Typography>
      </div>
      <IconButton onClick={handleRemoveFromQueue}>
        <Cancel color="primary" />
      </IconButton>
    </div>
  );
}
