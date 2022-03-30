import { User } from "firebase/auth";
import { createContext } from "react";

// const user: any = {} as User;
// const username: string | null = null;

type UserContextProps = {
  user: User | null | undefined;
  username: string | null;
};

export const UserContext = createContext<UserContextProps>({ user: null, username: null });