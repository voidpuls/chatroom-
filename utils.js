import { utils } from './utils.js';

const initializeChat = (username, showChat = true) => {
  const messagesCollection = firebase.firestore().collection('messages');
  const messagesQuery = messagesCollection.orderBy('created', 'asc');
  const chatMessagesContainer = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  const changeNameButton = document.getElementById('change-name-button');
  const signOutButton = document.getElementById('sign-out-button');

  // Check if the user is verified
  const user = firebase.auth().currentUser;
  if (!user || !user.emailVerified) {
    showPopup('Please verify your email before joining the chat.');
    utils.sendVerificationEmail(user); // Send verification email
    return;
  }

  // Show or hide the chat interface
  if (showChat) {
    document.querySelector('.chat-container').style.display = 'block';
    document.querySelector('.chat-input').style.display = 'flex';
  } else {
    document.querySelector('.chat-container').style.display = 'none';
    document.querySelector('.chat-input').style.display = 'none';
  }

  // Clear the chat container
  chatMessagesContainer.innerHTML = '';

  // Listen for new messages and filter out profanity
  const unsubscribe = messagesQuery.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = change.doc.data();
        const messageElement = document.createElement('div');

        // Create a span element for the username and date
        const userNameDateSpan = document.createElement('span');
        userNameDateSpan.textContent = `${message.user} (${new Date(message.created.toDate()).toLocaleString()})`;

        // Create a span element for the message content
        const messageContentSpan = document.createElement('span');
        messageContentSpan.textContent = `: ${message.message}`;

        // Append the username/date and message content spans to the message element
        messageElement.appendChild(userNameDateSpan);
        messageElement.appendChild(messageContentSpan);

        // Only append the message element if it doesn't contain profanity
        const containsProfanity = message.message.toLowerCase().includes('profanity');
        if (!containsProfanity) {
          chatMessagesContainer.appendChild(messageElement);
        }
      }
    });
  });

  // Function to show the verification popup
  function showPopup(message) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close-button">&times;</span>
        <p>${message}</p>
      </div>
    `;

    document.body.appendChild(popup);

    const closeButton = popup.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      popup.remove();
    });

    window.addEventListener('click', (event) => {
      if (event.target === popup) {
        popup.remove();
      }
    });
  }

  // Handle send button click
  sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
      try {
        await messagesCollection.add({
          user: firebase.auth().currentUser.displayName,
          message,
          created: new Date(),
        });
        messageInput.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });

  // Handle change name button click
  changeNameButton.addEventListener('click', () => {
    document.querySelector('.profile-menu').style.display = 'block';
  });

  // Handle sign-out button click
  signOutButton.addEventListener('click', () => {
    firebase.auth().signOut()
      .then(() => {
        hideChatInterface();
      })
      .catch((error) => {
        console.error('Sign-out failed:', error.message);
        alert(`Sign-out failed. ${error.message}`);
      });
  });
}

function hideChatInterface() {
  document.querySelector('.chat-container').style.display = 'none';
  document.querySelector('.chat-input').style.display = 'none';
}
