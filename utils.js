import { getAuth, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { auth } from "./main.js";

export const sendVerificationEmail = async (user) => {
  try {
    const actionCodeSettings = {
      url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
    };

    await sendEmailVerification(user, actionCodeSettings);
    console.log(`Email verification sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending email verification:', error.message);
    throw error;
  }
};

export const sendPasswordResetEmailUtil = async (email) => {
  try {
    const actionCodeSettings = {
      url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw error;
  }
};
