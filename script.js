document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('query');
  const games = document.querySelectorAll('.content');
  const resultsContainer = document.getElementById('search-results');

  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const offset = 400; // Offset in pixels (2px from the edge of the screen)
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  }

  function checkPosition() {
    for (let game of games) {
      if (isElementInViewport(game)) {
        game.classList.add('in-view');
        game.classList.remove('fade-out');
        game.classList.add('fade-in');
      } else {
        game.classList.remove('in-view');
        game.classList.remove('fade-in');
        game.classList.add('fade-out');
      }
    }
  }

  window.addEventListener('scroll', checkPosition);
  window.addEventListener('load', checkPosition);

  searchInput.addEventListener('input', () => {
    const searchText = searchInput.value.toLowerCase();
    let hasResults = false;
    resultsContainer.innerHTML = '';

    games.forEach(game => {
      const gameTitle = game.querySelector('h3').textContent.toLowerCase();
      if (gameTitle.includes(searchText)) {
        game.classList.remove('hidden');
        game.classList.remove('fade-out');
        game.classList.add('fade-in');
        hasResults = true;
      } else {
        game.classList.add('hidden');
        game.classList.remove('fade-in');
        game.classList.add('fade-out');
      }
    });

    if (!hasResults) {
      resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
    } else {
      resultsContainer.innerHTML = ''; // Clear "No results found" message when there are results
    }

    // Recheck the position after filtering
    checkPosition();
  });

  // Initial check to see which games are in view
  checkPosition();
});

// ... (rest of the code remains the same)
