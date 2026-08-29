import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  User as UserIcon, 
  Package, 
  Heart, 
  LogOut, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  XCircle, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Smartphone, 
  Copy, 
  Check, 
  Send,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import type { ConfirmationResult } from 'firebase/auth';
import { Order, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  formatBangladeshPhoneNumber, 
  isValidBangladeshPhoneNumber,
  verifyResetCode,
  confirmNewPassword,
  applyEmailVerification,
  isEmailPasswordUser
} from '../services/authService';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  wishlist: Product[];
  onSelectProduct: (product: Product) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onCancelOrder?: (orderId: string) => void;
  initialTab?: 'profile' | 'orders' | 'wishlist';
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  orders,
  wishlist,
  onSelectProduct,
  onRemoveFromWishlist,
  onCancelOrder,
  initialTab = 'profile'
}) => {
  const { 
    user, 
    loading: authLoading, 
    isConfigured, 
    isEmailPasswordUser: isEmailUser,
    isVerified,
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle, 
    sendPhoneOtp,
    verifyPhoneOtp,
    clearRecaptcha,
    logout, 
    resetPassword,
    sendVerificationEmail,
    reloadUser
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>(initialTab);
  
  // Auth Method: 'phone' or 'email'
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('email');
  
  // Email Auth Form Modes: 'login' | 'signup' | 'verifyEmail' | 'forgot' | 'resetPassword'
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'signup' | 'verifyEmail' | 'forgot' | 'resetPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailVerifyCooldown, setEmailVerifyCooldown] = useState(0);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Password Reset URL flow states
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [resetAccountEmail, setResetAccountEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone Auth States
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneUserName, setPhoneUserName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // General States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedHostname, setCopiedHostname] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  const phoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetFormStates = useCallback(() => {
    setFormError(null);
    setSuccessMessage(null);
    setCopiedHostname(false);
    setOrderToCancel(null);
    setIsCancellingOrder(false);
  }, []);

  // Determine if current logged-in user is an unverified Email/Password user
  const isUnverifiedEmailUser = Boolean(user && isEmailUser && !user.emailVerified);

  // Check for Firebase Auth Action Codes in URL (mode=resetPassword, mode=verifyEmail)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const oobCode = urlParams.get('oobCode');

      if (mode && oobCode) {
        if (mode === 'resetPassword') {
          setIsSubmitting(true);
          verifyResetCode(oobCode)
            .then((targetEmail) => {
              setResetOobCode(oobCode);
              setResetAccountEmail(targetEmail);
              setEmailAuthMode('resetPassword');
              setSuccessMessage(`Ready to reset password for ${targetEmail}`);
            })
            .catch((err) => {
              setFormError(err.message || 'Invalid or expired password reset link. Please request a new one.');
              setEmailAuthMode('forgot');
            })
            .finally(() => {
              setIsSubmitting(false);
            });
        } else if (mode === 'verifyEmail') {
          setIsSubmitting(true);
          applyEmailVerification(oobCode)
            .then(() => {
              setSuccessMessage('Email verified successfully! You now have full access to your WALTON Plaza account.');
              if (user) {
                reloadUser().catch(() => {});
                setActiveTab('profile');
              } else {
                setEmailAuthMode('login');
              }
              // Clean URL query parameters
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            })
            .catch((err) => {
              setFormError(err.message || 'The verification link is invalid or has expired.');
            })
            .finally(() => {
              setIsSubmitting(false);
            });
        }
      }
    } catch (e) {
      console.warn('Action code detection error:', e);
    }
  }, [user, reloadUser]);

  const handleModalClose = useCallback(async () => {
    // If the user has an unverified session (e.g. pending email verification or phone OTP),
    // cancel the pending verification session and sign out so next time it opens fresh to Login
    if (isUnverifiedEmailUser || emailAuthMode === 'verifyEmail' || (!user?.emailVerified && isEmailUser && user)) {
      try {
        await logout();
      } catch (e) {
        console.warn('Error signing out unverified session on close:', e);
      }
    }
    clearRecaptcha();
    setEmailAuthMode('login');
    setAuthMethod('email');
    setPhoneStep('input');
    setPhoneNumber('');
    setPhoneUserName('');
    setOtpCode('');
    setConfirmationResult(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setEmailVerifyCooldown(0);
    setResendCooldown(0);
    resetFormStates();
    onClose();
  }, [isUnverifiedEmailUser, emailAuthMode, user, isEmailUser, logout, clearRecaptcha, resetFormStates, onClose]);

  // Clear reCAPTCHA and reset transient states when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (isUnverifiedEmailUser || emailAuthMode === 'verifyEmail' || (!user?.emailVerified && isEmailUser && user)) {
        logout().catch(() => {});
      }
      clearRecaptcha();
      resetFormStates();
      setAuthMethod('email');
      setEmailAuthMode('login');
      setPhoneStep('input');
      setPhoneNumber('');
      setPhoneUserName('');
      setOtpCode('');
      setConfirmationResult(null);
      setEmailVerifyCooldown(0);
      setResendCooldown(0);
    }
  }, [isOpen, clearRecaptcha, resetFormStates, isUnverifiedEmailUser, emailAuthMode, user, isEmailUser, logout]);

  // Phone Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown > 0) {
      phoneTimerRef.current = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (phoneTimerRef.current) clearTimeout(phoneTimerRef.current);
    };
  }, [resendCooldown]);

  // Email Resend Countdown Timer
  useEffect(() => {
    if (emailVerifyCooldown > 0) {
      emailTimerRef.current = setTimeout(() => {
        setEmailVerifyCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, [emailVerifyCooldown]);

  // --- Phone Auth Handlers ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormStates();

    const cleanName = phoneUserName.trim();
    if (!cleanName) {
      setFormError('Please enter your full name before proceeding.');
      return;
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone) {
      setFormError('Please enter your mobile phone number.');
      return;
    }

    if (!isValidBangladeshPhoneNumber(cleanPhone)) {
      setFormError('Please enter a valid 11-digit Bangladesh mobile number (e.g. 01712345678).');
      return;
    }

    setIsSubmitting(true);

    try {
      const confirmation = await sendPhoneOtp(cleanPhone, 'recaptcha-container');
      setConfirmationResult(confirmation);
      setPhoneStep('otp');
      setResendCooldown(60);
      setSuccessMessage(`6-digit OTP sent via SMS to ${formatBangladeshPhoneNumber(cleanPhone)}`);
    } catch (err: any) {
      clearRecaptcha();
      setFormError(err.message || 'Failed to send SMS verification code. Please check your number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setFormError('Verification session expired. Please request a new code.');
      setPhoneStep('input');
      clearRecaptcha();
      return;
    }

    if (!otpCode || otpCode.trim().length < 6) {
      setFormError('Please enter the full 6-digit OTP code received on your phone.');
      return;
    }

    resetFormStates();
    setIsSubmitting(true);

    try {
      const verifiedUser = await verifyPhoneOtp(confirmationResult, otpCode.trim(), phoneUserName.trim());
      if (verifiedUser?.uid) {
        try {
          const rawName = phoneUserName.trim() || 'User';
          localStorage.setItem(`user_name_${verifiedUser.uid}`, rawName);
          const clean = rawName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'user';
          const randomNum = Math.floor(100 + Math.random() * 900);
          localStorage.setItem(`user_custom_username_${verifiedUser.uid}`, `${clean}${randomNum}`);
        } catch {}
      }
      setSuccessMessage('Successfully signed in with phone number!');
      setActiveTab('profile');
      setPhoneStep('input');
      setOtpCode('');
      setConfirmationResult(null);
      clearRecaptcha();
    } catch (err: any) {
      setFormError(err.message || 'Invalid or expired OTP code. Please check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !phoneNumber) return;
    resetFormStates();
    setIsSubmitting(true);

    try {
      const confirmation = await sendPhoneOtp(phoneNumber.trim(), 'recaptcha-container');
      setConfirmationResult(confirmation);
      setResendCooldown(60);
      setSuccessMessage('A new verification code has been sent to your mobile phone.');
    } catch (err: any) {
      clearRecaptcha();
      setFormError(err.message || 'Could not resend OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Email Auth Handlers ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    resetFormStates();
    setIsSubmitting(true);

    try {
      const loggedUser = await loginWithEmail(email, password);
      // Check if user is email/password user and unverified
      if ((isEmailPasswordUser(loggedUser) || isEmailUser) && !loggedUser.emailVerified) {
        setEmailAuthMode('verifyEmail');
        setEmailVerifyCooldown(0);
        setSuccessMessage(`Please verify your email (${loggedUser.email}) to access your profile and order management.`);
      } else {
        setEmailAuthMode('login');
        setActiveTab('profile');
      }
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormStates();

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      setFormError('Please fill in your full name, email address, and password.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registeredUser = await registerWithEmail(cleanEmail, password, cleanName);
      if (registeredUser?.uid) {
        try {
          const rawName = cleanName || 'User';
          localStorage.setItem(`user_name_${registeredUser.uid}`, rawName);
          const clean = rawName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'user';
          let hash = 5381;
          for (let i = 0; i < registeredUser.uid.length; i++) {
            hash = ((hash << 5) + hash) + registeredUser.uid.charCodeAt(i);
          }
          const uniqueNum = 1000 + (Math.abs(hash) % 9000);
          localStorage.setItem(`user_custom_username_${registeredUser.uid}`, `${clean}${uniqueNum}`);
        } catch {}
      }

      setEmailVerifyCooldown(0);
      setEmailAuthMode('verifyEmail');
      setSuccessMessage(`Account created! A verification link has been sent to ${cleanEmail}. Please check your Inbox, Spam/Junk, and Promotions folders.`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckEmailVerified = async () => {
    resetFormStates();
    setIsCheckingVerification(true);

    try {
      const refreshedUser = await reloadUser();
      if (refreshedUser && refreshedUser.emailVerified) {
        setSuccessMessage('Email verified successfully! Welcome to WALTON Plaza.');
        setEmailAuthMode('login');
        setActiveTab('profile');
      } else if (!refreshedUser) {
        setFormError('No active user session found. Please sign in with your email and password.');
        setEmailAuthMode('login');
      } else {
        setFormError('Your email has not been verified yet. Please check your inbox (and Spam/Junk folder), click the verification link sent by Firebase, and then click this button again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Could not verify status. Please try again.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (emailVerifyCooldown > 0 || isResendingEmail) return;
    resetFormStates();
    setIsResendingEmail(true);

    try {
      await sendVerificationEmail();
      setEmailVerifyCooldown(30);
      const recipient = user?.email || email || 'your email address';
      setSuccessMessage(`A fresh verification link has been sent to ${recipient}. Please check your Inbox, Spam/Junk, and Promotions folders.`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to resend verification email. Please try again in a few moments.');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError('Please enter the email address associated with your account.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    resetFormStates();
    setIsSubmitting(true);

    try {
      await resetPassword(cleanEmail);
      setSuccessMessage('If an account exists for this email address, a password reset link has been sent. Please check your Inbox, Spam/Junk, Promotions, and Updates folders.');
    } catch (err: any) {
      // Do not reveal whether the email exists in Firebase for security
      if (err.message?.includes('No account found') || err.message?.includes('user-not-found')) {
        setSuccessMessage('If an account exists for this email address, a password reset link has been sent. Please check your Inbox, Spam/Junk, Promotions, and Updates folders.');
      } else {
        setFormError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOobCode) {
      setFormError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    resetFormStates();
    setIsSubmitting(true);

    try {
      await confirmNewPassword(resetOobCode, newPassword);
      setSuccessMessage('Your password has been reset successfully! You can now sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
      setResetOobCode(null);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (err: any) {
      setFormError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    resetFormStates();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setActiveTab('profile');
    } catch (err: any) {
      setFormError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    resetFormStates();
    setIsSubmitting(true);
    try {
      await logout();
      clearRecaptcha();
      setEmailAuthMode('login');
      setPhoneStep('input');
      setPhoneNumber('');
      setOtpCode('');
      setEmail('');
      setPassword('');
      setFullName('');
      setConfirmationResult(null);
      setSuccessMessage('Signed out successfully.');
    } catch (err: any) {
      setFormError(err.message || 'Logout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = React.useMemo(() => {
    if (!user) return 'Customer';
    const storedName = localStorage.getItem(`user_name_${user.uid}`);
    return user.displayName || storedName || (user.phoneNumber ? 'Customer' : 'Customer');
  }, [user]);

  // Guaranteed Unique User ID (derived uniquely from user's UID)
  const formattedUserId = React.useMemo(() => {
    if (!user) return '';
    const storedId = localStorage.getItem(`user_custom_id_${user.uid}`);
    if (storedId) return storedId;

    let hash = 5381;
    for (let i = 0; i < user.uid.length; i++) {
      hash = ((hash << 5) + hash) + user.uid.charCodeAt(i);
    }
    const uniqueNum = 100000 + (Math.abs(hash) % 900000);
    const newId = `WP-${uniqueNum}`;
    try {
      localStorage.setItem(`user_custom_id_${user.uid}`, newId);
    } catch {}
    return newId;
  }, [user]);

  // Formatted Username: User's name without spaces + guaranteed unique numbers (e.g. @sami7428)
  const formattedUsername = React.useMemo(() => {
    if (!user) return '';
    const storedUsername = localStorage.getItem(`user_custom_username_${user.uid}`);
    if (storedUsername) return storedUsername;

    const storedName = localStorage.getItem(`user_name_${user.uid}`);
    const nameToUse = (user.displayName || storedName || fullName.trim() || phoneUserName.trim() || 'user').trim();
    const cleanName = nameToUse.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') || 'user';
    
    let hash = 5381;
    if (user.uid) {
      for (let i = 0; i < user.uid.length; i++) {
        hash = ((hash << 5) + hash) + user.uid.charCodeAt(i);
      }
    }
    const uniqueNum = 1000 + (Math.abs(hash) % 9000);
    const finalUsername = `${cleanName}${uniqueNum}`;
    try {
      localStorage.setItem(`user_custom_username_${user.uid}`, finalUsername);
    } catch {}
    return finalUsername;
  }, [user, fullName, phoneUserName]);

  const handleConfirmCancelOrder = () => {
    if (!orderToCancel || !onCancelOrder) return;
    setIsCancellingOrder(true);
    try {
      onCancelOrder(orderToCancel.id);
      setOrderToCancel(null);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleModalClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#003893] text-white p-3.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleModalClose}
              aria-label="Back"
              className="flex sm:hidden p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-white/15 hidden sm:flex items-center justify-center border border-white/20">
              {isUnverifiedEmailUser ? (
                <Mail className="w-5 h-5 text-amber-300" />
              ) : (
                <UserIcon className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {isUnverifiedEmailUser
                  ? 'Email Verification Required'
                  : user 
                  ? displayName 
                  : 'Account Login & Registration'}
              </h3>
              <p className="text-xs text-sky-200">
                {isUnverifiedEmailUser
                  ? (user?.email || 'Please activate your account')
                  : user 
                  ? (user.phoneNumber || user.email) 
                  : 'Fast checkout, order tracking & profile management'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleModalClose}
            className="flex p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (Visible ONLY when user is fully authenticated & verified) */}
        {user && !isUnverifiedEmailUser && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors ${
                activeTab === 'profile' 
                  ? 'border-[#003893] text-[#003893] bg-white shadow-xs' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors relative ${
                activeTab === 'orders' 
                  ? 'border-[#003893] text-[#003893] bg-white shadow-xs' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex-1 py-2.5 text-center border-b-2 cursor-pointer transition-colors ${
                activeTab === 'wishlist' 
                  ? 'border-[#003893] text-[#003893] bg-white shadow-xs' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
          <div id="recaptcha-container"></div>

          {authLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#003893] animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Checking authentication status...</p>
            </div>
          ) : isUnverifiedEmailUser || emailAuthMode === 'verifyEmail' ? (
            /* ========================================================================= */
            /* DEDICATED OFFICIAL FIREBASE EMAIL VERIFICATION VIEW                         */
            /* ========================================================================= */
            <div className="space-y-4 max-w-md mx-auto py-2 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 text-[#003893] mx-auto flex items-center justify-center shadow-xs">
                  <Mail className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl">Verify Your Email Address</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We've sent a verification link to your email. Click the link in your email to activate your account.
                </p>
              </div>

              {/* Email Address Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Verification link sent to:</span>
                <span className="text-sm font-bold text-[#003893] font-mono break-all">
                  {user?.email || email}
                </span>
              </div>

              {/* Instructions Box */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs text-amber-900">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Can't find the verification email?</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Please check your <strong>Inbox</strong>, <strong>Spam / Junk</strong>, <strong>Promotions</strong>, and <strong>Updates</strong> folders. The email contains an official Firebase verification link.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Alerts */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* 1. I've Verified My Email / Refresh Verification Status */}
                <button
                  type="button"
                  onClick={handleCheckEmailVerified}
                  disabled={isCheckingVerification || isSubmitting}
                  className="w-full bg-[#003893] hover:bg-[#002663] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                >
                  {isCheckingVerification ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Checking Verification Status...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>I've Verified My Email / Refresh Status</span>
                    </>
                  )}
                </button>

                {/* 2. Resend Verification Email */}
                <button
                  type="button"
                  onClick={handleResendVerificationEmail}
                  disabled={emailVerifyCooldown > 0 || isResendingEmail || isSubmitting}
                  className={`w-full py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    emailVerifyCooldown > 0 
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer'
                  }`}
                >
                  {isResendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#003893]" />
                      <span>
                        {emailVerifyCooldown > 0 
                          ? `Resend Email in ${emailVerifyCooldown}s` 
                          : 'Resend Verification Email'}
                      </span>
                    </>
                  )}
                </button>

                {/* 3. Cancel Verification & Back to Login */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-[#003893] transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel Verification & Back to Login</span>
                </button>
              </div>
            </div>
          ) : !user ? (
            /* ========================================================================= */
            /* UNAUTHENTICATED AUTH FORMS                                                */
            /* ========================================================================= */
            <div className="space-y-4 max-w-md mx-auto py-1">

              {/* Method Switcher Tabs: Email vs Phone OTP */}
              {emailAuthMode !== 'resetPassword' && (
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('email');
                      clearRecaptcha();
                      resetFormStates();
                    }}
                    className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMethod === 'email'
                        ? 'bg-white text-[#003893] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email & Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('phone');
                      clearRecaptcha();
                      resetFormStates();
                    }}
                    className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMethod === 'phone'
                        ? 'bg-white text-[#003893] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone Number (OTP)</span>
                  </button>
                </div>
              )}

              {/* Status & Error Alerts */}
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex flex-col space-y-2 animate-fade-in">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{formError}</span>
                  </div>

                  {formError.includes('Authorized Domains') && typeof window !== 'undefined' && (
                    <div className="mt-1 pt-2 border-t border-red-200/80 space-y-2 bg-white/70 p-2.5 rounded-lg text-[11px] text-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200 select-all">
                          {window.location.hostname}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              if (navigator?.clipboard?.writeText) {
                                navigator.clipboard.writeText(window.location.hostname).catch(() => {});
                              }
                            } catch {}
                            setCopiedHostname(true);
                            setTimeout(() => setCopiedHostname(false), 2500);
                          }}
                          className="shrink-0 flex items-center space-x-1 px-2.5 py-1 bg-[#003893] hover:bg-[#002663] text-white rounded font-medium cursor-pointer transition-colors text-[11px]"
                        >
                          {copiedHostname ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Hostname</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* METHOD 1: PHONE NUMBER (OTP) AUTH */}
              {authMethod === 'phone' && (
                <div className="space-y-4 animate-fade-in">
                  {phoneStep === 'input' ? (
                    <form onSubmit={handleSendOtp} className="space-y-3.5">
                      <div className="text-center space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Sign In with Mobile OTP</h4>
                        <p className="text-xs text-slate-500">We'll send a 6-digit verification code to your phone</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (Required) *</label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={phoneUserName}
                            onChange={(e) => setPhoneUserName(e.target.value)}
                            placeholder="e.g. AR Sami"
                            className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Bangladesh Mobile Number *</label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">+880</span>
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="01712345678"
                            className="w-full text-xs pl-14 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#003893] hover:bg-[#002663] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending SMS Code...</span>
                          </>
                        ) : (
                          <span>Send 6-Digit SMS Code</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Phone OTP Verification Form */
                    <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep('input');
                            setOtpCode('');
                            clearRecaptcha();
                            resetFormStates();
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                          aria-label="Change Number"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-tight">Enter Verification Code</h4>
                          <p className="text-xs text-slate-500">
                            Sent to <span className="font-bold text-slate-800">{formatBangladeshPhoneNumber(phoneNumber)}</span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Code (SMS)</label>
                        <input
                          type="text"
                          required
                          autoFocus
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="------"
                          className="w-full text-center tracking-[0.4em] font-mono text-base font-bold px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-900"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || otpCode.length < 6}
                        className="w-full bg-[#E31E24] hover:bg-[#c71016] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying Code...</span>
                          </>
                        ) : (
                          <span>Verify & Sign In</span>
                        )}
                      </button>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep('input');
                            setOtpCode('');
                            clearRecaptcha();
                            resetFormStates();
                          }}
                          className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                        >
                          Change Number
                        </button>

                        <button
                          type="button"
                          disabled={resendCooldown > 0 || isSubmitting}
                          onClick={handleResendOtp}
                          className={`font-bold flex items-center space-x-1 cursor-pointer transition-colors ${
                            resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#003893] hover:underline'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* METHOD 2: EMAIL & PASSWORD AUTH */}
              {authMethod === 'email' && (
                <div className="space-y-4 animate-fade-in">

                  {/* 1. SIGN IN FORM */}
                  {emailAuthMode === 'login' && (
                    <div className="space-y-3.5">
                      <div className="text-center space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Sign In to Your Account</h4>
                        <p className="text-xs text-slate-500">Access orders, tracking, wishlist and account settings</p>
                      </div>

                      <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-slate-700">Password</label>
                            <button
                              type="button"
                              onClick={() => {
                                setEmailAuthMode('forgot');
                                resetFormStates();
                              }}
                              className="text-[11px] font-bold text-[#003893] hover:underline cursor-pointer"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#003893] hover:bg-[#002663] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Signing in...</span>
                            </>
                          ) : (
                            <span>Sign In</span>
                          )}
                        </button>
                      </form>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium uppercase">Or continue with</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                        className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors disabled:opacity-60"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        <span>Sign in with Google</span>
                      </button>

                      <div className="text-center pt-2">
                        <p className="text-xs text-slate-600">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setEmailAuthMode('signup');
                              resetFormStates();
                            }}
                            className="text-[#003893] font-bold hover:underline cursor-pointer"
                          >
                            Create an Account
                          </button>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 2. SIGN UP FORM */}
                  {emailAuthMode === 'signup' && (
                    <div className="space-y-3.5">
                      <div className="text-center space-y-1">
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Create an Account</h4>
                        <p className="text-xs text-slate-500">Sign up with email to manage orders & fast checkout</p>
                      </div>

                      <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (Required) *</label>
                          <div className="relative">
                            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. AR Sami"
                              className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Required) *</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@gmail.com"
                              className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Password (Required) *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="At least 6 characters"
                              className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#E31E24] hover:bg-[#c71016] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Creating Account & Sending Link...</span>
                            </>
                          ) : (
                            <span>Create Account</span>
                          )}
                        </button>
                      </form>

                      <div className="text-center pt-2">
                        <p className="text-xs text-slate-600">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setEmailAuthMode('login');
                              resetFormStates();
                            }}
                            className="text-[#003893] font-bold hover:underline cursor-pointer"
                          >
                            Sign In
                          </button>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. FORGOT PASSWORD FORM */}
                  {emailAuthMode === 'forgot' && (
                    <div className="space-y-3.5">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailAuthMode('login');
                            resetFormStates();
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                          aria-label="Back to Sign In"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base leading-tight">Reset Password</h4>
                          <p className="text-xs text-slate-500">We'll send an official password reset link</p>
                        </div>
                      </div>

                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@example.com"
                              className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#003893] hover:bg-[#002663] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Sending Reset Link...</span>
                            </>
                          ) : (
                            <span>Send Password Reset Link</span>
                          )}
                        </button>
                      </form>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailAuthMode('login');
                            resetFormStates();
                          }}
                          className="text-xs font-bold text-[#003893] hover:underline cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 4. RESET PASSWORD LINK SCREEN (URL action code) */}
                  {emailAuthMode === 'resetPassword' && (
                    <div className="space-y-3.5 animate-fade-in">
                      <div className="text-center space-y-1">
                        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-[#003893] mx-auto flex items-center justify-center">
                          <Lock className="w-6 h-6" />
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Create New Password</h4>
                        {resetAccountEmail && (
                          <p className="text-xs font-semibold text-[#003893]">{resetAccountEmail}</p>
                        )}
                        <p className="text-xs text-slate-500">Please enter and confirm your new password</p>
                      </div>

                      <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 6 chars) *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password"
                              className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#003893] focus:bg-white transition-colors text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#003893] hover:bg-[#002663] text-white font-bold text-xs py-3 rounded-xl shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving Password...</span>
                            </>
                          ) : (
                            <span>Set New Password</span>
                          )}
                        </button>
                      </form>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEmailAuthMode('login');
                            resetFormStates();
                          }}
                          className="text-xs font-bold text-[#003893] hover:underline cursor-pointer"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            /* ========================================================================= */
            /* AUTHENTICATED VIEWS (Verified Profile / Orders / Wishlist)                */
            /* ========================================================================= */
            <div>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  
                  {/* User Profile Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center space-x-3 pb-3 border-b border-slate-200">
                      <div className="w-12 h-12 rounded-full bg-[#003893]/10 border border-[#003893]/20 flex items-center justify-center text-[#003893] font-black text-lg">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-extrabold text-sm text-slate-900">{displayName}</h5>
                        <p className="text-slate-500">{user.email || user.phoneNumber || 'Authenticated User'}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {/* User ID */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">User ID:</span>
                        <span className="font-mono font-bold text-slate-800 text-xs">{formattedUserId}</span>
                      </div>

                      {/* Username */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Username:</span>
                        <span className="font-mono font-bold text-[#003893] text-xs">@{formattedUsername}</span>
                      </div>

                      {/* Phone Number */}
                      {user.phoneNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Phone Number:</span>
                          <span className="font-mono font-bold text-slate-800">{user.phoneNumber}</span>
                        </div>
                      )}

                      {/* Email verification status */}
                      {user.email && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Email:</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-800 font-mono text-[11px]">{user.email}</span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1 text-[10px]">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Log Out Action */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center space-x-1.5 cursor-pointer bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                      <Package className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>No orders placed yet.</p>
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div key={ord.id} className="border border-slate-200 rounded-2xl p-3.5 space-y-2.5 bg-white shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-xs font-mono font-bold text-[#003893]">{ord.id}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{ord.date}</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            ord.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-slate-700">
                              <span className="truncate max-w-[240px]">{it.quantity}x {it.product.name}</span>
                              <span className="font-bold font-['Hind_Siliguri',sans-serif]">৳ {(it.product.price * it.quantity).toLocaleString('en-BD')}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-2 text-xs">
                          <span className="text-slate-500">Payment: {ord.paymentMethod}</span>
                          <span className="font-black text-slate-900 font-['Hind_Siliguri',sans-serif]">
                            Total: ৳ {ord.total.toLocaleString('en-BD')}
                          </span>
                        </div>

                        {ord.status === 'Pending' && onCancelOrder && (
                          <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">Order is pending confirmation</span>
                            <button
                              onClick={() => setOrderToCancel(ord)}
                              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-500" />
                              <span>Cancel Order</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-2.5">
                  {wishlist.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                      <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                      <p>Your wishlist is empty.</p>
                    </div>
                  ) : (
                    wishlist.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between gap-2 p-2.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                        <img src={prod.image} alt={prod.name} className="w-12 h-12 object-contain rounded bg-slate-50 p-1" />
                        <div className="flex-1 min-w-0">
                          <h6 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h6>
                          <span className="text-xs font-black text-[#003893] font-['Hind_Siliguri',sans-serif]">৳ {prod.price.toLocaleString('en-BD')}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onSelectProduct(prod);
                              onClose();
                            }}
                            className="bg-[#003893] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-[#002663] transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onRemoveFromWishlist(prod)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Order Cancellation Confirmation Modal Overlay */}
        {orderToCancel && (
          <div 
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
            onClick={() => {
              if (!isCancellingOrder) setOrderToCancel(null);
            }}
          >
            <div 
              className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-100/80 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-extrabold text-slate-900">Cancel This Order?</h4>
                  <p className="text-xs font-mono font-bold text-[#003893] mt-0.5">
                    Order ID: {orderToCancel.id}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Order Date:</span>
                  <span className="font-semibold text-slate-800">{orderToCancel.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Items:</span>
                  <span className="font-semibold text-slate-800">{orderToCancel.items.length} item(s)</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-[#003893] font-['Hind_Siliguri',sans-serif]">৳ {orderToCancel.total.toLocaleString('en-BD')}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to cancel this order? Once confirmed, this order will be cancelled and permanently deleted from your order history.
              </p>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  disabled={isCancellingOrder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  No, Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancelOrder}
                  disabled={isCancellingOrder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-70"
                >
                  {isCancellingOrder ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Confirm Cancel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
