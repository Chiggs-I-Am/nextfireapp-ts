import { auth, firestore } from "./firebase";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";

export function useUserData() 
{
  const [ user ] = useAuthState( auth );
  const [ username, setUsername ] = useState( null );

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if ( user ) {
      const usersCollectionRef = collection( firestore, "users" );
      const userDocRef = doc( usersCollectionRef, user.uid );
      
      unsubscribe = onSnapshot( userDocRef, ( doc ) => {
        setUsername( doc.data()?.username );
      });
    } else {
      setUsername( null );
    }

    return unsubscribe;

  }, [user]);

  return { user, username };
}
