import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { sendPasswordResetEmailUtil } from './utils.js';
import { initializeChat } from './chat.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDisnhcjYmvZc2y9-toeWWKHq9nHYb8Fn4",
  authDomain: "chatroom-50dfb.firebaseapp.com",
  databaseURL: "https://chatroom-50dfb-default-rtdb.firebaseio.com",
  projectId: "chatroom-50dfb",
  storageBucket: "chatroom-50dfb.appspot.com",
  messagingSenderId: "533310796123",
  appId: "1:533310796123:web:1f9cb3326563d3dee72a7e",
  measurementId: "G-GTXX84ZBPD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// DOM elements
const signInContainer = document.querySelector('.sign-in-container');
const nameInput = document.querySelector('#name-input');
const joinButton = document.querySelector('#join-button');
const chatMessages = document.querySelector('#chat-messages');
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const changeNameButton = document.querySelector('#change-name-button');
const signOutButton = document.querySelector('#sign-out-button');
const profileMenu = document.querySelector('.profile-menu');
const newNameInput = document.querySelector('#new-name-input');
const saveNameButton = document.querySelector('#save-name-button');

// Sign in/up event listeners
document.querySelector('#sign-in-button').addEventListener('click', signIn);
document.querySelector('#sign-up-button').addEventListener('click', signUp);
document.querySelector('#reset-password-button').addEventListener('click', resetPassword);

// Chat event listeners
joinButton.addEventListener('click', joinChat);
saveNameButton.addEventListener('click', saveNewName);

// Firebase references
let currentUser;
let currentUserName;

// Sign in function
function signIn() {
  const email = document.querySelector('#email-input').value;
  const password = document.querySelector('#password-input').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showNameInput();
    })
    .catch((error) => {
      console.error(error);
    });
}

// Sign up function
function signUp() {
  const email = document.querySelector('#email-input').value;
  const password = document.querySelector('#password-input').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showNameInput();
    })
    .catch((error) => {
      console.error(error);
    });
}

// Reset password function
function resetPassword() {
  const email = document.querySelector('#email-input').value;

  sendPasswordResetEmailUtil(email)
    .then(() => {
      alert('Password reset email sent!');
    })
    .catch((error) => {
      console.error(error);
    });
}

// Show name input
function showNameInput() {
  signInContainer.style.display = 'none';
  document.querySelector('.name-input').style.display = 'block';
}

// Join chat
function joinChat() {
  currentUserName = nameInput.value.trim();
  if (currentUserName) {
    document.querySelector('.name-input').style.display = 'none';
    initializeChat(currentUserName);
  }
}

// Save new name
function saveNewName() {
  const newName = newNameInput.value.trim();
  if (newName) {
    currentUser.updateProfile({
      displayName: newName
    })
    .then(() => {
      currentUserName = newName;
      profileMenu.style.display = 'none';
    })
    .catch((error) => {
      console.error('Error updating display name:', error);
    });
  }
}
