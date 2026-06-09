import { gql } from "@apollo/client";

export const ADD_OR_REMOVE_VIDEO_FROM_QUEUE = gql`
  mutation addOrRemoveFromQueue($input: VideoInput!) {
    addOrRemoveFromQueue(input: $input) @client
  }
`;

export const ADD_VIDEO = gql`
  mutation addVideo(
    $title: String!
    $artist: String!
    $thumbnail: String!
    $duration: numeric!
    $url: String!
  ) {
    insert_videos(
      objects: {
        title: $title
        artist: $artist
        thumbnail: $thumbnail
        duration: $duration
        url: $url
      }
    ) {
      returning {
        artist
        created_at
        duration
        id
        thumbnail
        title
        url
      }
    }
  }
`;

export const DELETE_VIDEO = gql`
  mutation deleteVideo($id: uuid!) {
    delete_videos(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const UPDATE_VIDEO = gql`
  mutation updateVideo($id: uuid!, $title: String!, $artist: String!) {
    update_videos(where: { id: { _eq: $id } }, _set: { title: $title, artist: $artist }) {
      returning {
        id
        title
        artist
      }
    }
  }
`;

export const ADD_NOTE = gql`
  mutation addNote($text: String!) {
    insert_notes_one(object: { text: $text }) {
      id
      text
      created_at
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation deleteNote($id: uuid!) {
    delete_notes_by_pk(id: $id) {
      id
    }
  }
`;
