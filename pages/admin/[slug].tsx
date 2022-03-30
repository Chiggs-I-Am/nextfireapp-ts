import { useRouter } from "next/router";
import React, { useContext, useState } from 'react';
import AuthCheck from "@components/AuthCheck";
import { auth, firestore, getUserWithUsername } from "@libs/firebase";
import { collection, doc, DocumentData, DocumentReference, serverTimestamp, updateDoc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";

import styles from "../../styles/Admin.module.css";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import Link from "next/link";
import ImageUploader from "@components/ImageUploader";
import { UserContext } from "@libs/context";

export default function AdminPostEdit() {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  )
}

function PostManager()
{
  const { username } = useContext( UserContext );

  const [ preview, setPreview ] = useState( false );
  const router = useRouter();
  const { slug } = router.query;

  const currentUser = auth.currentUser;
  const usersCollectionRef = collection( firestore, "users" );
  const userDocRef = doc( usersCollectionRef, currentUser?.uid );
  const postsCollectionRef = collection( userDocRef, "posts" );
  const postDocRef = doc( postsCollectionRef, slug?.toString() );

  // ALSO USE useDocumentDataOnce() for non realtime updates
  const [ post ] = useDocumentData( postDocRef );

  return (
    <main className={ styles.container }>
      { post && (
        <>
          <section>
            <h1>{ post.title }</h1>
            <p>ID: { post.slug }</p>

            <PostForm postRef={ postDocRef } defaultValues={ post } preview={ preview } username={ username }/>
          </section>

          <aside>
            <button onClick={ () => setPreview( !preview ) }>
              { preview ? "Edit" : "Preview" }
            </button>
            <Link href={`/${ post.username }/${ post.slug }`}>
              <button className="btn-blue">Live View</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

type PostFormProps = {
  // defaultValues: { [x: string]: any };
  defaultValues: DocumentData;
  postRef: DocumentReference;
  preview: boolean;
  username: string | null;
};

function PostForm({ defaultValues, postRef, preview, username }: PostFormProps )
{
  const router = useRouter();
  const { slug } = router.query;
  const { register, handleSubmit, reset, watch, formState } = useForm({ defaultValues, mode: "onChange" });
  const { isValid, isDirty, errors } = formState; // --> client-side validation

  const updatePost = async ({ content, published }: any) => {
    await updateDoc( postRef, 
      { 
        content, 
        published,
        updatedAt: serverTimestamp()
    });

    reset({ content, published });

    toast.success( "Post updated successfully!" );
    
    // redirect to post [username]/[slug] page after update is successful
    router.push( `/${ username }/${ slug }` );
  };

  return (
    <form onSubmit={ handleSubmit( updatePost ) }>
      { preview && (
        <div className="card">
          <ReactMarkdown>{ watch("content") }</ReactMarkdown>
        </div>
      )}

      <div className={ preview ? styles.hidden : styles.controls }>

        <ImageUploader />
        
        <textarea { ...register( "content",{
          maxLength: { value: 20000, message: "Content is too long!" },
          minLength: { value: 10, message: "Content is too short!" },
          required: { value: true, message: "Content is required!" }
        })}></textarea>

        { errors.content && <p className="text-danger">{ errors.content.message }</p> }

        <fieldset>
          <input className={ styles.checkbox } type="checkbox" { ...register("published")} />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green" disabled={ !isDirty || !isValid }>
          Save Changes
        </button>

      </div>
    </form>
  );
}