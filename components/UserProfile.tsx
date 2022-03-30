import { User } from "firebase/auth";
import React from 'react'


interface UserProfileProps extends User {
  username: string;
}

type UserProfilePageProps = {
  user: UserProfileProps;
}

export default function UserProfile({ user }: UserProfilePageProps ) {
  return (
    <div className="box-center">
      <img src={ user?.photoURL! } alt="user profile photo" className="card-img-center"/>
      <p>
        <i>@{ user?.username }</i>
      </p>
      <h1>{ user?.displayName || 'Anonymous User'}</h1>
    </div>
  )
}
