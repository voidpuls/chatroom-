import { showPopup } from './utils.js';
import profaneWords from './profaneWords.js';

let currentUser = null;
export function setCurrentUser(user) {
  currentUser = user;
}
function playSound() {
  const audioUrl = './scream.mp3'; // Relative path to the audio file
  const audio = new Audio(audioUrl);
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}

function filterProfanity(message) {
  const regex = new RegExp(profaneWords.join('|'), 'gi');
  return message.replace(regex, (match) => '*'.repeat(match.length));
}

export function sendMessage(message, type = 'text', replyTo = null) {
  if (currentUser) {
    const filteredMessage = type === 'text' ? filterProfanity(message) : message;
    const messageData = {
      content: filteredMessage,
      sender: currentUser.displayName,
      type: type,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      replyTo: replyTo,
    };
    messagesCollection.add(messageData)
      .then(() => {
        document.getElementById('message-input').value = '';
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        showPopup('An error occurred while sending the message. Please try again later.');
      });
  } else {
    showPopup('You must be signed in to send messages.');
  }
}

export function displayMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  const senderElement = document.createElement('span');
  senderElement.classList.add('sender');
  senderElement.textContent = `${message.sender}: `;
  const messageContentElement = document.createElement('div');
  messageContentElement.classList.add('message-content');

  if (message.type === 'text') {
    const textElement = document.createElement('p');
    textElement.classList.add('message-text');
    textElement.textContent = message.content;
    messageContentElement.appendChild(textElement);
  } else if (message.type === 'image') {
    const imageElement = document.createElement('img');
    imageElement.src = message.content;
    imageElement.classList.add('message-image');
    messageContentElement.appendChild(imageElement);
  }

  const timestampElement = document.createElement('small');
  timestampElement.classList.add('message-timestamp');
  const timestamp = message.timestamp ? message.timestamp.toDate().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown';
  timestampElement.textContent = timestamp;
  messageContentElement.appendChild(timestampElement);

  const replyButton = document.createElement('button');
  replyButton.classList.add('reply-button');
  replyButton.textContent = 'Reply';
  replyButton.addEventListener('click', () => {
    const messageInput = document.getElementById('message-input');
    messageInput.value = `@${message.sender} `;
    messageInput.focus();
    messageInput.addEventListener('keydown', handleReplyKeydown);

    function handleReplyKeydown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const replyMessage = messageInput.value.trim();
        if (replyMessage) {
          const mentionedUser = replyMessage.includes(`@${currentUser.displayName}`);
          sendMessage(replyMessage.replace(`@${message.sender} `, ''), 'text', message);
          if (mentionedUser || message.replyTo?.sender === currentUser.displayName) {
            playSound();
            showNotification(message.sender, replyMessage);
          } else if (message.sender === currentUser.displayName) {
            playSound();
          }
          messageInput.value = '';
          messageInput.removeEventListener('keydown', handleReplyKeydown);
        }
      }
    }
  });
  messageContentElement.appendChild(replyButton);

  if (message.replyTo) {
    const repliedMessageElement = document.createElement('div');
    repliedMessageElement.classList.add('replied-message');
    repliedMessageElement.textContent = `Replying to ${message.replyTo.sender}: ${message.replyTo.content}`;
    messageContentElement.insertBefore(repliedMessageElement, messageContentElement.firstChild);
  }

  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageContentElement);
  const chatMessagesContainer = document.getElementById('chat-messages');
  chatMessagesContainer.appendChild(messageElement);
  toggleElement('chat-messages', true);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function playSound() {
  const audioUrl = './scream.mp3'; // Relative path to the audio file
  const audio = new Audio(audioUrl);
  audio.play().catch((error) => {
    console.error('Error playing sound:', error);
  });
}

function showNotification(sender, message) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(`New reply from ${sender}`, {
      body: message, // Custom message string
    });
    notification.onclick = () => {
      window.focus();
    };
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showNotification(sender, message);
      }
    });
  }
}

export function joinChat(name) {
  usersCollection.where('displayName', '==', name).get().then((querySnapshot) => {
    if (!querySnapshot.empty) {
      showPopup('This name is already taken. Please choose a different name.');
      return;
    }

    if (currentUser && currentUser.emailVerified) {
      const userData = { displayName: name, email: currentUser.email };
      usersCollection.doc(currentUser.uid).set(userData).then(() => {
        return currentUser.updateProfile({ displayName: name });
      }).then(() => {
        toggleElement('chat-input', true);
        toggleElement('chat-messages', true);
        toggleElement('name-input', false);
        updateUsername(name);
        displaySystemMessage(`${name} joined the chat.`, true);
      }).catch((error) => {
        console.error('Error updating user profile:', error);
        showPopup('An error occurred while updating your profile. Please try again later.');
      });
    } else if (currentUser) {
      showPopup('Please verify your email before joining the chat.');
    } else {
      showPopup('You must be signed in to join the chat.');
    }
  }).catch((error) => {
    console.error('Error checking name availability:', error);
    showPopup('An error occurred while checking name availability. Please try again later.');
  });
}

export function changeUserName(newName) {
  if (currentUser) {
    const userData = { displayName: newName, email: currentUser.email };
    usersCollection.doc(currentUser.uid).set(userData).then(() => {
      return currentUser.updateProfile({ displayName: newName });
    }).then(() => {
      toggleElement('profile-menu', false);
      updateUsername(newName);
      displaySystemMessage(`${currentUser.displayName} changed their name to ${newName}.`, true);
    }).catch((error) => {
      console.error('Error updating user profile:', error);
      showPopup('An error occurred while updating your name. Please try again later.');
    });
  } else {
    showPopup('You must be signed in to change your name.');
  }
}

export function updateUsername(name) {
  const usernameDisplay = document.getElementById('username-display');
  usernameDisplay.textContent = name;
}

export function displaySystemMessage(message, isGlobal = false) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('system-message');
  if (isGlobal) {
    messageElement.classList.add('global-message');
  }
  messageElement.textContent = `System: ${message}`;
  document.getElementById('chat-messages').appendChild(messageElement);
  toggleElement('chat-messages', true);
}

document.getElementById('new-name-input').addEventListener('input', (event) => {
  updateUsername(event.target.value);
});

document.getElementById('message-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const message = document.getElementById('message-input').value.trim();
    if (message) {
      sendMessage(message);
      document.getElementById('message-input').value = '';
    }
  }
});

export function toggleElement(elementId, show, className) {
  const element = document.getElementById(elementId);
  if (element) {
    if (show) {
      element.classList.remove('hidden');
      if (className) {
        element.classList.remove(className);
      }
      if (elementId === 'profile-menu') {
        element.style.display = 'block';
      }
    } else {
      element.classList.add('hidden');
      if (className) {
        element.classList.add(className);
      }
      if (elementId === 'profile-menu') {
        element.style.display = 'none';
      }
    }
  }
}
