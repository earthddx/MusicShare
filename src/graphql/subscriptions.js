import { gql } from "@apollo/client";

export const GET_VIDEOS = gql`
  subscription getVideos {
    videos(order_by: { created_at: desc }) {
      artist
      duration
      id
      thumbnail
      title
      url
    }
  }
`;

export const GET_NOTES = gql`
  subscription getNotes {
    notes(order_by: { created_at: desc }) {
      id
      text
      created_at
    }
  }
`;
