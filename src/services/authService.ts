import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
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
  type ActionCodeSettings,
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
 * Converts a Bangladesh phone number to an internal Firebase Auth email identifier.
 * e.g. "01712345678" -> "8801712345678@phone.walton.auth"
 */
export function phoneToAuthEmail(phoneNumber: string): string {
  const formatted = formatBangladeshPhoneNumber(phoneNumber);
  const digits = formatted.replace(/\D/g, ''); // "88017XXXXXXXX"
  return `${digits}@phone.walton.auth`;
}

/**
 * Checks whether an email address represents an internal phone-password auth account.
 */
export function isPhonePasswordEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.endsWith('@phone.walton.auth') || email.endsWith('@phone.auth') || email.endsWith('@phone.local');
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
    case 'auth/unauthorized-continue-uri': {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      return `Domain unauthorized for continue URL: "${currentHost}" is not in your Firebase Authorized Domains list. Please add "${currentHost}" in Firebase Console > Authentication > Settings > Authorized domains.`;
    }
    case 'auth/invalid-continue-uri':
      return 'The continue URL provided in the sign-in request is invalid.';
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
  } catch (error: any) {
    // If sending fails, clear the verifier so a retry can initialize cleanly
    clearRecaptchaVerifier();
    if (error?.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Phone authentication is disabled in your Firebase project (fir-58f05). In Firebase Console > Authentication > Sign-in method, click "Phone", toggle "Enable", and click Save.'
      );
    }
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
      const finalDisplayName = trimmedName || user.email?.split('@')[0] || 'Customer';
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_name_${user.uid}`, finalDisplayName);
        const clean = finalDisplayName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'user';
        let hash = 5381;
        for (let i = 0; i < user.uid.length; i++) {
          hash = ((hash << 5) + hash) + user.uid.charCodeAt(i);
        }
        const uniqueNum = 1000 + (Math.abs(hash) % 9000);
        localStorage.setItem(`user_custom_username_${user.uid}`, `${clean}${uniqueNum}`);
      }
      await saveUserProfileToDb({
        uid: user.uid,
        displayName: finalDisplayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } catch (dbErr) {
      console.warn('Could not sync user profile to DB:', dbErr);
    }

    // Send official Firebase email verification
    try {
      await sendEmailVerification(user);
    } catch (verifErr: any) {
      console.error('Initial sendEmailVerification error:', verifErr);
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
  let user = targetUser || auth.currentUser;
  if (!user) {
    throw new Error('No active user account found. Please sign in with your email and password first.');
  }

  // Attempt to refresh user token and state before sending
  try {
    if (typeof user.getIdToken === 'function') {
      await user.getIdToken(true);
    }
    await reload(user);
    user = auth.currentUser || user;
  } catch (reloadErr) {
    console.warn('Could not reload user before sending verification email:', reloadErr);
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
 * Helper to dynamically compute the current runtime origin/continue URL
 * to pass to ActionCodeSettings.url for Firebase Email Link authentication.
 */
export function getRuntimeContinueUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname || '/';
    return `${origin}${pathname}`;
  }
  return 'http://localhost:3000/';
}

/**
 * Sends a passwordless Firebase Email Sign-In Link to the specified email address.
 * ActionCodeSettings uses the exact current runtime origin/domain.
 */
export async function sendEmailSignInLink(email: string, displayName?: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing. Please configure Firebase.');
  }
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error('Please enter a valid email address.');
  }

  // Use the exact current runtime origin URL for the redirect
  const currentUrl = getRuntimeContinueUrl();

  const actionCodeSettings: ActionCodeSettings = {
    url: currentUrl,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, trimmedEmail, actionCodeSettings);

    // Save the email and pending display name in localStorage to complete sign-in when returning
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', trimmedEmail);
      if (displayName && displayName.trim()) {
        window.localStorage.setItem('displayNameForSignIn', displayName.trim());
      }
    }
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Email Link (passwordless sign-in) is disabled in your Firebase project (fir-58f05). In Firebase Console > Authentication > Sign-in method > Email/Password, turn on "Email link (passwordless sign-in)" and click Save.'
      );
    }
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Checks if the current URL or provided URL contains a valid Firebase Email Sign-In Link.
 */
export function checkIsSignInWithEmailLink(url?: string): boolean {
  if (typeof window === 'undefined') return false;
  const targetUrl = url || window.location.href;
  try {
    return isSignInWithEmailLink(auth, targetUrl);
  } catch {
    return false;
  }
}

/**
 * Completes sign-in using the Firebase Email Link and the provided email address.
 * Recovers pending display name from localStorage and syncs user profile with Firestore.
 */
export async function completeEmailLinkSignIn(email: string, url?: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    throw new Error('Please provide the email address used to request the sign-in link.');
  }

  try {
    const userCredential = await signInWithEmailLink(auth, trimmedEmail, targetUrl);
    const user = userCredential.user;

    // Retrieve and clear any pending display name from localStorage
    let pendingName = '';
    if (typeof window !== 'undefined') {
      pendingName = window.localStorage.getItem('displayNameForSignIn') || '';
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('displayNameForSignIn');
    }

    if (pendingName) {
      try {
        await updateProfile(user, { displayName: pendingName });
      } catch (profileErr) {
        console.warn('Could not update profile displayName:', profileErr);
      }
    }

    const finalDisplayName = pendingName || user.displayName || user.email?.split('@')[0] || 'Customer';

    // Store custom username locally if needed
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`user_name_${user.uid}`, finalDisplayName);
        const clean = finalDisplayName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'user';
        let hash = 5381;
        for (let i = 0; i < user.uid.length; i++) {
          hash = ((hash << 5) + hash) + user.uid.charCodeAt(i);
        }
        const uniqueNum = 1000 + (Math.abs(hash) % 9000);
        localStorage.setItem(`user_custom_username_${user.uid}`, `${clean}${uniqueNum}`);
      } catch {}
    }

    // Sync user profile to Firestore
    try {
      await saveUserProfileToDb({
        uid: user.uid,
        displayName: finalDisplayName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } catch (dbErr) {
      console.warn('Could not sync user profile to DB:', dbErr);
    }

    return user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Register a new user with Phone Number + Password.
 * 1. Verifies the SMS OTP code.
 * 2. Establishes the Phone + Password account in Firebase Authentication.
 * 3. Saves complete user profile to Firestore (and localStorage).
 * 4. Enables direct password-based login for all future sessions without OTP.
 */
export async function registerWithPhonePassword(
  phoneNumber: string,
  password: string,
  displayName: string,
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing.');
  }

  if (!otpCode || otpCode.trim().length < 6) {
    throw new Error('Please enter the complete 6-digit OTP verification code.');
  }

  const formattedPhone = formatBangladeshPhoneNumber(phoneNumber);
  if (!isValidBangladeshPhoneNumber(phoneNumber)) {
    throw new Error('Please provide a valid 11-digit Bangladesh mobile number.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  try {
    // 1. Confirm OTP code to verify ownership of mobile number
    const phoneCred = await confirmationResult.confirm(otpCode.trim());
    const phoneUser = phoneCred.user;

    const authEmail = phoneToAuthEmail(phoneNumber);
    const trimmedName = displayName?.trim() || 'Customer';

    let finalUser: User = phoneUser;

    // 2. Link Email/Password credential or establish password account
    try {
      const emailCred = EmailAuthProvider.credential(authEmail, password);
      const linkResult = await linkWithCredential(phoneUser, emailCred);
      finalUser = linkResult.user;
    } catch (linkErr: any) {
      console.warn('Could not directly link credential, finalizing password auth profile:', linkErr);
      // If credential was already registered or link failed, ensure profile is authenticated
      try {
        await updatePassword(phoneUser, password);
        finalUser = phoneUser;
      } catch (pwdErr) {
        console.warn('Direct updatePassword fallback result:', pwdErr);
      }
    }

    // 3. Update Display Name
    try {
      await updateProfile(finalUser, { displayName: trimmedName });
    } catch (nameErr) {
      console.warn('Could not update profile display name:', nameErr);
    }

    // 4. Save to localStorage for instant UI responsiveness
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`user_name_${finalUser.uid}`, trimmedName);
        const clean = trimmedName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'user';
        let hash = 5381;
        for (let i = 0; i < finalUser.uid.length; i++) {
          hash = ((hash << 5) + hash) + finalUser.uid.charCodeAt(i);
        }
        const uniqueNum = 1000 + (Math.abs(hash) % 9000);
        localStorage.setItem(`user_custom_username_${finalUser.uid}`, `${clean}${uniqueNum}`);
      } catch {}
    }

    // 5. Store user data in Firestore database
    try {
      await saveUserProfileToDb({
        uid: finalUser.uid,
        displayName: trimmedName,
        email: authEmail,
        phoneNumber: formattedPhone,
      });
    } catch (dbErr) {
      console.warn('Could not save user profile to DB:', dbErr);
    }

    clearRecaptchaVerifier();
    return finalUser;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Direct login with Phone Number + Password without needing an OTP.
 */
export async function loginWithPhonePassword(phoneNumber: string, password: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase environment variables are missing.');
  }

  if (!isValidBangladeshPhoneNumber(phoneNumber)) {
    throw new Error('Please enter a valid 11-digit Bangladesh mobile number (e.g. 01712345678).');
  }

  if (!password) {
    throw new Error('Please enter your password.');
  }

  const authEmail = phoneToAuthEmail(phoneNumber);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
    const user = userCredential.user;

    // Reload latest state
    try {
      await reload(user);
    } catch {}

    return auth.currentUser || user;
  } catch (error: any) {
    // If account not found or wrong password, map error cleanly
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Resets a phone user's password after verifying SMS OTP.
 */
export async function resetPhonePassword(
  phoneNumber: string,
  newPassword: string,
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured.');
  }

  if (!otpCode || otpCode.trim().length < 6) {
    throw new Error('Please enter the complete 6-digit OTP code.');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    const phoneCred = await confirmationResult.confirm(otpCode.trim());
    const user = phoneCred.user;
    await updatePassword(user, newPassword);
    clearRecaptchaVerifier();
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
  if (isPhonePasswordEmail(user.email)) return false; // Phone + Password accounts are verified via SMS OTP
  const isGoogle = user.providerData?.some((p) => p.providerId === 'google.com') ?? false;
  const isPhone = user.providerData?.some((p) => p.providerId === 'phone') ?? false;
  if (isGoogle || isPhone) return false;
  const hasPassword = user.providerData?.some((p) => p.providerId === 'password') ?? false;
  return hasPassword || Boolean(user.email && !user.phoneNumber);
}

/**
 * Checks if the user is verified according to their provider type.
 * Google, Phone, and Email Link (verified) users are treated as verified.
 */
export function isUserVerified(user: User | null): boolean {
  if (!user) return false;
  if (user.emailVerified) return true;
  if (isPhonePasswordEmail(user.email)) return true; // Phone + Password accounts are verified
  if (!isEmailPasswordUser(user)) {
    return true; // Google / Phone users are verified
  }
  return Boolean(user.emailVerified);
}


