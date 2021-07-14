const APICtrl = (() => {
    const apiKey = "8ed514450ca5d54b5bc425d6d68cc9f8";


    async function getMovieData(movie) {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${movie}`);
        const data = await res.json();
        getMovieLocation(data);
        return data;
    }

    return {
        getMovieData
    }

})();

const UICtrl = (() => {
    const UISelectors = {
        watchlist: {
            watchlist: "watchlist",
            watchlistTable: "watchlist-table",
        },
        filmSearch: {
            searchFilmBtn: "search-film-btn",
            filmSearch: "film-search",
            movieInfo: "movie-info",
            movieInput: "movie-input",
            movieInfoTitle: "movie-info-title",
            movieInfoDesc: "movie-info-desc",
            movieInfoImg: "movie-info-img",
        },
    }

    const getSelectors = () => {
        return UISelectors;
    }

    const openFilmSearch = () => {
        const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
        const watchlistTable = document.getElementById(UISelectors.watchlist.watchlistTable);
        const backBtn = document.createElement("button");
        const filmSearch = document.getElementById(UISelectors.filmSearch.filmSearch);
        filmSearch.style.display = "flex";
        watchlist.classList.add("list-aside");

        backBtn.innerText = "Back to watchlist ->";
        backBtn.classList = "btn text-light";
        backBtn.id = "back-btn";
        watchlist.insertBefore(backBtn, watchlistTable);
    }

    const closeSearches = () => {
        const filmSearch = document.getElementById(UISelectors.filmSearch.filmSearch);
        const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms);
        const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
        filmSearch.style.display = "none";
        cinemaFilms.style.display = "none";
        watchlist.classList.remove("list-aside");
        watchlist.firstElementChild.remove();
    }

    const showFilm = (movie) => {
        document.getElementById(UISelectors.filmSearch.movieInfo).style.display = "flex";

        const title = document.getElementById(UISelectors.filmSearch.movieInfoTitle);
        const desc = document.getElementById(UISelectors.filmSearch.movieInfoDesc);
        const img = document.getElementById(UISelectors.filmSearch.movieInfoImg);

        title.innerText = movie.results[0].original_title;
        desc.innerText = movie.results[0].overview;
        img.setAttribute("src", `https://image.tmdb.org/t/p/original/${movie.results[0].poster_path}`);

        const yearEl = document.createElement("em");
        const date = new Date(movie.results[0].release_date);
        yearEl.innerText = `(${date.getFullYear()})`;
        yearEl.classList.add("movie-info-year");
        title.appendChild(yearEl);
    }

    return {
        getSelectors,
        openFilmSearch,
        closeSearches,
        showFilm
    }
})();

const App = ((APICtrl, StorageCtrl, UICtrl) => {
    const loadEventListeners = () => {
        // Get UI selectors
        const UISelectors = UICtrl.getSelectors();

        // Open film search
        document.getElementById(UISelectors.filmSearch.searchFilmBtn).addEventListener("click", searchFilmClick);

        // // Close film search
        document.getElementById(UISelectors.watchlist.watchlist).addEventListener("click", backClick);
        
        // // Movie input event
        document.getElementById(UISelectors.filmSearch.movieInput).addEventListener("keyup", inputMovieKeyup);
    }

    // Film Search
    const searchFilmClick = () => {
        UICtrl.openFilmSearch();
    }
    
    const inputMovieKeyup = (e) => {
        const movieSearch = document.getElementById(UICtrl.getSelectors().filmSearch.movieInput).value;
        const movieQuery = movieSearch.replace(" ", "+");
        APICtrl.getMovieData(movieQuery)
        .then(data => {
            UICtrl.showFilm(data);
        });
    }

    const backClick = (e) => {
        if(e.target.id === "back-btn"){
            UICtrl.closeSearches();
        }
    }

    // Initialisation
    const init = () => {
        // Load event listeners
        loadEventListeners();
    }

    return {
        init
    }

})(APICtrl, StorageCtrl, UICtrl);

// Initialise App
App.init();

