import React from 'react';
import { collection, doc, DocumentReference, writeBatch } from "firebase/firestore";
import { auth, firestore, incrementValue } from "@libs/firebase";
import { useDocument } from "react-firebase-hooks/firestore";

type HeartButtonProps = {
  postRef: DocumentReference
};

// Allows users to heart or like a post
export default function HeartButton({ postRef }: HeartButtonProps ) 
{
  // Listen to heart document for current logged in user
  const currentUser = auth.currentUser;
  const heartCollectionRef = collection( postRef, "hearts",);
  const heartDocRef = doc( heartCollectionRef, currentUser?.uid );
  const [ heartDoc ] = useDocument( heartDocRef );

  // create a user-to-post relationship
  const addHeart = async () => {
    const uid = currentUser?.uid;
    
    const batch = writeBatch( firestore );
    batch.update( postRef, { heartCount: incrementValue( 1 ) });
    batch.set( heartDocRef, { uid });

    await batch.commit();
  };

  const removeHeart = async () => {
    const batch = writeBatch( firestore );
    batch.update( postRef, { heartCount: incrementValue( -1 ) });
    batch.delete( heartDocRef );

    await batch.commit();
  };

  return heartDoc?.exists() ? 
    ( <button onClick={ removeHeart }>💔 Unheart</button> )
    : 
    ( <button onClick={ addHeart }>❤️ Heart</button> );
}
