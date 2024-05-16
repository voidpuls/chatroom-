// Declare and initialize the currentUser variable
let currentUser = null;
const signContainer = document.getElementById("login-container");

// Function definitions
import { updateUsername, displayMessage, displaySystemMessage, joinChat, changeUserName, sendMessage, setCurrentUser } from './chat.js';
import { showPopup } from './utils.js'; // Import the showPopup function

// Function definitions
function signIn() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Update the username display with a placeholder value
      signContainer.style.display = "none";
      updateUsername('User');
    })
    .catch((error) => {
      showPopup(`Error signing in: ${error.message}`);
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
      displaySystemMessage(`${currentUser.displayName} left the chat.`, true); // Display a global message
      currentUser = null; // Reset the currentUser variable

      // Reload the page after successful sign-out
      window.location.reload();
    })
    .catch((error) => {
      showPopup(`Error signing out: ${error.message}`);
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

function signUp() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User signed up successfully
      const user = userCredential.user;
      showPopup(`User ${user.email} signed up successfully!`);

      // Optional: Send a verification email
      user.sendEmailVerification().then(() => {
        showPopup('Verification email sent. Please check your inbox and verify your email address.');
      }).catch((error) => {
        console.error('Error sending verification email:', error);
      });
    })
    .catch((error) => {
      // Handle sign-up error
      showPopup(`Error signing up: ${error.message}`);
    });
}

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

// Wrap your code inside a function
function initializeApp() {
  const signInButton = document.getElementById('sign-in-button');
  const signUpButton = document.getElementById('sign-up-button');
  const resetPasswordButton = document.getElementById('reset-password-button');
  const sendButton = document.getElementById('send-button');
  const changeNameButton = document.getElementById('change-name-button');
  const saveNameButton = document.getElementById('save-name-button');
  const signOutButton = document.getElementById('sign-out-button');

  // Add event listeners only if the elements exist
  if (signInButton !== null) {
    signInButton.addEventListener('click', signIn);
  } else {
    console.log('sign-in-button element not found');
  }

  if (signUpButton !== null) {
    signUpButton.addEventListener('click', signUp);
  } else {
    console.log('sign-up-button element not found');
  }

  if (resetPasswordButton !== null) {
    resetPasswordButton.addEventListener('click', resetPassword);
  } else {
    console.log('reset-password-button element not found');
  }

  if (sendButton !== null) {
    sendButton.addEventListener('click', () => {
      const messageInput = document.getElementById('message-input');
      if (messageInput !== null) {
        const message = messageInput.value.trim();
        if (message) {
          sendMessage(message);
          messageInput.value = '';
        }
      } else {
        console.log('message-input element not found');
      }
    });
  } else {
    console.log('send-button element not found');
  }

  if (changeNameButton !== null) {
    changeNameButton.addEventListener('click', () => {
      toggleElement('profile-menu', true);
    });
  } else {
    console.log('change-name-button element not found');
  }

  if (saveNameButton !== null) {
    saveNameButton.addEventListener('click', () => {
      const newNameInput = document.getElementById('new-name-input');
      if (newNameInput !== null) {
        const newName = newNameInput.value.trim();
        if (newName) {
          changeUserName(newName);
        } else {
          showPopup('Please enter a new name.');
        }
      } else {
        console.log('new-name-input element not found');
      }
    });
  } else {
    console.log('save-name-button element not found');
  }

  if (signOutButton !== null) {
    signOutButton.addEventListener('click', signOut);
  } else {
    console.log('sign-out-button element not found');
  }

  // Initialize Firebase and set up event listeners for real-time updates
  firebase.auth().onAuthStateChanged((user) => {
    currentUser = user;
    setCurrentUser(user); // Set the currentUser in the chat.js module
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
}

// Call the initializeApp function when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
