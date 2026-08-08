const API_KEY = "ad1717b78cfece8796b319056504cea4";

// Select DOM Elements
const movieContainer = document.querySelector('.movie-container');
const searchInput = document.querySelector('.search-input');
const dateSelect = document.querySelector('#date');
const ratingSelect = document.querySelector('#rating');
const genreSelect = document.querySelector('#type-select');
const loadMoreBtn = document.querySelector('#load-more-btn');
const watchlistBtn = document.querySelector('#watch-list');

// State Tracking
let currentPage = 1;
let isLoading = false;
let currentFetchUrl = '';
let isWatchlistView = false;

// Event Listeners - Dropdowns and Search
dateSelect?.addEventListener('change', () => applyFilters());
ratingSelect?.addEventListener('change', () => applyFilters());
genreSelect?.addEventListener('change', () => applyFilters());
searchInput?.addEventListener('input', () => {
  if (searchInput.value.trim() !== '') {
    searchMovies();
  } else {
    applyFilters();
  }
});

loadMoreBtn?.addEventListener('click', loadMoreMovies);

// SINGLE Watchlist Toggle Event Listener
watchlistBtn?.addEventListener('click', toggleWatchlistView);

// --- WATCHLIST TOGGLE FUNCTION ---
function toggleWatchlistView() {
  isWatchlistView = !isWatchlistView;

  if (isWatchlistView) {
    // 1. Highlight button
    watchlistBtn.classList.add('active');
    watchlistBtn.textContent = '← Back to Movies';

    // 2. Disable controls while in Watchlist mode
    if (dateSelect) dateSelect.disabled = true;
    if (ratingSelect) ratingSelect.disabled = true;
    if (genreSelect) genreSelect.disabled = true;
    if (searchInput) searchInput.disabled = true;

    // 3. Display Watchlist
    displayWatchlist();
  } else {
    // 1. Reset button text and state
    watchlistBtn.classList.remove('active');
    watchlistBtn.textContent = 'Watchlist';

    // 2. Re-enable controls
    if (dateSelect) dateSelect.disabled = false;
    if (ratingSelect) ratingSelect.disabled = false;
    if (genreSelect) genreSelect.disabled = false;
    if (searchInput) searchInput.disabled = false;

    // 3. Return to filtered movies feed
    applyFilters();
  }
}

