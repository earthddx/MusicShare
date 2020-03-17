import { gql } from "apollo-boost";

export const GET_QUEUED_SONGS = gql`
  query getQueuedSongs {
    queuedSongs @client{ #only perform this query on a client
      id
      duration
      title
      artist
      thumbnail
      url
    }
  }
`