import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RegisterFormData } from '../types';

// Base User interface
interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  nationalId?: string;
  birthDate?: Date;
  verifiedEmail: boolean;
  loginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended User interface with additional properties
interface ExtendedUser extends User {
  student_id: string;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  loading: boolean;
  loginAttempts: number;
  lockedUntil: Date | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<User>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [loginAttempts, setLoginAttempts] = useState<number>(0);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
      }

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (!data.user.student_id) {
        console.error('No student_id in response:', data);
        throw new Error('Invalid response from server: missing student_id');
      }

      const user: ExtendedUser = {
        id: data.user.id.toString(),
        student_id: data.user.student_id.toString(),
        username: data.user.username,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phoneNumber: data.user.phoneNumber,
        nationalId: data.user.nationalId,
        birthDate: data.user.birthDate,
        verifiedEmail: data.user.verifiedEmail,
        loginAttempts: data.user.loginAttempts,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt
      };

      console.log('Setting current user:', user); // Debug log
      setCurrentUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterFormData): Promise<User> => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: Date.now().toString(),
        username: data.email.split('@')[0], // Generate username from email
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        nationalId: data.nationalId,
        birthDate: data.birthDate,
        verifiedEmail: false,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const extendedUser: ExtendedUser = {
        ...user,
        student_id: Date.now().toString() // Generate a temporary student ID
      };
      
      setCurrentUser(extendedUser);
      localStorage.setItem('user', JSON.stringify(extendedUser));
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In production, this would send a password reset email
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      const updatedUser = {
        ...currentUser,
        verifiedEmail: true,
        updatedAt: new Date()
      };
      
      setCurrentUser(updatedUser as ExtendedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        currentUser,
        loading,
        loginAttempts,
        lockedUntil,
        login,
        register,
        logout,
        resetPassword,
        verifyEmail,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;