// --- DISPLAY WATCHLIST ---
function displayWatchlist() {
  // Convert String IDs to Numbers for exact comparisons
  const watchlist = (JSON.parse(localStorage.getItem('watchlist')) || []).map(id => Number(id));

  if (watchlist.length === 0) {
    movieContainer.innerHTML = `<div class="movie-card"><h2>Your watchlist is empty.</h2></div>`;
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  movieContainer.innerHTML = `<div class="movie-card"><h2>Loading your watchlist...</h2></div>`;

  // Fetch full movie details for each saved ID
  const fetchPromises = watchlist.map(id =>
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`).then(res => res.json())
  );

  Promise.all(fetchPromises)
    .then(movies => {
      renderMovies(movies, true);
      if (loadMoreBtn) loadMoreBtn.style.display = 'none'; // Hide pagination in Watchlist mode
    })
    .catch(err => console.error("Error loading watchlist details:", err));
}

// --- ADD / REMOVE FROM WATCHLIST ---
function addToWatchlist(movieId) {
  let watchlist = (JSON.parse(localStorage.getItem('watchlist')) || []).map(id => Number(id));
  const numId = Number(movieId);

  if (!watchlist.includes(numId)) {
    watchlist.push(numId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert('Movie added to Watchlist!');
  } else {
    // Toggle remove if already present
    watchlist = watchlist.filter(id => id !== numId);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert('Movie removed from Watchlist!');

    // Re-render if currently viewing watchlist
    if (isWatchlistView) {
      displayWatchlist();
      return;
    }
  }

  // Update button texts on screen
  updateWatchlistButtons();
}

function updateWatchlistButtons() {
  const watchlist = (JSON.parse(localStorage.getItem('watchlist')) || []).map(id => Number(id));
  
  document.querySelectorAll('.add-watchlist-btn').forEach(button => {
    const btnId = Number(button.getAttribute('data-id'));
    if (watchlist.includes(btnId)) {
      button.textContent = 'Remove from Watchlist';
      button.classList.add('in-watchlist');
    } else {
      button.textContent = 'Add to Watchlist';
      button.classList.remove('in-watchlist');
    }
  });
}

// --- UNIFIED FILTER FUNCTION ---
function applyFilters() {
  currentPage = 1;
  searchInput.value = '';

  const year = dateSelect?.value || 'all';
  const rating = ratingSelect?.value || 'all';
  const genre = genreSelect?.value || 'all';

  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`;

  if (year !== 'all') {
    url += `&primary_release_year=${year}`;
  }

  if (genre === 'adult') {
    url += `&include_adult=true&sort_by=popularity.desc`;
  } else if (genre !== 'all') {
    url += `&with_genres=${genre}`;
  }

  if (rating === '8') {
    url += `&vote_average.gte=8`;
  } else if (rating === '5-7') {
    url += `&vote_average.gte=5&vote_average.lte=7`;
  } else if (rating === '0-4') {
    url += `&vote_average.gte=0&vote_average.lte=4`;
  }

  currentFetchUrl = url;

  fetch(`${currentFetchUrl}&page=${currentPage}`)
    .then(res => res.json())
    .then(data => {
      let movies = data.results || [];

      if (genre === 'adult') {
        movies = movies.filter(m => m.adult === true);
      }

      if (movies.length === 0) {
        movieContainer.innerHTML = `<div class="movie-card"><h2>No movies found matching these filters.</h2></div>`;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
      }

      renderMovies(movies, true);
    })
    .catch(err => console.error("Error applying filters:", err));
}

// --- SEARCH MOVIES ---
function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) {
    applyFilters();
    return;
  }

  currentPage = 1;
  currentFetchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;

  fetch(`${currentFetchUrl}&page=${currentPage}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) {
        movieContainer.innerHTML = `<div class="movie-card"><h2>No results found for "${query}"</h2></div>`;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
      }
      renderMovies(data.results, true);
    })
    .catch(err => console.error("Error searching movies:", err));
}

// --- LOAD MORE ---
function loadMoreMovies() {
  if (isLoading) return;
  isLoading = true;
  currentPage++;

  fetch(`${currentFetchUrl}&page=${currentPage}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0 || currentPage >= data.total_pages) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      }
      renderMovies(data.results, false);
    })
    .catch(err => console.error("Error loading more movies:", err))
    .finally(() => isLoading = false);
}

// --- RENDER MOVIES ---
function renderMovies(movies, overwrite = false) {
  let cardsHTML = '';

  movies.forEach(movie => {
    const title = movie.title || 'Untitled';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Poster';

    cardsHTML += `
      <div class="movie-card" data-id="${movie.id}">
        <img class="movie-poster" src="${posterUrl}" alt="${title}">
        <h2>${title}</h2>
        <p>Release Year: ${releaseYear}</p>
        <p>Rating: ${rating} ⭐</p>
        <button class="add-watchlist-btn" data-id="${movie.id}">Add to Watchlist</button>
      </div>
    `;
  });

  if (overwrite) {
    movieContainer.innerHTML = cardsHTML;
  } else {
    movieContainer.insertAdjacentHTML('beforeend', cardsHTML);
  }

  // Attach click listeners to Watchlist buttons on each card
  document.querySelectorAll('.add-watchlist-btn').forEach(button => {
    button.onclick = (event) => {
      event.stopPropagation();
      const movieId = button.getAttribute('data-id');
      addToWatchlist(movieId);
    };
  });

  updateWatchlistButtons();

  if (loadMoreBtn && !isWatchlistView) {
    loadMoreBtn.style.display = movies.length > 0 ? 'block' : 'none';
  }
}

// Initial App Startup
applyFilters();