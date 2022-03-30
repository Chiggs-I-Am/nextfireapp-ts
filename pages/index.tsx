import { collection, collectionGroup, doc, getDocs, limit, orderBy, query, setDoc, startAfter, where } from "firebase/firestore"
import { useState } from "react"
import Loader from "../components/Loader"
import PostFeed from "../components/PostFeed"
import { firestore, postToJSON, fromMillis } from "../libs/firebase"


// Max post to query per page
const LIMIT = 10;

export async function getServerSideProps()
{
  const userRef = collection( firestore, "users" );

  // let posts: any = [];
  const postsQuery = query(
    collectionGroup(firestore, "posts"), 
    where( "published", "==", true ),
    orderBy( "createdAt", "desc" ),
    limit( LIMIT )
  );
  
  const querySnapshot = await getDocs( postsQuery );
  const posts = querySnapshot.docs.map( postToJSON );

  return {
    props: { posts },
  };
}

export default function Home( props: { posts: any } ) 
{
  const [ posts, setPosts ] = useState( props.posts );
  const [ loading, setLoading ] = useState( false );
  const [ postsEnd, setPostsEnd ] = useState( false );

  // hide load more button if there are no more posts
  const showLoadMoreButton = async () => {
    const last = posts[ posts.length - 1 ];

    const cursor = typeof last.createdAt === "number" ? fromMillis( last.createdAt ) : last.createdAt;    

    const postsQuery = query(
      collectionGroup(firestore, "posts"),
      where("published", "==", true), 
      orderBy("createdAt", "desc"), 
      startAfter( cursor ),
      limit( 1 )
    );

    const querySnapshot = await getDocs( postsQuery );
    const postsCount = querySnapshot.size;
    
    if( postsCount === 0 ) { setPostsEnd( true ); }
  }

  showLoadMoreButton();
  
  const getMorePosts = async () => {
    setLoading( true );

    const last = posts[ posts.length - 1 ];

    const cursor = typeof last.createdAt === "number" ? fromMillis( last.createdAt ) : last.createdAt;

    const postsQuery = query( 
      collectionGroup( firestore, "posts" ), 
      where("published", "==", true), 
      orderBy("createdAt", "desc"), 
      startAfter( cursor ),
      limit( LIMIT )
    );

    const querySnapshot = await getDocs( postsQuery );
    const newPosts = querySnapshot.docs.map( doc => doc.data() );

    setPosts( posts.concat( newPosts ) );
    setLoading( false );

    if( newPosts.length < LIMIT ) {
      setPostsEnd( true );
    }
  };

  return (
    <main>
      <PostFeed posts={ posts } />

      { !loading && !postsEnd && <button onClick={ getMorePosts } hidden={ postsEnd }>Load more</button> }
      
      <Loader show={ loading } />

      { postsEnd && `You have reached the end!` }
    </main>
  )
}

