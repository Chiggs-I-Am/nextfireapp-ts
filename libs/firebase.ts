
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, DocumentSnapshot, getDocs, getFirestore, limit, query, where, Timestamp, serverTimestamp, increment } from "firebase/firestore";
import { getStorage, TaskEvent } from "firebase/storage";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
	apiKey: "AIzaSyCsaNYvbvMoDJ2O9Qr910iqGMnOLPI8Qrs",
	authDomain: "react-dev-f0f13.firebaseapp.com",
	projectId: "react-dev-f0f13",
	storageBucket: "react-dev-f0f13.appspot.com",
	messagingSenderId: "1076252697278",
	appId: "1:1076252697278:web:8a1e555619c8115c2534ef",
	measurementId: "G-LTBEMZRVRG",
};


const app = initializeApp(firebaseConfig);

// if( !getApp.length ) {
// 	initializeApp( firebaseConfig );
// }

export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
export const fromMillis = Timestamp.fromMillis; // --> fromMillis( seconds, nanoseconds )
export const serverTimeStamp = serverTimestamp; // --> serverTimeStamp()
export const incrementValue = increment; // --> increment( number ), update count without having to know the current value

export const storage = getStorage(app);
export const STATE_CHANGED: TaskEvent = "state_changed";

export const usersCollection = collection( firestore, "users" );

// Helper functions

/**
 * Gets a users/{uid} document with username
 * @param {string} username 
 */
export async function getUserWithUsername( username: string )
{
	// create a query to get the user with the username
	const userQuery = query( usersCollection, where( "username", "==", username ), limit( 1 ) );
	// execute the query to retrieve the results
	const userQuerySnapshot = await getDocs( userQuery );
	// return the first result
	return userQuerySnapshot.docs[0];
}

/* export async function getUserPosts( userID: string )
{
	let posts = null;
	
	const postsQuery = query( collection( firestore, `users/${userID}/posts` ), 
      where("published", "==", true), 
      orderBy("createdAt", "desc"),
      limit(5));

	// posts = (await getDocs( postsQuery )).docs.map(postToJSON);
	posts = await getDocs( postsQuery );
	posts.docs.map(postToJSON);
	
	return posts;
} */

export function postToJSON( doc: DocumentSnapshot )
{
  const data = doc.data();

  return {
    ...data,
    createdAt: data?.createdAt.toMillis() || 0, 
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}