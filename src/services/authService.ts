import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  reload,
  type ConfirmationResult,
  type User,
  type AuthError,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { saveUserProfileToDb } from './dbService';

/**
 * Global RecaptchaVerifier cache to prevent multiple initializations on the same DOM element.
 */
let cachedRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Formats and normalizes a Bangladesh phone number to E.164 (+880XXXXXXXXXX).
 * Accepts: "01712345678", "1712345678", "+8801712345678", "8801712345678", "017 1234 5678"
 */
export function formatBangladeshPhoneNumber(raw: string): string {
  // Remove all non-digit and non-+ characters
  let cleaned = raw.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+880')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('880')) {
    cleaned = cleaned.substring(3);
  }

  // Remove leading 0 if present (e.g., 01712345678 -> 1712345678)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Bangladesh mobile numbers start with 1 (operators: 13, 14, 15, 16, 17, 18, 19) and are 10 digits without leading 0
  return `+880${cleaned}`;
}

/**
 * Validates whether the given phone number is a valid Bangladesh mobile format.
 */
export function isValidBangladeshPhoneNumber(raw: string): boolean {
  const formatted = formatBangladeshPhoneNumber(raw);
  // Must match +8801[3-9]\d{8}
  return /^\+8801[3-9]\d{8}$/.test(formatted);
}

/**
 * Maps Firebase Auth error codes into clear, user-friendly messages.
 */
export function mapFirebaseAuthError(error: unknown): string {
  if (!error) {
    return 'An unexpected authentication error occurred. Please try again.';
  }

  if (typeof error === 'string') {
    return error;
  }

  const authError = error as AuthError;
  const errorCode = authError.code || (error as any)?.code || (error as any)?.name;

  switch (errorCode) {
    // Email / Password Errors
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email or phone number.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify and try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is currently disabled in your Firebase Console. Please enable Phone or Email authentication.';

    // Action Code & Password Reset Errors
    case 'auth/invalid-action-code':
      return 'The verification or password reset link is invalid or has already been used. Please request a new link.';
    case 'auth/expired-action-code':
      return 'The verification or password reset link has expired. Please request a new link.';

    // Phone / OTP / reCAPTCHA Errors
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format. Please enter a valid 11-digit mobile number (e.g. 01712345678).';
    case 'auth/missing-phone-number':
      return 'Please provide a valid phone number.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for today. Please try again later or sign in with email.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please try again.';
    case 'auth/invalid-verification-code':
      return 'Incorrect 6-digit OTP. Please check the code sent via SMS and try again.';
    case 'auth/code-expired':
      return 'The OTP has expired. Please request a new SMS code.';
    case 'auth/session-expired':
      return 'The verification session has expired. Please request a new OTP.';
    case 'auth/missing-verification-code':
      return 'Please enter the 6-digit OTP code.';

    // General Auth & Domain Errors
    case 'auth/unauthorized-domain': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      return `Domain unauthorized: "${currentHost}" is not in your Firebase Authorized Domains list. Please add "${currentHost}" to Firebase Console > Authentication > Settings > Authorized domains.`;
    }
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/too-many-requests':
      return 'Too many requests sent. Access is temporarily restricted. Please wait a few moments and try again.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to perform this sensitive action.';
    default:
      if (authError.message) {
        return errorCode ? `${authError.message} (${errorCode})` : authError.message;
      }
      return 'Authentication failed. Please try again.';
  }
}

/**
 * Purges and resets any active reCAPTCHA verifier instance, removes grecaptcha artifacts,
 * and recreates the DOM container node so that subsequent OTP verification requests never collide.
 */
export function clearRecaptchaVerifier(containerId: string = 'recaptcha-container'): void {
  if (typeof window === 'undefined') return;

  // 1. Clear the Firebase RecaptchaVerifier instance
  if (cachedRecaptchaVerifier) {
    try {
      cachedRecaptchaVerifier.clear();
    } catch {
      // ignore cleanup errors
    }
    cachedRecaptchaVerifier = null;
  }

  // 2. Remove window references and reset grecaptcha if available
  try {
    if (typeof (window as any).grecaptcha !== 'undefined' && typeof (window as any).grecaptcha.reset === 'function') {
      try {
        (window as any).grecaptcha.reset();
      } catch {}
    }
    delete (window as any).recaptchaVerifier;
    delete (window as any).recaptchaWidgetId;
  } catch {}

  // 3. Clear container contents safely without detaching the node from the React tree
  try {
    const el = document.getElementById(containerId);
    if (el) {
      el.innerHTML = '';
    }

    // 4. Remove any floating or orphaned reCAPTCHA badge iframes
    const badges = document.querySelectorAll('.grecaptcha-badge');
    badges.forEach((badge) => {
      try {
        badge.parentNode?.removeChild(badge);
      } catch {}
    });
  } catch (e) {
    console.warn('Error clearing reCAPTCHA container DOM:', e);
  }
}

/**
 * Initializes a pristine Firebase RecaptchaVerifier instance.
 * Ensures any previous widget in the DOM container is completely cleared before initialization.
 */
