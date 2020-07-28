import { gql } from "apollo-boost";

export const ADD_OR_REMOVE_SONG_FROM_QUEUE = gql`
  mutation addOrRemoveFromQueue($input: SongInput!) {
    addOrRemoveFromQueue(input: $input) @client
  }
`;

export const ADD_SONG = gql`
  mutation addSong(
    $title: String!
    $artist: String!
    $thumbnail: String!
    $duration: Float!
    $url: String!
  ) {
    insert_songs(
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

export const DELETE_SONG = gql`
  mutation deleteSong($id: uuid!) {
    delete_songs(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;
