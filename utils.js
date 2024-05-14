export const utils = {
  sendVerificationEmail: async (user) => {
    try {
      const actionCodeSettings = {
        url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
        handleCodeInApp: true,
      };

      await firebase.auth().currentUser.sendEmailVerification(actionCodeSettings);
      console.log(`Email verification sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email verification:', error.message);
      throw error;
    }
  },

  sendPasswordResetEmailUtil: async (email) => {
    try {
      const actionCodeSettings = {
        url: 'https://chatroom-50dfb.firebaseapp.com/__/auth/action',
        handleCodeInApp: true,
      };

      await firebase.auth().sendPasswordResetEmail(email, actionCodeSettings);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error.message);
      throw error;
    }
  }
};
