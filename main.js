// Function definitions
import { updateUsername, displayMessage, displaySystemMessage, joinChat, changeUserName, filterProfanity } from './chat.js';

// Function definitions
function signIn() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const name = document.getElementById('name-input').value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Reload the page after successful sign-in
      window.location.reload();
      // Update the username display
      updateUsername(name);
    })
    .catch((error) => {
      showPopup(`Error signing in: ${error.message}`);
    });
}

function signOut() {
  auth.signOut()
    .then(() => {
      // Reload the page after successful sign-out
      window.location.reload();
    })
    .catch((error) => {
      showPopup(`Error signing out: ${error.message}`);
    });
}

function signUp() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const name = document.getElementById('name-input').value.trim();

  if (currentUser) {
    showPopup('You are already signed in. Please sign out first to create a new account.');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.sendEmailVerification()
        .then(() => {
          return auth.signInWithEmailAndPassword(email, password);
        })
        .then(() => {
          showPopup('Verification email sent. Please verify your email before joining the chat.');
          updateUIBasedOnAuthState(user); // Update the UI based on the new user's authentication state
          // Update the username display
          updateUsername(name);
        })
        .catch((error) => {
          console.error('Error sending verification email:', error);
        });
    })
    .catch((error) => {
      console.error('Error creating user:', error);
    });
}


function resetPassword() {
  const email = document.getElementById('email-input').value;

  auth.sendPasswordResetEmail(email)
    .then(() => {
      showPopup('Password reset email sent. Check your inbox.');
    })
    .catch((error) => {
      showPopup(`Error resetting password: ${error.message}`);
    });
}

function signOut() {
  auth.signOut()
    .then(() => {
      showPopup('You have been signed out.');
      toggleElement('chat-input', false);
      toggleElement('profile-menu', false, 'hidden');
      toggleElement('sign-out-button', false);
      document.getElementById('chat-messages').innerHTML = '';
      toggleElement('login-container', true);
      toggleElement('name-input', true);
      toggleElement('chat-interface', false);
      displaySystemMessage('You left the chat.');
    })
    .catch((error) => {
      showPopup(`Error signing out: ${error.message}`);
    });
}

// Event listeners and main logic
document.getElementById('sign-in-button').addEventListener('click', signIn);
document.getElementById('sign-up-button').addEventListener('click', signUp);
document.getElementById('reset-password-button').addEventListener('click', resetPassword);
document.getElementById('send-button').addEventListener('click', () => {
  const message = document.getElementById('message-input').value.trim();
  if (message) {
    sendMessage(message);
    document.getElementById('message-input').value = '';
  }
});
document.getElementById('change-name-button').addEventListener('click', () => {
  toggleElement('profile-menu', true);
});
document.getElementById('save-name-button').addEventListener('click', () => {
  const newName = document.getElementById('new-name-input').value.trim();
  if (newName) {
    changeUserName(newName);
  } else {
    showPopup('Please enter a new name.');
  }
});
document.getElementById('sign-out-button').addEventListener('click', signOut);

// Initialize Firebase and set up event listeners for real-time updates
firebase.auth().onAuthStateChanged((user) => {
  currentUser = user;
  updateUIBasedOnAuthState(user);
});

messagesCollection.orderBy('timestamp')
  .onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        displayMessage(change.doc.data());
      }
    });
  });

function updateUIBasedOnAuthState(user) {
  if (user && user.emailVerified) {
    toggleElement('login-container', false);
    toggleElement('name-input', false);
    const chatInterface = document.querySelector('.chat-interface');
    chatInterface.classList.add('show');
    toggleElement('sign-out-button', true);
    toggleElement('chat-input', true);
    toggleElement('profile-menu', true);
    const name = user.displayName || '';
    updateUsername(name);
    showPopup(`You are logged in as ${user.email}. Welcome to the chat!`);
  } else if (user) {
    toggleElement('login-container', true);
    toggleElement('name-input', true);
    const chatInterface = document.querySelector('.chat-interface');
    chatInterface.classList.remove('show');
    showPopup('Please verify your email before joining the chat.');
  } else {
    toggleElement('login-container', true);
    toggleElement('name-input', true);
    const chatInterface = document.querySelector('.chat-interface');
    chatInterface.classList.remove('show');
    document.getElementById('chat-messages').innerHTML = '';
    showPopup('You are not logged in.');
  }
}

function toggleElement(elementId, show, className) {
  const element = document.getElementById(elementId);
  if (element) {
    if (show) {
      element.classList.remove('hidden');
      if (className) {
        element.classList.remove(className);
      }
    } else {
      element.classList.add('hidden');
      if (className) {
        element.classList.add(className);
      }
    }
  }
}
