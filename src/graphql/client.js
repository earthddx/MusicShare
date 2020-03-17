// import ApolloClient from "apollo-boost"

// const client = new ApolloClient({
//    uri: "https://apollo-react-music.herokuapp.com/v1/graphql"
// })

// export default client

import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import { gql } from "apollo-boost";
import { GET_QUEUED_SONGS } from "./queries";

const client = new ApolloClient({
  link: new WebSocketLink({
    uri: "wss://apollo-react-music.herokuapp.com/v1/graphql",
    options: {
      reconnect: true
    }
  }),
  cache: new InMemoryCache(),
  typeDefs: gql`
    type Song {
      id: uuid!
      title: String!
      thumbnail: String!
      duration: Float!
      url: String!
    }

    input SongInput {
      id: uuid!
      title: String!
      thumbnail: String!
      duration: Float!
      url: String!
    }

    type Query {
      queuedSongs: [Song]! #has to return at least an array not a null value
    }

    type Mutation {
      addOrRemoveFromQueue(input: SongInput!): [Song]!
    }
  `,
  resolvers: {
    //specify how the data is added or deleted from the queue
    Mutation: {
      addOrRemoveFromQueue: (_, { input }, { cache }) => {
        const queryResult = cache.readQuery({
          query: GET_QUEUED_SONGS
        });
        if (queryResult) {
          const { queuedSongs } = queryResult;
          const isInQueue = queuedSongs.some(song => song.id === input.id); //check if the song alread y in the queue
          const newQueue = isInQueue //if it is, delete it
            ? queuedSongs.filter(song => song.id !== input.id)
            : [...queuedSongs, input]; //if not, add
          cache.writeQuery({ 
            query: GET_QUEUED_SONGS,
            data: { queuedSongs: newQueue }
          });
          return newQueue;
        }
        return [];
      }
    }
  }
});

const hasQueue = Boolean(localStorage.getItem('queue')) //check if theres a queue

const data = {
  queuedSongs: hasQueue ?  JSON.parse(localStorage.getItem('queue')) : [] //get the queue the first time app started. if theres none get an empty queue
};

client.writeData({ data });

export default client;
