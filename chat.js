import { showPopup } from './utils.js';
import profaneWords from './profaneWords.js';

// Chat-related functions
let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
}

function filterProfanity(message) {
  const regex = new RegExp(profaneWords.join('|'), 'gi');
  return message.replace(regex, match => '*'.repeat(match.length));
}

function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = img.width;
      const height = img.height;

      let newWidth = width;
      let newHeight = height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          newWidth = maxWidth;
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newHeight = maxHeight;
          newWidth = Math.round(newHeight * aspectRatio);
        }
      }

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        (blob) => {
          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve(resizedFile);
        },
        file.type,
        0.8
      );
    };
    img.onerror = reject;
  });
}

export function sendMessage(message, file = null) {
  if (currentUser) {
    const filteredMessage = filterProfanity(message);
    const messageData = {
      text: filteredMessage,
      sender: currentUser.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (file) {
      const maxWidth = 1000;
      const maxHeight = 1000;

      resizeImage(file, maxWidth, maxHeight)
        .then((resizedFile) => {
          const storageRef = firebase.storage().ref();
          const imageRef = storageRef.child(`images/${resizedFile.name}`);

          imageRef.put(resizedFile)
            .then((snapshot) => {
              console.log('Image uploaded successfully');
              return snapshot.ref.getDownloadURL();
            })
            .then((downloadURL) => {
              messageData.imageURL = downloadURL;
              messagesCollection.add(messageData)
                .then(() => {
                  document.getElementById('message-input').value = '';
                  document.getElementById('image-input').value = '';
                })
                .catch((error) => {
                  console.error('Error sending message:', error);
                  showPopup('An error occurred while sending the message. Please try again later.');
                });
            })
            .catch((error) => {
              console.error('Error uploading image:', error);
              showPopup('An error occurred while uploading the image. Please try again later.');
            });
        })
        .catch((error) => {
          console.error('Error resizing image:', error);
          showPopup('An error occurred while resizing the image. Please try again later.');
        });
    } else {
      messagesCollection.add(messageData)
        .then(() => {
          document.getElementById('message-input').value = '';
        })
        .catch((error) => {
          console.error('Error sending message:', error);
          showPopup('An error occurred while sending the message. Please try again later.');
        });
    }
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

  if (message.imageURL) {
    const imageElement = document.createElement('img');
    imageElement.src = message.imageURL;
    imageElement.classList.add('image-preview');
    messageContentElement.appendChild(imageElement);
  }

  const textElement = document.createElement('p');
  textElement.classList.add('message-text');
  textElement.textContent = message.text;

  const timestampElement = document.createElement('small');
  timestampElement.classList.add('message-timestamp');
  const timestamp = message.timestamp ? message.timestamp.toDate().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown';
  timestampElement.textContent = timestamp;

  messageContentElement.appendChild(textElement);
  messageContentElement.appendChild(timestampElement);

  messageElement.appendChild(senderElement);
  messageElement.appendChild(messageContentElement);

  const chatMessagesContainer = document.getElementById('chat-messages');
  chatMessagesContainer.appendChild(messageElement);
  toggleElement('chat-messages', true); // Show the chat messages container

  // Scroll to the bottom of the chat area
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

export function joinChat(name) {
  const filteredName = filterProfanity(name);
  if (filteredName !== name) {
    showPopup('Please choose a different name without profanity.');
    return;
  }

  // Check if the name is already taken
  usersCollection.where('displayName', '==', name).get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty) {
        showPopup('This name is already taken. Please choose a different name.');
        return;
      }

      if (currentUser && currentUser.emailVerified) {
        const userData = {
          displayName: name,
          email: currentUser.email
        };

        usersCollection.doc(currentUser.uid).set(userData)
          .then(() => {
            return currentUser.updateProfile({
              displayName: name
            });
          })
          .then(() => {
            toggleElement('chat-input', true);
            toggleElement('chat-messages', true);
            toggleElement('name-input', false);
            toggleElement('login-container', false); // Hide the login container
            updateUsername(name);
            displaySystemMessage(`${name} joined the chat.`, true); // Display a global message
          })
          .catch((error) => {
            console.error('Error updating user profile:', error);
            showPopup('An error occurred while updating your profile. Please try again later.');
          });
      } else if (currentUser) {
        showPopup('Please verify your email before joining the chat.');
      } else {
        showPopup('You must be signed in to join the chat.');
      }
    })
    .catch((error) => {
      console.error('Error checking name availability:', error);
      showPopup('An error occurred while checking name availability. Please try again later.');
    });
}

export function changeUserName(newName) {
  if (currentUser) {
    const filteredName = filterProfanity(newName);
    if (filteredName !== newName) {
      showPopup('Please choose a different name without profanity.');
      return;
    }

    // Check if the new name is already taken
    usersCollection.where('displayName', '==', newName).get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          showPopup('This name is already taken. Please choose a different name.');
          return;
        }

        const userData = {
          displayName: newName,
          email: currentUser.email
        };

        usersCollection.doc(currentUser.uid).set(userData)
          .then(() => {
            return currentUser.updateProfile({
              displayName: newName
            });
          })
          .then(() => {
            toggleElement('profile-menu', false);
            updateUsername(newName);
            displaySystemMessage(`${currentUser.displayName} changed their name to ${newName}.`, true); // Display a global message
          })
          .catch((error) => {
            console.error('Error updating user profile:', error);
            showPopup('An error occurred while updating your name. Please try again later.');
          });
      })
      .catch((error) => {
        console.error('Error checking name availability:', error);
        showPopup('An error occurred while checking name availability. Please try again later.');
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
  messageElement.textContent = message;
  document.getElementById('chat-messages').appendChild(messageElement);
  toggleElement('chat-messages', true); // Show the chat messages container
}

// Add an event listener for the 'input' event on the 'new-name-input' field
document.getElementById('new-name-input').addEventListener('input', (event) => {
  updateUsername(event.target.value);
});

// Add an event listener for the 'keydown' event on the 'message-input' field
document.getElementById('message-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Prevent the default behavior of the Enter key
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    const imageInput = document.getElementById('image-input');
    const file = imageInput.files.length > 0 ? imageInput.files[0] : null;

    if (message || file) {
      sendMessage(message, file);
      messageInput.value = '';
      imageInput.value = '';
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
