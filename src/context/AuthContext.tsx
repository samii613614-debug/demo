import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged, type User, type ConfirmationResult } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import {
  registerWithEmail as serviceRegister,
  loginWithEmail as serviceLogin,
  loginWithGoogle as serviceGoogleLogin,
  logoutUser as serviceLogout,
  sendPasswordReset as serviceResetPassword,
  sendUserEmailVerification as serviceSendVerification,
  sendEmailSignInLink as serviceSendEmailSignInLink,
  completeEmailLinkSignIn as serviceCompleteEmailLinkSignIn,
  checkIsSignInWithEmailLink as serviceCheckIsSignInWithEmailLink,
  reloadUser as serviceReloadUser,
  isEmailPasswordUser,
  isUserVerified,
  getOrCreateRecaptchaVerifier,
  clearRecaptchaVerifier,
  sendPhoneOtp as serviceSendPhoneOtp,
  verifyPhoneOtp as serviceVerifyPhoneOtp,
  loginWithPhonePassword as serviceLoginWithPhonePassword,
  registerWithPhonePassword as serviceRegisterWithPhonePassword,
  resetPhonePassword as serviceResetPhonePassword,
} from '../services/authService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  isEmailPasswordUser: boolean;
  isVerified: boolean;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<User>;
  sendEmailSignInLink: (email: string, displayName?: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string, url?: string) => Promise<User>;
  checkIsSignInWithEmailLink: (url?: string) => boolean;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginWithPhonePassword: (phoneNumber: string, password: string) => Promise<User>;
  registerWithPhonePassword: (phoneNumber: string, password: string, displayName: string, confirmationResult: ConfirmationResult, otpCode: string) => Promise<User>;
  resetPhonePassword: (phoneNumber: string, newPassword: string, confirmationResult: ConfirmationResult, otpCode: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  reloadUser: () => Promise<User | null>;
  sendPhoneOtp: (phoneNumber: string, containerIdOrElement?: string | HTMLElement) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, otpCode: string, displayName?: string) => Promise<User>;
  clearRecaptcha: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authEpoch, setAuthEpoch] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes and manage active session
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
          setAuthEpoch((prev) => prev + 1);
          setLoading(false);
        },
        (authErr) => {
          console.warn('Firebase auth state warning:', authErr);
          setError(authErr?.message || 'Authentication error');
          setLoading(false);
        }
      );
    } catch (e) {
      console.warn('Failed to initialize Firebase Auth listener:', e);
      setLoading(false);
    }

    return () => {
      try {
        unsubscribe();
      } catch {}
      try {
        clearRecaptchaVerifier();
      } catch {}
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName?: string): Promise<User> => {
      setError(null);
      try {
        const newUser = await serviceRegister(email, password, displayName);
        setUser(newUser);
        setAuthEpoch((prev) => prev + 1);
        return newUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Registration failed.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const sendEmailSignInLink = useCallback(
    async (email: string, displayName?: string): Promise<void> => {
      setError(null);
      try {
        await serviceSendEmailSignInLink(email, displayName);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to send sign-in link.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const completeEmailLinkSignIn = useCallback(
    async (email: string, url?: string): Promise<User> => {
      setError(null);
      try {
        const loggedUser = await serviceCompleteEmailLinkSignIn(email, url);
        setUser(loggedUser);
        setAuthEpoch((prev) => prev + 1);
        return loggedUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Sign in with email link failed.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const checkIsSignInWithEmailLink = useCallback((url?: string): boolean => {
    return serviceCheckIsSignInWithEmailLink(url);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<User> => {
    setError(null);
    try {
      const loggedUser = await serviceLogin(email, password);
      setUser(loggedUser);
      setAuthEpoch((prev) => prev + 1);
      return loggedUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setError(msg);
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    setError(null);
    try {
      const loggedUser = await serviceGoogleLogin();
      setUser(loggedUser);
      setAuthEpoch((prev) => prev + 1);
      return loggedUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await serviceLogout();
      setUser(null);
      setAuthEpoch((prev) => prev + 1);
      clearRecaptchaVerifier();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Logout failed.';
      setError(msg);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setError(null);
    try {
      await serviceResetPassword(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Password reset request failed.';
      setError(msg);
      throw err;
    }
  }, []);

  const sendVerificationEmail = useCallback(async (): Promise<void> => {
    setError(null);
    const targetUser = auth.currentUser || user;
    if (!targetUser) {
      throw new Error('No active user account found. Please sign in first to send a verification link.');
    }
    try {
      await serviceSendVerification(targetUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Email verification failed.';
      setError(msg);
      throw err;
    }
  }, [user]);

  const sendPhoneOtp = useCallback(
    async (phoneNumber: string, containerIdOrElement: string | HTMLElement = 'recaptcha-container'): Promise<ConfirmationResult> => {
      setError(null);
      try {
        const appVerifier = getOrCreateRecaptchaVerifier(containerIdOrElement, 'invisible');
        const confirmation = await serviceSendPhoneOtp(phoneNumber, appVerifier);
        return confirmation;
      } catch (err) {
        clearRecaptchaVerifier();
        const msg = err instanceof Error ? err.message : 'Failed to send SMS code.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const verifyPhoneOtp = useCallback(
    async (confirmationResult: ConfirmationResult, otpCode: string, displayName?: string): Promise<User> => {
      setError(null);
      try {
        const verifiedUser = await serviceVerifyPhoneOtp(confirmationResult, otpCode, displayName);
        setUser(verifiedUser);
        setAuthEpoch((prev) => prev + 1);
        return verifiedUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Invalid verification code.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const loginWithPhonePassword = useCallback(async (phoneNumber: string, password: string): Promise<User> => {
    setError(null);
    try {
      const loggedUser = await serviceLoginWithPhonePassword(phoneNumber, password);
      setUser(loggedUser);
      setAuthEpoch((prev) => prev + 1);
      return loggedUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Phone login failed.';
      setError(msg);
      throw err;
    }
  }, []);

  const registerWithPhonePassword = useCallback(
    async (
      phoneNumber: string,
      password: string,
      displayName: string,
      confirmationResult: ConfirmationResult,
      otpCode: string
    ): Promise<User> => {
      setError(null);
      try {
        const newUser = await serviceRegisterWithPhonePassword(
          phoneNumber,
          password,
          displayName,
          confirmationResult,
          otpCode
        );
        setUser(newUser);
        setAuthEpoch((prev) => prev + 1);
        return newUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Phone registration failed.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const resetPhonePassword = useCallback(
    async (
      phoneNumber: string,
      newPassword: string,
      confirmationResult: ConfirmationResult,
      otpCode: string
    ): Promise<void> => {
      setError(null);
      try {
        await serviceResetPhonePassword(phoneNumber, newPassword, confirmationResult, otpCode);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Password reset failed.';
        setError(msg);
        throw err;
      }
    },
    []
  );

  const reloadUser = useCallback(async (): Promise<User | null> => {
    setError(null);
    const targetUser = auth.currentUser || user;
    if (!targetUser) {
      return null;
    }
    try {
      const refreshed = await serviceReloadUser(targetUser);
      const activeUser = refreshed || auth.currentUser;
      if (activeUser) {
        setUser(activeUser);
        setAuthEpoch((prev) => prev + 1);
      }
      return activeUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh user state.';
      setError(msg);
      throw err;
    }
  }, [user]);

  const clearRecaptcha = useCallback(() => {
    clearRecaptchaVerifier();
  }, []);

  const isEmailPassword = useMemo(() => isEmailPasswordUser(user), [user, authEpoch]);
  const isVerified = useMemo(() => isUserVerified(user), [user, authEpoch]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,
      isConfigured: isFirebaseConfigured,
      isEmailPasswordUser: isEmailPassword,
      isVerified,
      registerWithEmail,
      sendEmailSignInLink,
      completeEmailLinkSignIn,
      checkIsSignInWithEmailLink,
      loginWithEmail,
      loginWithGoogle,
      loginWithPhonePassword,
      registerWithPhonePassword,
      resetPhonePassword,
      logout,
      resetPassword,
      sendVerificationEmail,
      reloadUser,
      sendPhoneOtp,
      verifyPhoneOtp,
      clearRecaptcha,
      clearError,
    }),
    [
      user,
      loading,
      error,
      isEmailPassword,
      isVerified,
      registerWithEmail,
      sendEmailSignInLink,
      completeEmailLinkSignIn,
      checkIsSignInWithEmailLink,
      loginWithEmail,
      loginWithGoogle,
      loginWithPhonePassword,
      registerWithPhonePassword,
      resetPhonePassword,
      logout,
      resetPassword,
      sendVerificationEmail,
      reloadUser,
      sendPhoneOtp,
      verifyPhoneOtp,
      clearRecaptcha,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access the Firebase Auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
