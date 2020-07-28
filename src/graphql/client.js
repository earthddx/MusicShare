import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import { gql } from "apollo-boost";
import { GET_QUEUED_SONGS } from "./queries";

const GRAPHQL_ENDPOINT = "wss://apollo-react-music.herokuapp.com/v1/graphql";

const client = new ApolloClient({
  link: new WebSocketLink({
    uri: GRAPHQL_ENDPOINT,
    options: {
      reconnect: true,
    },
  }),
  cache: new InMemoryCache(),
  typeDefs: gql`
    type Song {
      id: uuid!
      thumbnail: String!
      duration: Float!
      url: String!
      artist: String!
      title: String!
    }

    input SongInput {
      id: uuid!
      thumbnail: String!
      duration: Float!
      url: String!
      artist: String!
      title: String!
    }

    type Query {
      queue: [Song]!
    }

    type Mutation {
      addOrRemoveFromQueue(input: SongInput!): [Song]!
    }
  `,
  resolvers: {
    Mutation: {
      addOrRemoveFromQueue: (_, { input }, { cache }) => {
        const data = cache.readQuery({
          query: GET_QUEUED_SONGS,
        });
        if (data) {
          const { queue } = data;
          const isInQueue = queue.some((song) => song.id === input.id);
          const newQueue = isInQueue
            ? queue.filter((song) => song.id !== input.id)
            : [...queue, input];
          cache.writeQuery({
            query: GET_QUEUED_SONGS,
            data: { queue: newQueue },
          });
          return newQueue;
        }
        return [];
      },
    },
  },
});

const itemInQueue = localStorage.getItem("queue");
const hasQueue = Boolean(itemInQueue);

const data = {
  queue: hasQueue ? JSON.parse(itemInQueue) : [],
};

client.writeData({ data });

export default client;
