// Function definitions
function signIn() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const name = document.getElementById('name-input').value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      hideElement('login-container');
      hideElement('name-input');
      showElement('chat-interface');
      updateUsername(name);
      showPopup(`You are logged in as ${email}. Welcome to the chat!`);
    })
    .catch((error) => {
      showPopup(`Error signing in: ${error.message}`);
    });
}

function signUp() {
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      user.sendEmailVerification()
        .then(() => {
          showPopup('Verification email sent. Please verify your email before joining the chat.');
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
      hideElement('chat-input');
      hideElement('profile-menu');
      hideElement('sign-out-button');
      document.getElementById('chat-messages').innerHTML = '';
      showElement('login-container');
      showElement('name-input');
      hideElement('chat-interface');
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
  showElement('profile-menu');
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
    hideElement('login-container');
    showElement('chat-interface');
    showElement('sign-out-button');
    showElement('chat-input');
    showElement('profile-menu');
    const name = user.displayName || '';
    updateUsername(name);
    if (name) {
      hideElement('name-input');
    } else {
      showElement('name-input');
    }
    showPopup(`You are logged in as ${user.email}. Welcome to the chat!`);
  } else if (user) {
    hideElement('chat-interface');
    showElement('login-container');
    showElement('name-input');
    showPopup('Please verify your email before joining the chat.');
  } else {
    hideElement('chat-interface');
    showElement('login-container');
    showElement('name-input');
    document.getElementById('chat-messages').innerHTML = '';
    showPopup('You are not logged in.');
  }
}
