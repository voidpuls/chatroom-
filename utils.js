let popup = null;

export function showPopup(message) {
  if (!popup) {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    const closeButton = document.createElement('span');
    closeButton.classList.add('close-button');
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      popupContainer.remove();
      popup = null;
    });

    const messageElement = document.createElement('p');
    messageElement.textContent = message;

    popupContent.appendChild(closeButton);
    popupContent.appendChild(messageElement);
    popupContainer.appendChild(popupContent);

    document.body.appendChild(popupContainer);
    popup = popupContainer;
  } else {
    const popupContent = popup.querySelector('.popup-content');
    popupContent.querySelector('p').textContent = message;
  }
}
