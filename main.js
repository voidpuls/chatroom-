// Declare and initialize the currentUser variable
let currentUser = null;

// Function definitions
import { updateUsername, displayMessage, displaySystemMessage, joinChat, changeUserName, sendMessage, setCurrentUser } from './chat.js';
import { showPopup } from './utils.js'; // Import the showPopup function

// Function definitions
function signIn() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Reload the page after successful sign-in
      window.location.reload();
      // Update the username display with a placeholder value
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
      displaySystemMessage('You left the chat.', true);

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

// Placeholder for the signUp function
function signUp() {
  // Add your sign-up logic here
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
