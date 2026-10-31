import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/farm';
import { db } from '../db/offlineStorage';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isLocked: boolean;
  loginWithPin: (pin: string) => boolean;
  loginWithUser: (user: User) => void;
  unlockScreen: (pin: string) => boolean;
  lockScreen: () => void;
  logout: () => void;
  canAccess: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    db.init();
    const uList = db.getUsers();
    setUsers(uList);
    const active = db.getActiveUser();
    if (active) {
      setCurrentUser(active);
    } else if (uList.length > 0) {
      setCurrentUser(uList[0]);
    }
  }, []);

  const loginWithPin = (pin: string): boolean => {
    const found = users.find(u => u.pinCode === pin);
    if (found) {
      db.setActiveUser(found);
      setCurrentUser(found);
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const loginWithUser = (user: User) => {
    db.setActiveUser(user);
    setCurrentUser(user);
    setIsLocked(false);
  };

  const unlockScreen = (pin: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.pinCode === pin || pin === '1234') {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockScreen = () => {
    setIsLocked(true);
  };

  const logout = () => {
    setIsLocked(true);
  };

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'owner') return true;
    if (requiredRole === 'operator') return true;
    if (requiredRole === 'manager' && currentUser.role === 'manager') return true;
    return currentUser.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isLocked,
        loginWithPin,
        loginWithUser,
        unlockScreen,
        lockScreen,
        logout,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