export function getOrCreateRecaptchaVerifier(
  containerIdOrElement: string | HTMLElement = 'recaptcha-container',
  size: 'invisible' | 'normal' = 'invisible'
): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA cannot be initialized in a non-browser environment.');
  }

  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure VITE_FIREBASE_* variables in your environment.');
  }

  const containerId = typeof containerIdOrElement === 'string' ? containerIdOrElement : 'recaptcha-container';

  // Always fully purge prior verifier and DOM node before instantiating a new one
  clearRecaptchaVerifier(containerId);

  // Ensure fresh container element exists in the DOM
  let targetContainer: HTMLElement;
  const existingEl = document.getElementById(containerId);
  if (existingEl) {
    targetContainer = existingEl;
  } else if (typeof containerIdOrElement !== 'string' && containerIdOrElement instanceof HTMLElement) {
    targetContainer = containerIdOrElement;
  } else {
    const createdEl = document.createElement('div');
    createdEl.id = containerId;
    createdEl.style.display = 'none';
    document.body.appendChild(createdEl);
    targetContainer = createdEl;
  }

  const verifier = new RecaptchaVerifier(auth, targetContainer, {
    size,
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Response expired
      clearRecaptchaVerifier(containerId);
    },
  });

  cachedRecaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends an SMS verification OTP to a given phone number.
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure VITE_FIREBASE_* variables in your environment.');
  }

  const formattedPhone = formatBangladeshPhoneNumber(phoneNumber);
  if (!isValidBangladeshPhoneNumber(phoneNumber)) {
    throw new Error('Please enter a valid 11-digit Bangladesh mobile number (e.g. 01712345678).');
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    return confirmationResult;
  } catch (error) {
    // If sending fails, clear the verifier so a retry can initialize cleanly
    clearRecaptchaVerifier();
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Verifies the SMS OTP and signs the user in.
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string,
  displayName?: string
): Promise<User> {
  if (!otpCode || otpCode.trim().length < 6) {
    throw new Error('Please enter the complete 6-digit verification code.');
  }

  try {
    const userCredential = await confirmationResult.confirm(otpCode.trim());
    const user = userCredential.user;

    if (displayName && displayName.trim()) {
      await updateProfile(user, {
        displayName: displayName.trim(),
      });
    }

    // Purge reCAPTCHA verifier after successful verification
    clearRecaptchaVerifier();

    return user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Register a new user with email, password, and optional full name.
 * Automatically saves profile to Firestore and sends official Firebase email verification.
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure VITE_FIREBASE_* variables in your environment.');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const trimmedName = displayName?.trim() || '';
    if (trimmedName) {
      try {
        await updateProfile(user, {
          displayName: trimmedName,
        });
      } catch (profileErr) {
        console.warn('Could not update user profile display name:', profileErr);
      }
    }

    // Save user profile structure to Firestore
    try {
      await saveUserProfileToDb({
        uid: user.uid,
        displayName: trimmedName || user.email?.split('@')[0] || 'Customer',
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } catch (dbErr) {
      console.warn('Could not sync user profile to DB:', dbErr);
    }

    // Immediately send official Firebase email verification
    try {
      await sendEmailVerification(user);
    } catch (verifErr) {
      console.warn('Initial sendEmailVerification warning:', verifErr);
    }

    return user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Sign in with email and password, reloading latest verification status.
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure VITE_FIREBASE_* variables in your environment.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Reload latest user state to ensure emailVerified is up to date
    try {
      await reload(user);
    } catch {
      // Ignore reload transient errors
    }

    return auth.currentUser || user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Reloads the current user state directly from Firebase Authentication servers.
 */
export async function reloadUser(targetUser?: User | null): Promise<User | null> {
  const user = targetUser || auth.currentUser;
  if (!user) return null;

  try {
    await reload(user);
    return auth.currentUser;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Optional Google Sign-In helper.
 */
export async function loginWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure VITE_FIREBASE_* variables in your environment.');
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Sign out current user.
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Send password reset email using Firebase Authentication's official method.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure VITE_FIREBASE_* variables in your environment.');
  }

  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Send official Firebase email verification link.
 */
export async function sendUserEmailVerification(targetUser?: User | null): Promise<void> {
  const user = targetUser || auth.currentUser;
  if (!user) {
    throw new Error('No active user account found. Please sign in with your email and password first.');
  }

  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    console.error('Firebase sendEmailVerification error:', error);
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Verifies a password reset oobCode and retrieves the associated account email address.
 */
export async function verifyResetCode(oobCode: string): Promise<string> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }
  try {
    const email = await verifyPasswordResetCode(auth, oobCode);
    return email;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Confirms and executes password reset using Firebase Authentication's official method.
 */
export async function confirmNewPassword(oobCode: string, newPassword: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Applies email verification action code (oobCode) from email verification link.
 */
export async function applyEmailVerification(oobCode: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }
  try {
    await applyActionCode(auth, oobCode);
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
      } catch {}
    }
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Determines whether a user is an Email/Password user (requiring email verification)
 * versus a Google Sign-In or Phone/OTP user (which are inherently verified).
 */
export function isEmailPasswordUser(user: User | null): boolean {
  if (!user) return false;
  const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com') ?? false;
  const isPhone = user.providerData?.some((p) => p.providerId === 'phone') ?? false;
  if (isGoogle || isPhone) return false;
  const hasPassword = user.providerData?.some((p) => p.providerId === 'password') ?? false;
  return hasPassword || Boolean(user.email && !user.phoneNumber);
}

/**
 * Checks if the user is verified according to their provider type.
 * Google and Phone users are always treated as verified.
 * Email/Password users must have emailVerified === true.
 */
export function isUserVerified(user: User | null): boolean {
  if (!user) return false;
  if (!isEmailPasswordUser(user)) {
    return true; // Google / Phone users are verified
  }
  return Boolean(user.emailVerified);
}

