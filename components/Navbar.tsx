import Image from "next/image";
import Link from "next/link";
import { useContext } from 'react';
import { UserContext } from "@libs/context";

// Top Navbar

export default function Navbar() 
{
  const { user, username } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <Link href="/" passHref>
          <button className="btn-logo">FEED</button>
        </Link>

        {/* user is signed-in and has username */}
        { username && (
          <>
            <li className="push-left">
              <Link href="/admin" passHref>
                <button className="btn-blue">Write Post</button>
              </Link>
            </li>
            <li>
              <Link href={ `/${username}` } passHref>
                {/* <Image 
                  src={ user?.photoURL! } // non-null assertion operator (!) to force type-checking of user.photoURL to be non-null 
                  alt="user-profile-pic"
                  width={ 50 }
                  height={ 50 }
                /> */}
                <img src={ user?.photoURL! } />
              </Link>
            </li>
          </>
        )}

        {/* user is not signed-in OR has not created a username */}
        { !username && (
            <li>
              <Link href="/enter" passHref>
                <button className="btn-blue">Log in</button>
              </Link>
            </li>
        )}
      </ul>
    </nav>
  )
}
