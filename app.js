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
        return data;
    }

    async function getCinemaFilms() {
        const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&region=GB`);
        const data = await res.json();
        return data;
    }

    async function getGenreIDs(){
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-GB`);
        const data = await res.json();
        return data;
    }

    async function getFilmCertification(film) {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${film.id}/release_dates?api_key=${apiKey}`);
        const data = await res.json();
        return data;
    }

    return {
        getMovieData,
        getMovieLocation,
        getCinemaFilms,
        getGenreIDs,
        getFilmCertification
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
        },
        cinemaFilms: {
            cinemaReleasesBtn: "cinema-releases-btn",
            cinemaFilmBtns: ".cinema-film-btns",
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
        filmSearch.classList.replace("d-none", "d-flex");
        watchlist.classList.add("list-aside");

        backBtn.innerHTML = `Back to watchlist <i class="far fa-arrow-alt-circle-right"></i>`;
        backBtn.classList = "btn text-light";
        backBtn.id = "back-btn";
        watchlist.insertBefore(backBtn, watchlistTable);
    }

    const showFilm = (film) => {
        const div = document.getElementById(UISelectors.filmSearch.movieInfo);
        const date = new Date(film.release_date);
        
        div.classList.replace("d-none", "d-flex");
        div.innerHTML = `
            <div class="col-auto ">
                <img src="https://image.tmdb.org/t/p/original/${film.poster_path}" class="img-fluid rounded" alt="...">
            </div>
            <div class="card col">
                <div class="card-body">
                    <h5 class="card-title">${film.title} 
                        <span>(${film.certification})</span>
                        <em class="movie-info-year"> (${date.getFullYear()})</em>
                    </h5>
                    <p class="card-text">${film.overview}</p>
                            <p class="card-text">${UICtrl.getGenres(film)}
                            <p class="card-text">${UICtrl.getStarRating(film)}</p>
                            <p class="card-text"><small class="text-muted">${film.location}</small>
                    </p>
                    <button id="film-search-add-btn" class="btn btn-sm film-search-add-btn float-end mb-2">Add film to watchlist</button>
                </div>
            </div>
        `
    }

    const openCinemaReleases = () => {
        const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms)
        const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
        const watchlistTable = document.getElementById(UISelectors.watchlist.watchlistTable);
        const backBtn = document.createElement("button");
        cinemaFilms.classList.replace("d-none", "d-block");
        watchlist.classList.add("list-aside");
        backBtn.innerHTML = `<i class="far fa-arrow-alt-circle-left"></i> Back to watchlist`;
        backBtn.classList = "btn text-light";
        backBtn.id = "back-btn";
        watchlist.insertBefore(backBtn, watchlistTable);
    }

    const showCinemaFilms = (films) => {
        const ul = document.getElementById(UISelectors.cinemaFilms.cinemaFilmsList);
        ul.innerHTML = "";

        films.results.forEach(film => {
            const li =  document.createElement("li");
            li.classList = "cinema-films-item card col-5 col-lg-4";
            li.innerHTML = `
                <div class="card bg-dark text-white h-100">
                    <img src="https://image.tmdb.org/t/p/original/${film.poster_path}" class="card-img h-100" alt="...">
                    <div class="card-img-overlay">
                        <h3 class="card-title">${film.title}</h3>
                        <div class="cinema-film-btns">
                            <button class="btn btn-primary">Details</button>
                            <button class="btn btn-primary cinema-add-btn text-nowrap">Add to Watchlist</button>
                        </div>
                    </div>
                </div>
            `
            ul.appendChild(li);
        })
    }

    const openCinemaFilmDetails = (film, e) => {
        // open details modal
        e.target.closest("li").classList.add("cinema-film-details", "flex-row");
        console.log(film);

        // Change card type
        e.target.closest(".card"). classList.add("flex-row");
        const body = e.target.closest(".card-img-overlay");
        body.classList = "card-body d-flex flex-column align-items-center justify-content-between";

        // add film details to card modal
        const div = document.createElement("div");
        const date = new Date(film.release_date);
        div.innerHTML = `
            <i id="details-close-btn" class="fas fa-times"></i>
            <p>${film.overview}</p>
            <p>
                Release Date: ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}
            </p>
            <p>Age Rating: PG</p>
            <div>
                Genre: 
                    ${UICtrl.getGenres(film)}
            </div>
            <div> 
                Rating: 
                    ${UICtrl.getStarRating(film)}
            </div>
        `;
        div.className = "card-text";
        body.insertBefore(div, e.target.parentElement);
    }

    const getGenres = (film) => {
        let genres = "";
        film.genres.forEach(genre => {
            genres += `<span class="badge bg-primary">${genre}</span> `
        })
        return genres;
    }

    const getStarRating = (film) => {
        let stars = "";

        for(let i=0; i < 5; i++){
            if(i < Math.round((film.vote_average/2))){
                stars += `<i class="fas fa-star"></i>`
            } else {
                stars += `<i class="far fa-star"></i>`
            }
        }
        return stars
    }

    const closeCinemaFilmDetails = (e) => {
        // remove modal layout
        e.target.closest("li").classList.remove("cinema-film-details", "flex-row");

        // change card type
        e.target.closest(".card"). classList.remove("flex-row");
        e.target.closest(".card-body").classList = "card-img-overlay";

        // remove added film details
        e.target.closest(".card-img-overlay").firstElementChild.nextElementSibling.remove();
    }

    const closeSearches = () => {
        const filmSearch = document.getElementById(UISelectors.filmSearch.filmSearch);
        const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms);
        const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
        filmSearch.classList.replace("d-flex", "d-none");
        cinemaFilms.classList.replace("d-block", "d-none");
        watchlist.classList.remove("list-aside");
        watchlist.firstElementChild.nextElementSibling.remove();
    }

    return {
        getSelectors,
        populateWatchlist,
        openFilmSearch,
        showFilm,
        closeSearches,
        openCinemaReleases,
        showCinemaFilms,
        openCinemaFilmDetails,
        getGenres,
        getStarRating,
        closeCinemaFilmDetails
    }
})();

const App = ((APICtrl, StorageCtrl, UICtrl) => {
    const loadEventListeners = () => {
        // Get UI selectors
        const UISelectors = UICtrl.getSelectors();

        // Open film search
        document.getElementById(UISelectors.filmSearch.searchFilmBtn).addEventListener("click", searchFilmClick);

        //Close film search
        document.getElementById(UISelectors.watchlist.watchlist).addEventListener("click", backClick);
        
        //Movie input event
        document.getElementById(UISelectors.filmSearch.movieInput).addEventListener("keyup", inputMovieKeyup);
        
        //Open cinema release
        document.getElementById(UISelectors.cinemaFilms.cinemaReleasesBtn).addEventListener("click", cinemaReleasesClick);
    }

    // Film Search
    const searchFilmClick = () => {
        UICtrl.openFilmSearch();
    }
    
    const inputMovieKeyup = (e) => {
        const movieSearch = document.getElementById(UICtrl.getSelectors().filmSearch.movieInput).value;
        const movieQuery = movieSearch.replace(" ", "+");
        // get film data
        APICtrl.getMovieData(movieQuery)
        .then(film => {
            // Get certification, location & genres
            Promise.all([APICtrl.getMovieLocation(film), APICtrl.getGenreIDs(), APICtrl.getFilmCertification(film)])
            .then(res => {

                // Set film location
                if(res[0].results.GB === undefined) {
                    film.location = "*Unavailable for streaming*";
                } else {
                    const locations = res[0].results.GB;
                    film.location = "";
            
                    if(locations.flatrate === undefined) {
                        film.location = "*Unavailable for streaming*";
                    } else {
                        locations.flatrate.forEach((provider, index) => {
                            film.location += `${provider.provider_name} `;
                
                            if(index < locations.flatrate.length-1){
                                film.location += ", ";
                            }
                        })
                    }
                }

                // Set film genres
                const genres = film.genre_ids.map(id => {
                    return res[1].genres.find(item => item.id === id).name;
                })
                film.genres = genres;

                // Set film certification
                const releaseDateInfo = res[2].results.find(obj => {
                    return obj.iso_3166_1 === "GB";
                });
                film.certification = releaseDateInfo.release_dates[0].certification;

                // show film in ui
                UICtrl.showFilm(film);

                // add event listener to add btn
                document.getElementById(UICtrl.getSelectors().filmSearch.filmSearchAddBtn).onclick = () => {
                    // add film to watchlist
                    addFilmClick(film, e);
                };
            })
        })
    }

    const addFilmClick = (film, e) => {
        // add film to local storage
        StorageCtrl.addFilmToLocalStorage(film);
        // refresh watchlist with new film
        UICtrl.populateWatchlist();

        if(e.target.closest("li") !== null && e.target.closest("li").classList.contains("cinema-film-details")){
            UICtrl.closeCinemaFilmDetails(e);
        }
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

                // get cinema list btns
                const cinemaList = document.querySelectorAll(UICtrl.getSelectors().cinemaFilms.cinemaFilmBtns);
                // add event listeners cinema btns
                cinemaList.forEach((item, index) => {
                    // add event listener to details btn
                    item.firstElementChild.addEventListener("click", function(e){
                        cinemaFilmDetailsClick(data.results[index], e);
                    })

                    // add event listener to add btn
                    item.lastElementChild.addEventListener("click", function(){
                        // add film location
                        data.results[index].location = "Cinema";
                        // Add film to watchlist
                        addFilmClick(data.results[index])
                    })
                })
            })
    }

    // Open cinema film details modal
    const cinemaFilmDetailsClick = (film, e) => {
        APICtrl.getGenreIDs()
            .then(data => {
                // Add genres to film data
                const genres = film.genre_ids.map(id => {
                    return data.genres.find(item => item.id === id).name;
                })
                film.genres = genres;
                // open film details
                UICtrl.openCinemaFilmDetails(film, e);
                // add event listener to close btn
                const closeBtn = e.target.parentElement.previousElementSibling.firstElementChild;
                closeBtn.addEventListener("click", closeFilmDetailsClick);
            })

    }

    // Close cinema film details modal
    const closeFilmDetailsClick = (e) => {
        UICtrl.closeCinemaFilmDetails(e);
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

