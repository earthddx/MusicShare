App created with **GraphQL(Hasura GraphiQL), Apollo** and **React**. Accepts youtube.com urls.
Song queue is saved to local storage and being retrieved after page refresh.

Styling is done by using **Material-UI**

Deployed at https://confident-bhabha-15737c.netlify.com/

GraphQL data: https://apollo-react-music.herokuapp.com/console/data/schema/public/tables/songs/browse
Please be aware that queries, mutations, subsciptions and data could be modified on the graphql endpoint and its not secured.

## How to add or remove data from the queue


### client.js (ApolloClient)

In<code>resolvers: Mutation</code> object with a property <code>addOrRemoveFromQueue</code> 3 paramateres are specified, where the first one isn't important in this case, second one is all the arguments and the last one is <code>cache</code>. It gives access to work directly with cache.

We can take what is in there currently <code>queue:[]</code> and add songs. First, we read the queury of all the previous songs,
then we check to see if we indeed have the queue and if the item is already in there <code>queue.some(song=>song.id === input.id)</code>, we want to remove it, otherwise add it <code>[...queue, input]</code>.

To update cache , we write back the changes <code>cache.writeQuery({...})</code> and upon success the queue is returned.


### SongList.js
To save queued song in to local storage:

<code>...onCompleted: data=>{localstorage.setItem('queue', data.addOrRemoveFromQueue)}</code>


The data is coming from  <code>addOrRemoveFromQueue</code> mutation and corresponds to <code>'queue'</code> key. In order to write the data that results in an array to local storage, we have to convert it in to a string instead <code>JSON.stringify(data.addOrRemoveFromQueue)</code> since local storage only accepts strings.


### QueuedSongList.js
We use the same <code>onCompleted</code> callback as a second argument of the same mutation.



## Initial loading of the application

In <code>client.js</code> file we check for the existing queue and assign it as a value to <code>queue</code> key and parse it back to an array. That allows the app to load the queue after page refresh (as long as its not deleted from the local storage manually).
