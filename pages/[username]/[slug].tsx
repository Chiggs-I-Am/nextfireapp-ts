import React from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { firestore, getUserWithUsername, postToJSON } from "@libs/firebase";
import { collection, collectionGroup, doc, getDoc, getDocs, query } from "firebase/firestore";
import styles from "../../styles/Post.module.css";
import PostContent from "@components/PostContent";
import Metatags from "@components/Metatags";
import AuthCheck from "@components/AuthCheck";
import HeartButton from "@components/HeartButton";
import Link from "next/link";

type StaticProps = {
  params: {
    username: string;
    slug: string;
  };
}

export async function getStaticProps({ params }: StaticProps ) 
{
  const { username, slug } = params;
  const userDoc = await getUserWithUsername( username );

  let post;
  let path;

  if( userDoc )
  {
    // const postRef = collection( firestore, `${ userDoc.ref.path }`, "posts" );
    // const postSnapshot = await getDoc( doc( postRef, slug ) );
    // post = postToJSON( postSnapshot );
    // path = postRef.path;

    const usersCollectionRef = collection( firestore, "users" );
    const postsCollectionRef = collection( usersCollectionRef, userDoc.ref.id, "posts" );
    const docRef = doc( postsCollectionRef, slug );
    const docSnapshot = await getDoc( docRef );
    post = postToJSON( docSnapshot );
    path = docRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths()
{
  // Improve by using Admin SDK to select empty docs
  const postsQuery = collectionGroup( firestore, 'posts' ) ;
  const querySnapshot = await getDocs( postsQuery );

  const paths = querySnapshot.docs.map( doc => {
    const { username, slug } = doc.data();
    
    return {
      params: { username, slug },
    }; 
  });

  return {
    // must be in this format:
    // paths: [
    //  { params: { username, slug } },
    //],
    paths,
    fallback: "blocking",
  };
}

export default function PostPage(props: { post: any, path: any }) 
{
  const postRef = doc( firestore, props.path );
  const [ realtimePost ] = useDocumentData( postRef );
  const post = realtimePost || props.post;

  return (
    <main className={ styles.container }>
      <Metatags title={ post.title } description={ post.content }/>
      <section>
        <PostContent post={ post } />
      </section>

      <aside className="card">
        <p>
          <strong>{ post.heartCount || 0 } ❤️</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter" passHref>
              <button>💗 Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={ postRef }/>
        </AuthCheck>
      </aside>

    </main>
  )
}
