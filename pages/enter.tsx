import { signInWithPopup } from "firebase/auth"
import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { FormEventHandler, useCallback, useContext, useEffect, useState } from 'react'
import { UserContext } from "@libs/context";
import { auth, googleAuthProvider, firestore } from "@libs/firebase";
import debounce from "lodash.debounce";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function EnterPage () {
  const { user, username } = useContext( UserContext );
  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, and has username <SignOutButton />
  return (
    <main>
      { user ? // <-- if user is signed in
        !username ? <UsernameForm /> : <SignOutButton /> // <--- check for username --> show UsernameForm else show SignOutButton
        : <SignInButton /> // <-- if user is not signed in --> show SignInButton
      }
    </main>
  )
}


// Sign in with Google button
function SignInButton() 
{
  // TIP: wrap function in try/catch block to prevent errors from breaking the app
  const signInWithGoogle = async () => {
    await signInWithPopup( auth, googleAuthProvider);
  }

  return (
    <div>
      <button className="btn-google" onClick={ signInWithGoogle }>
        <img src={"/google.png"} /> Sign in with Google
      </button>
    </div>
  )
}

// Sign out button
function SignOutButton() 
{
  return (
    <div>
      <button onClick={ () => auth.signOut() }>
        Sign out
      </button>
    </div>
  )
}

function UsernameForm()
{
  const [ formValue, setFormValue ] = useState<string>("");
  const [ isValid, setIsValid ] = useState<boolean>(false);
  const [ loading, setLoading ] = useState<boolean>(false);

  const { user, username } = useContext( UserContext );
  const router = useRouter();


  useEffect( () => {
    checkUsername( formValue );

  }, [formValue]);

  const onChange = (name: string) => {
    // Force the value typed in form to match correct format
    const value = name.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if( value.length < 3 ) {
      setFormValue( value );
      setLoading( false );
      setIsValid( false );
    }

    if( re.test(value) ) {
      setFormValue( value );
      setLoading( true );
      setIsValid( false );
    }
  };

  const checkUsername = useCallback(
    debounce( async ( name: string ) => {
      if( name.length >= 3 ) {
        const usersCollectionRef = collection( firestore, "users" );
        const docRef = doc( usersCollectionRef, name );
        const docSnap = await getDoc( docRef );
        const exists = docSnap.exists();

        console.log("Firestore read executed!");

        setIsValid( !exists );
        setLoading( false );
      }
    }, 500), []);

  const onSubmit: FormEventHandler = async (event) => {
    event.preventDefault();

    const username = formValue;
    // TIP: wrap in try/catch block to prevent errors from breaking the app
    // create refs for both documents
    const usersCollectionRef = collection( firestore, "users" );
    const userDocRef = doc( usersCollectionRef, user?.uid );
    const usernamesCollectionRef = collection( firestore, "usernames" );
    const usernameDocRef = doc( usernamesCollectionRef, username );

    // commit both docs together as a batch write
    const batch = writeBatch( firestore );
    batch.set( userDocRef, { username, photoURL: user?.photoURL, displayName: user?.displayName } );
    batch.set( usernameDocRef, { uid: user?.uid } );
    
    await batch.commit();

    // show user created successfully
    toast.success("Username created successfully!");

    // redirect to home page
    router.push( "/" );
  };

  return (
    <>
      { !username && (
        <section>
          <h3>Choose Username</h3>

          <form onSubmit={ onSubmit }>
            <input 
              name="username" 
              placeholder="username"
              value={ formValue }
              onChange={ (e) => onChange( e.target.value ) } />

            <UsernameMessage username={ formValue} isValid={ isValid } loading={ loading } />

            <button type="submit" disabled={ !isValid }>
              Submit
            </button>

            <h3>Debug State</h3>
            <div>
              Username: { formValue }
              <br />
              Loading: { loading.toString() }
              <br />
              Username Valid: { isValid.toString() }
            </div>
          </form>

        </section>
      )}
    </>
  )
}

interface UsernameMessageProps
{
  username: string;
  isValid: boolean;
  loading: boolean;
}

function UsernameMessage({ username, isValid, loading }: UsernameMessageProps )
{
  if( loading ) {
    return <p>Checking...</p>;
  } 
  else if( isValid ) {
    return <p className="text-success">{ username } is available!</p>;
  } 
  else if( username && !isValid ) {
    return <p >That username is taken!</p>;
  } 
  else {
    return <p></p>;
  }
}



