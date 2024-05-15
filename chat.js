// Chat-related functions
let currentUser = null;
let profaneWords = [];

function readProfaneWords() {
  return new Promise((resolve, reject) => {
    fetch('/paste.txt')
      .then(response => response.text())
      .then(data => {
        profaneWords = data.split(/\s+/); // Split the file contents by whitespace characters
        console.log('Profane words loaded:', profaneWords);
        resolve();
      })
      .catch(error => {
        console.error('Error reading profane words:', error);
        reject(error);
      });
  });
}

function filterProfanity(text) {
  const regex = new RegExp(profaneWords.join('|'), 'gi');
  return text.replace(regex, match => '*'.repeat(match.length));
}

function sendMessage(message) {
  if (currentUser) {
    const messageData = {
      text: filterProfanity(message),
      sender: currentUser.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    messagesCollection.add(messageData)
      .then(() => {
        document.getElementById('message-input').value = '';
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  } else {
    showPopup('You must be signed in to send messages.');
  }
}

function displayMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  const senderElement = document.createElement('span');
  senderElement.classList.add('sender');
  senderElement.textContent = message.sender;

  const messageContentElement = document.createElement('div');
  messageContentElement.classList.add('message-content');

  const textElement = document.createElement('p');
  textElement.classList.add('message-text');
  textElement.textContent = message.text;

  const timestampElement = document.createElement('small');
  timestampElement.classList.add('message-timestamp');
  const timestamp = message.timestamp ? new Date(message.timestamp.toDate()).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown';
  timestampElement.textContent = timestamp;

  messageContentElement.appendChild(textElement);
  messageContentElement.appendChild(timestampElement);

  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageContentElement);

  document.getElementById('chat-messages').appendChild(messageElement);
  toggleElement('chat-messages', true); // Show the chat messages container
}

function joinChat(name) {
  const filteredName = filterProfanity(name);

  if (filteredName !== name) {
    showPopup('Please choose a different name without profane words.');
    return;
  }

  if (currentUser && currentUser.emailVerified) {
    const userData = {
      displayName: filteredName,
      email: currentUser.email
    };

    usersCollection.doc(currentUser.uid).set(userData)
      .then(() => {
        currentUser.updateProfile({
          displayName: filteredName
        })
          .then(() => {
            toggleElement('chat-input', true);
            toggleElement('chat-messages', true);
            toggleElement('name-input', false);
            updateUsername(filteredName);
            displaySystemMessage(`${filteredName} joined the chat.`);
          })
          .catch((error) => {
            console.error('Error updating user profile:', error);
          });
      })
      .catch((error) => {
        console.error('Error updating user data:', error);
      });
  } else if (currentUser) {
    showPopup('Please verify your email before joining the chat.');
  } else {
    showPopup('You must be signed in to join the chat.');
  }
}

function changeUserName(newName) {
  const filteredName = filterProfanity(newName);

  if (filteredName !== newName) {
    showPopup('Please choose a different name without profane words.');
    return;
  }

  if (currentUser) {
    const userData = {
      displayName: filteredName,
      email: currentUser.email
    };

    usersCollection.doc(currentUser.uid).set(userData)
      .then(() => {
        currentUser.updateProfile({
          displayName: filteredName
        })
          .then(() => {
            toggleElement('profile-menu', false);
            updateUsername(filteredName);
            displaySystemMessage(`${currentUser.displayName} changed their name to ${filteredName}.`);
          })
          .catch((error) => {
            console.error('Error updating user profile:', error);
            showPopup('An error occurred while updating your name. Please try again later.');
          });
      })
      .catch((error) => {
        console.error('Error updating user data:', error);
        showPopup('An error occurred while updating your name. Please try again later.');
      });
  } else {
    showPopup('You must be signed in to change your name.');
  }
}

function updateUsername(name) {
  const usernameDisplay = document.getElementById('username-display');
  usernameDisplay.textContent = name;
}

function displaySystemMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('system-message');
  messageElement.textContent = message;
  document.getElementById('chat-messages').appendChild(messageElement);
  toggleElement('chat-messages', true); // Show the chat messages container
}

// Add an event listener for the 'input' event on the 'new-name-input' field
document.getElementById('new-name-input').addEventListener('input', (event) => {
  updateUsername(event.target.value);
});

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
