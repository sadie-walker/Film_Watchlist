const APICtrl = (() => {
    const apiKey = "8ed514450ca5d54b5bc425d6d68cc9f8";


    async function getMovieData(title) {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${title}`);
        const data = await res.json();
        let movie = data.results[0];
        return movie;
    }

    async function getMovieLocation(movie) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${apiKey}`);
        const data = await res.json();
        const locations = data.results.GB;
        movie.location = "";

        locations.flatrate.forEach((provider, index) => {
            movie.location += `${provider.provider_name} `;

            if(index < locations.flatrate.length-1){
                movie.location += ", ";
            }
        })
        return movie;
    }

    async function getCinemaFilms() {
        const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&region=GB`);
        const data = await res.json();
        return data;
    }

    return {
        getMovieData,
        getMovieLocation,
        getCinemaFilms
    }

})();

const StorageCtrl = (() => {
    
    const getWatchlistFromLocalStorage = () => {
        let watchlist;        

        if(localStorage.getItem("watchlist") === null){
            watchlist = [];
        } else {
            watchlist = JSON.parse(localStorage.getItem("watchlist"));;
        }
        return watchlist;
    }

    const addFilmToLocalStorage = (film) => {
        let watchlist = StorageCtrl.getWatchlistFromLocalStorage();
        watchlist.push(film);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    }

    return {
        addFilmToLocalStorage,
        getWatchlistFromLocalStorage
    }
})();

const UICtrl = (() => {
    const UISelectors = {
        watchlist: {
            watchlist: "watchlist",
            watchlistTable: "watchlist-table",
            watchlistTableBody: "#watchlist-table tbody",
        },
        filmSearch: {
            searchFilmBtn: "search-film-btn",
            filmSearchAddBtn: "film-search-add-btn",
            filmSearch: "film-search",
            movieInfo: "movie-info",
            movieInput: "movie-input",
            movieInfoTitle: "movie-info-title",
            movieInfoDesc: "movie-info-desc",
            movieInfoImg: "movie-info-img",
            movieInfoLocation: "movie-info-location",
        },
        cinemaFilms: {
            cinemaReleasesBtn: "cinema-releases-btn",
            cinemaAddBtn: ".cinema-add-btn",
            cinemaFilms: "cinema-films",
            cinemaFilmsList: "cinema-films-list"
        }
    }

    const getSelectors = () => {
        return UISelectors;
    }

    const populateWatchlist = () => {
        const table = document.querySelector(UISelectors.watchlist.watchlistTableBody);
        const watchlist = StorageCtrl.getWatchlistFromLocalStorage();
        table.innerHTML = "";
        watchlist.forEach(film => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td class="text-nowrap">${film.title} (${new Date(film.release_date).getFullYear()})</td>
                <td class="watchlist-desc">${film.overview}</td>
                <td><img src="https://image.tmdb.org/t/p/original/${film.poster_path}"</td>
                <td>${film.location}</td>
            `
            table.appendChild(tr);
        })
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
        const location = document.getElementById(UISelectors.filmSearch.movieInfoLocation);

        title.innerText = movie.original_title;
        desc.innerText = movie.overview;
        img.setAttribute("src", `https://image.tmdb.org/t/p/original/${movie.poster_path}`);
        location.innerText = movie.location;

        const yearEl = document.createElement("em");
        const date = new Date(movie.release_date);
        yearEl.innerText = `(${date.getFullYear()})`;
        yearEl.classList.add("movie-info-year");
        title.appendChild(yearEl);
    }

    const openCinemaReleases = () => {
        const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms)
        const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
        const watchlistTable = document.getElementById(UISelectors.watchlist.watchlistTable);
        const backBtn = document.createElement("button");
        cinemaFilms.style.display = "block";
        watchlist.classList.add("list-aside");

        backBtn.innerText = "<- Back to watchlist";
        backBtn.classList = "btn text-light";
        backBtn.id = "back-btn";
        watchlist.insertBefore(backBtn, watchlistTable);
    }

    const showCinemaFilms = (films) => {
        const list = document.getElementById(UISelectors.cinemaFilms.cinemaFilmsList);
        list.innerHTML = "";

        let ul = document.createElement("ul");
        ul.classList = "list-unstyled d-flex flex-wrap";

        films.results.forEach(film => {
            const li =  document.createElement("li");
            li.classList = "card mb-4 mx-2";
            li.innerHTML = `
                <img src="https://image.tmdb.org/t/p/original/${film.poster_path}" class="card-img-top">
                <div class="card-body d-flex flex-column align-items-center justify-content-between">
                    <h3 class="card-title text-dark">${film.original_title}</h3>
                    <div>
                        <button class="btn btn-primary">Details</button>
                        <button class="btn btn-primary cinema-add-btn">Add to Watchlist</button>
                    </div>
                </div>
            `
            ul.appendChild(li);
        })
        list.appendChild(ul);
    }

    return {
        getSelectors,
        populateWatchlist,
        openFilmSearch,
        closeSearches,
        showCinemaFilms,
        openCinemaReleases,
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
        
        // // Open cinema release
        document.getElementById(UISelectors.cinemaFilms.cinemaReleasesBtn).addEventListener("click", cinemaReleasesClick);

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
            APICtrl.getMovieLocation(data)
            .then(data => {
                UICtrl.showFilm(data);

                // add event listener to add btn
                document.getElementById(UICtrl.getSelectors().filmSearch.filmSearchAddBtn).addEventListener("click", function(){
                    // add film to watchlist
                    addFilmClick(data);
                });
            })
        });
    }

    const addFilmClick = (film) => {
        // add film to local storage
        StorageCtrl.addFilmToLocalStorage(film);
        // refresh watchlist with new film
        UICtrl.populateWatchlist();
    }

    const backClick = (e) => {
        if(e.target.id === "back-btn"){
            // close film search / cinema releases
            UICtrl.closeSearches();
        }
    }

    // Cinema Releases
    const cinemaReleasesClick = () => {
        // open cinema releases
        UICtrl.openCinemaReleases();
        // get films from api
        APICtrl.getCinemaFilms()
            .then(data => {                
                // show films in ui
                UICtrl.showCinemaFilms(data);

                // get cinema list
                const cinemaList = document.querySelectorAll(UICtrl.getSelectors().cinemaFilms.cinemaAddBtn);
                // add event listener to each cinema btn
                cinemaList.forEach((item, index) => {
                    item.addEventListener("click", function(){
                        // add film location
                        data.results[index].location = "Cinema";

                        // Add film to watchlist
                        addFilmClick(data.results[index])
                    })
                })
            })
    }

    // Initialisation
    const init = () => {
        // Load event listeners
        loadEventListeners();

        // Load watchlist from local storage
        UICtrl.populateWatchlist();
    }

    return {
        init
    }

})(APICtrl, StorageCtrl, UICtrl);

// Initialise App
App.init();

