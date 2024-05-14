// Utility functions
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

function showPopup(message) {
  const popup = document.createElement('div');
  popup.classList.add('popup');

  const popupContent = document.createElement('div');
  popupContent.classList.add('popup-content');

  const messageElement = document.createElement('p');
  messageElement.textContent = message;

  const closeButton = document.createElement('span');
  closeButton.classList.add('close-button');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    popup.remove();
  });

  popupContent.appendChild(messageElement);
  popupContent.appendChild(closeButton);
  popup.appendChild(popupContent);

  document.body.appendChild(popup);
}

