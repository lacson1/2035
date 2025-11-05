import React, { createContext, useContext } from "react";
import { User } from "../types";
import { useAuth } from "./AuthContext";

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * UserProvider - Provides user context from AuthContext
 * This is a wrapper around AuthContext to maintain compatibility
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout: authLogout } = useAuth();

  const setUser = (user: User) => {
    // User is managed by AuthContext, this is just for compatibility
    // In practice, user should be set through AuthContext login
  };

  const logout = async () => {
    await authLogout();
  };

  return (
    <UserContext.Provider
      value={{
        currentUser: user,
        setCurrentUser: setUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

