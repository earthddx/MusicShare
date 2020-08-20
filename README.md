App created with **GraphQL(Hasura GraphiQL), Apollo** and **React**. Accepts youtube.com urls.
Song queue is saved to local storage and being retrieved after page refresh.

Styling is done by using **Material-UI**

Deployed at https://confident-bhabha-15737c.netlify.com/

GraphQL data: https://apollo-react-music.herokuapp.com/console/data/schema/public/tables/songs/browse




## client.js (ApolloClient)

give data to client:
<code>client.writeData({data}); </code>


### how to remove data from the queue:
We specify on a new property <code>resolvers: Mutation</code> object with a property <code>addOrRemoveFromQueue</code> with 3 params where the first one isn't important in this case, second one is all the arguments and the last one is <code>cache</code>. We can work now directly with cache.

We can take what is in there currently <code>queue:[]</code> and add songs. Firt, we read the queury of all the previous songs,
then we check to see if we indeed have the queue and if the item is already in there <code>queue.some(song=>song.id === input.id)</code>, we want to remove it, otherwise add it <code>[...queue, input]</code>.

To update cache , we write back the changes <code>cache.writeQuery({...})</code> and upon success the queue is returned.
