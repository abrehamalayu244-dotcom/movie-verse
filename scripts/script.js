const API_KEY = "ad1717b78cfece8796b319056504cea4";
const movieContainer = document.querySelector('.movie-container');
const searchInput = document.querySelector('.search-input')
// Switched to 'movie/popular' to get 20 full trending movies
document.querySelector('#date').addEventListener('change', (event) => {loadMoviesByyear(event.target.value)});
searchInput.addEventListener('input', searchMovies);
document.querySelector('#rating').addEventListener('change', (event) => {loadMoviesByRating(event.target.value)});
document.querySelector('#type-select').addEventListener('change', (event) => {loadmoviesByGenre(event.target.value)});



function searchMovies() {
  const query = searchInput.value.trim();

  // If search bar is empty, load popular movies again
  if (query === '') {
    loadPopularMovies()
     return;
  }

  // Fetch search results from TMDB API
  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      const movies = data.results;
      let cardsHTML = '';

      if (!movies || movies.length === 0) {
        movieContainer.innerHTML = `
          <div class="movie-card" data-id="${movie.id}">
            <h2>No results found for "${query}"</h2>
          </div>
        `;
        return;
      }

      movies.forEach(movie => {
        let title = movie.title;
        let rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        let releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

        let posterUrl = movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'https://via.placeholder.com/500x750?text=No+Poster';

        cardsHTML += `
          <div class="movie-card" data-id="${movie.id}">
            <img class="movie-poster" src="${posterUrl}" alt="${title}">
            <h2>${title}</h2>
            <p>Release Year: ${releaseYear}</p>
            <p>Rating: ${rating} ⭐</p>
          </div>
        `;
      });

      movieContainer.innerHTML = cardsHTML;
    })
    .catch(error => console.error("Error searching movies:", error));
}

// Event Listener

function loadPopularMovies() {

fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`)
  .then(response => response.json())
  .then(data => {
    const movies = data.results;
    let cardsHTML = '';

    movies.forEach(movie => {
      let title = movie.title;
      let rating = movie.vote_average;
      let releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

      // Fix missing poster issue
      let posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      cardsHTML += `
        <div class="movie-card" data-id="${movie.id}">
          <img class="movie-poster" src="${posterUrl}" alt="${title}">
          <h2>${title}</h2>
          <p>Release Year: ${releaseYear}</p>
          <p>Rating: ${rating} ⭐</p>
        </div>
      `;
    });

    movieContainer.innerHTML = cardsHTML;
  })
  .catch(error => console.error("Error:", error));

}



function loadMoviesByyear(year) {
    if (year==='all') {
        loadPopularMovies();
        return;
    }
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}`)
    .then(response => response.json())
    .then(data => {
      const movies = data.results;
      let cardsHTML = '';
      movies.forEach(movie => {
      let title = movie.title;
      let rating = movie.vote_average;
      let releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';

      // Fix missing poster issue
      let posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      cardsHTML += `
        <div class="movie-card" data-id="${movie.id}">
          <img class="movie-poster" src="${posterUrl}" alt="${title}">
          <h2>${title}</h2>
          <p>Release Year: ${releaseYear}</p>
          <p>Rating: ${rating} ⭐</p>
        </div>
      `;
    });

    movieContainer.innerHTML = cardsHTML;
  })
  .catch(error => console.error("Error:", error))
}


function loadMoviesByRating(rating) {
    let fetchUrl = '';
    if (rating==='all') {
        loadPopularMovies();
        return;
    } else if (rating==='8') {
         fetchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&vote_average.gte=${rating}`;
    } else if (rating==='5-7') {
        fetchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&vote_average.gte=5&vote_average.lte=7`;
    } else if (rating==='0-4') {
        fetchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&vote_average.gte=0&vote_average.lte=4`;
    }

    fetch(fetchUrl)
    .then(response => response.json())
    .then(data => {
      const movies = data.results;
      let cardsHTML = '';
      movies.forEach(movie => {
      let title = movie.title;
      let rating = movie.vote_average;
      let releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
      let posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';
        cardsHTML += `
        <div class="movie-card" data-id="${movie.id}">
          <img class="movie-poster" src="${posterUrl}" alt="${title}">
          <h2>${title}</h2>
          <p>Release Year: ${releaseYear}</p>
          <p>Rating: ${rating} ⭐</p>
        </div>
      `;
    });

    movieContainer.innerHTML = cardsHTML;
  })
  .catch(error => console.error("Error:", error))
}


function loadmoviesByGenre(genreId) {
    if (genreId==='all') {
        loadPopularMovies();
        return;
    } 
      fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`)
      .then(response => response.json())
      .then(data => { 
            const movies = data.results;
      let cardsHTML = '';
      movies.forEach(movie => {
      let title = movie.title;
      let rating = movie.vote_average;
      let releaseYear = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
      let posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';
        cardsHTML += `
        <div class="movie-card" data-id="${movie.id}">
          <img class="movie-poster" src="${posterUrl}" alt="${title}">
          <h2>${title}</h2>
          <p>Release Year: ${releaseYear}</p>
          <p>Rating: ${rating} ⭐</p>
        </div>
      `;
    });

    movieContainer.innerHTML = cardsHTML;
  })
  .catch(error => console.error("Error:", error))
}

// Select Modal Elements
const modal = document.querySelector('#movie-modal');
const modalDetails = document.querySelector('#modal-details');
const closeBtn = document.querySelector('.close-btn');

// 1. Add data-id to your cards when generating HTML
// Make sure inside your innerHTML loop you have:
// <div class="movie-card" data-id="${movie.id}" data-id="${movie.id}"> ... </div>


// 2. Fetch Detailed Data for a Single Movie
function showMovieDetails(movieId) {
    console.log("Fetching details for movie ID:", movieId);
  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`)
    .then(response => response.json())
    .then(movie => {
      // Format genres list (e.g. Action, Drama)
      const genres = movie.genres.map(g => g.name).join(', ');
      
      const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

      // Build the detailed modal HTML
      modalDetails.innerHTML = `
        <img class="movie-poster" src="${posterUrl}" alt="${movie.title}" style="max-width: 200px;">
        <h2>${movie.title}</h2>
        <p><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
        <p><strong>Runtime:</strong> ${movie.runtime ? movie.runtime + ' mins' : 'N/A'}</p>
        <p><strong>Genres:</strong> ${genres || 'N/A'}</p>
        <p><strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ⭐</p>
        <h3>Overview</h3>
        <p>${movie.overview || 'No overview available.'}</p>
      `;

      // Show the modal
      modal.classList.remove('hidden');
    })
    .catch(error => console.error("Error fetching movie details:", error));
}


// 3. Click Listener on the Movie Grid Container (Event Delegation)
movieContainer.addEventListener('click', (event) => {
  const card = event.target.closest('.movie-card');
  console.log("card clicked",card)
  if (card) {
    const movieId = card.getAttribute('data-id');
    console.log("movieId",movieId)
    if (movieId) {
      showMovieDetails(movieId);
    }
  }
});


// 4. Close Modal Logic
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Close when clicking dark background outside the modal content
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

loadPopularMovies()
