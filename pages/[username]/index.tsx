import { User } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query as dbQuery, where } from "firebase/firestore";
import React from 'react'
import PostFeed from "@components/PostFeed"
import UserProfile from "@components/UserProfile"
import { firestore, getUserWithUsername, postToJSON } from "@libs/firebase";

// interface UserProfileProps extends User
// {
//   username: string;
// }

// type UserProfilePageProps = {
//   user: UserProfileProps;
//   posts: [];
//   admin: boolean;
// }
// type UserContextProps = {
//   user: User;
//   username: string;
// };

type ServerSideQueryProps = {
  query: {
    username: string;
  }
};

export async function getServerSideProps({ query }: ServerSideQueryProps)
{
  const { username } = query;
  
  const userDoc = await getUserWithUsername(username);
  
  let user = null;
  let posts = null;

  if( !userDoc ) {
    return { notFound: true };
  }
  
  if( userDoc ) {
    user = userDoc.data();
    
    const postsQuery = dbQuery( 
      collection( firestore, `${ userDoc.ref.path }/posts` ),
      where( "published", "==", true ),
      orderBy( "createdAt", "desc" ),
      limit( 5 )
    );

    // posts = ( await getDocs( postsQuery ) ).docs.map( postToJSON );
    const postsSnapshot = await getDocs( postsQuery );
    posts = postsSnapshot.docs.map( postToJSON );
  }

  return { 
    props: { user, posts } 
  }
}

interface UserProfileProps extends User {
  username: string;
}

type UserProfilePageProps = {
  user: UserProfileProps;
  posts: [];
}

export default function UserProfilePage({ user, posts }: UserProfilePageProps ) 
{
  return (
    <main>
      <UserProfile user={ user } />
      <PostFeed posts={ posts } />
    </main>
  )
}
