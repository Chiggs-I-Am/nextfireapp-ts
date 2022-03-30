import { FormEvent, useContext, useState } from 'react'
import { collection, doc, DocumentData, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, firestore } from "@libs/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { useRouter } from "next/router";
import { UserContext } from "@libs/context";
import AuthCheck from "@components/AuthCheck";
import PostFeed from "@components/PostFeed";
import kebabCase from "lodash.kebabcase";

import styles from "../../styles/Admin.module.css";
import toast from "react-hot-toast";

export default function AdminPostPage( props: any ) {
  return (
    <main>
      <AuthCheck>
        <CreateNewPost />
        <PostList />
      </AuthCheck>
    </main>
  )
}

interface IPostItem extends DocumentData
{
  slug: string;
  title: string;
  username: string;
  content: string;
  heartCount: number;
}

function PostList()
{
  const currentUserID = auth.currentUser?.uid;
  // firestore posts collection --> users/[currentUserID]/posts
  const usersCollectionRef = collection( firestore, "users" );
  const userDocRef = doc( usersCollectionRef, currentUserID );
  const postsCollectionRef = collection( userDocRef, "posts" );
  const postsQuery = query( postsCollectionRef, orderBy("createdAt") );

  const [ querySnapshot ] = useCollection( postsQuery );
  const posts = querySnapshot?.docs.map( doc => doc.data() ) as IPostItem[];

  // CAN ALSO USER useCollectionData();

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={ posts } />
    </>
  )
}

function CreateNewPost()
{
  const router = useRouter();
  const { username } = useContext( UserContext );
  const [ title, setTitle ] = useState( "" );

  // Ensure slug is URL safe --> strips out special characters
  const slug = encodeURI( kebabCase( title ) );

  // Validate length of title
  const isValid = title.length > 3 && title.length < 100;

  const createPost = async ( e: FormEvent ) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    // firestore posts collection --> users/[currentUserID]/posts/[slug]
    const usersCollectionRef = collection( firestore, "users" );
    const userDocRef = doc( usersCollectionRef, uid );
    const postsCollectionRef = collection( userDocRef, "posts" );
    const postDocRef = doc( postsCollectionRef, slug );

    // TIP: give all fields a default value
    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: "# hello world!",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0
    };

    await setDoc( postDocRef, data );

    toast.success( "Post created!" );

    // Imperative navigation after doc is set
    router.push( `/admin/${slug}` );
  };

  return (
    <form onSubmit={ createPost }>
      <input 
        type="text" 
        value={ title }
        onChange={ (e) => setTitle( e.target.value ) }
        placeholder="My Awesome Article"
        className={ styles.input }
      />

      <p>
        <strong>Slug: </strong> { slug }
      </p>
      <button type="submit" disabled={ !isValid } className="btn-green">
        Create Post
      </button>
    </form>
  );
}
