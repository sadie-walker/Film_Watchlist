import * as API from "./api.js";
import * as UI from "./ui.js";
import * as Storage from "./storage.js";

const loadEventListeners = () => {
    // Get UI selectors
    const UISelectors = UI.getSelectors();

    // Open film search
    document.getElementById(UISelectors.header.searchFilmBtn).addEventListener("click", searchFilmClick);

    //Close film search
    document.getElementById(UISelectors.header.watchlistBtn).addEventListener("click", openWatchlist);
    
    //film input event
    document.getElementById(UISelectors.filmSearch.filmInput).addEventListener("keyup", inputFilmKeyup);
    
    //Open cinema release
    document.getElementById(UISelectors.header.cinemaReleasesBtn).addEventListener("click", cinemaReleasesClick);
}

// Film Search
const searchFilmClick = () => {
    UI.openFilmSearch();
}

const inputFilmKeyup = () => {
    const filmSearch = document.getElementById(UI.getSelectors().filmSearch.filmInput).value;
    const filmQuery = filmSearch.replace(" ", "+");

    // get film search results
    API.getFilmData(filmQuery)
    .then(data => {
        // Show dropdown list of film results
        const regex = new RegExp(`^${filmQuery}`, "i");
        const results = data.filter(film => {
            return regex.test(film.title);
        })
        results.splice(5);
        UI.createDropdownMenu(results);

        // Get certification, location & genres
        const film = results[0];
        consolidateFilmDetails(film, showFilm);
    })
    .catch(err => {
        console.log("Film not found " + err );
    })
}

// Film selected from dropdown
export const filmSearchDropdownClick = film => {
    document.getElementById(UI.getSelectors().filmSearch.filmInput).value = film.title;
    consolidateFilmDetails(film, showFilm);   
}

// Set film location, film genres & certifcation
const consolidateFilmDetails = (film, callback) => {
    Promise.all([API.getFilmLocation(film), API.getGenreIDs(), API.getFilmCertification(film)])
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
                    film.location += `${provider.provider_name}`;
        
                    if(index < locations.flatrate.length-1){
                        film.location += ",   ";
                    }
                })
            }
        }

        // Set film genres
        if(res[1].genres !== undefined){
            const genres = film.genre_ids.map(id => {
                return res[1].genres.find(item => item.id === id).name;
            })
            film.genres = genres;
        }

        // Set film certification
        if(res[2].results.GB !== undefined){
            const releaseDateInfo = res[2].results.find(obj => {
                return obj.iso_3166_1 === "GB";
            });
            film.certification = releaseDateInfo.release_dates[0].certification;
        }

        // Callback
        callback(film);
    });
}

const showFilm = film => {
    // show film in UI
    UI.showFilm(film);

    // add event listener to add btn
    document.getElementById(UI.getSelectors().filmSearch.filmSearchAddBtn).onclick = e => {
        // add film to watchlist
        addFilmClick(film, e);
    };
}

const addFilmClick = (film, e) => {
    // check if film is already in watchlist
    const duplicate = Storage.watchlistCheckDuplicate(film);

    if(!duplicate){
        // add film to local storage
        Storage.addFilmToLocalStorage(film);
        // refresh watchlist with new film
        UI.populateWatchlist(Storage.getWatchlistFromLocalStorage());
        UI.showAlert("alert-success", `<strong>${film.title}</strong> has been added to your watchlist.`);
    } else {
        UI.showAlert("alert-warning", `<strong>${film.title}</strong> is already in your watchlist.`);
    }

    // close film details once added
    if(e.target.closest("li") !== null && e.target.closest("li").classList.contains("cinema-film-details")){
        UI.closeCinemaFilmDetails(e);
    }
}

export const mouseenterWatchlistItem = (e) => {
    const row = e.target.closest("tr");
    const div = row.lastElementChild.firstElementChild;
    if(div.childElementCount <= 1){
        div.innerHTML += `<i id="delete-btn" class="fas fa-trash float-end me-4"></i>`;
        div.addEventListener("click", deleteBtnClicked);
    }
}

export const mouseleaveWatchlistItem = (e) => {
    const row = e.target.closest("tr");
    const i = row.lastElementChild.firstElementChild.lastElementChild;
    i.remove();
}

const deleteBtnClicked = (e) => {
    if(e.target.id === UI.getSelectors().watchlist.deleteBtn){
        // delete film
        Storage.deleteFilmFromLocalStorage(e);
        // update watchlist
        UI.populateWatchlist(Storage.getWatchlistFromLocalStorage());
        
        // show alert for deletion
        let filmTitle = e.target.closest("tr").firstElementChild.nextElementSibling.innerText;
        filmTitle = filmTitle.replace(/\ \(([^)]+)\)/, "");
        UI.showAlert("alert-danger", `<strong>${filmTitle}</strong> has been removed from your watchlist.`);
    }
}

const openWatchlist = () => {
    const navBtns = document.getElementById(UI.getSelectors().header.navBtns);
    navBtns.classList.remove("cinema-open", "film-search-open");
    navBtns.classList.add("watchlist-open");
    UI.closeSearches();
}

// Cinema Releases
const cinemaReleasesClick = () => {
    // open cinema releases
    UI.openCinemaReleases();
    // get films from API
    API.getCinemaFilms()
        .then(data => {                
            // show films in UI
            UI.showCinemaFilms(data);

            // get cinema list btns
            const cinemaList = document.querySelectorAll(UI.getSelectors().cinemaFilms.cinemaFilmBtns);
            // add event listeners cinema btns
            cinemaList.forEach((item, index) => {
                // add event listener to details btn
                item.firstElementChild.addEventListener("click", function(e){
                    cinemaFilmDetailsClick(data.results[index], e);
                })

                // add event listener to add btn
                item.lastElementChild.addEventListener("click", function(e){
                    // add film location
                    data.results[index].location = "Cinema";
                    // Add film to watchlist
                    addFilmClick(data.results[index], e)
                })
            })
        })
}

// Open cinema film details modal
const cinemaFilmDetailsClick = (film, e) => {
    API.getGenreIDs()
        .then(data => {
            // Add genres to film data
            const genres = film.genre_ids.map(id => {
                return data.genres.find(item => item.id === id).name;
            })
            film.genres = genres;
            // open film details
            UI.openCinemaFilmDetails(film, e);
            // add event listener to close btn
            const closeBtn = e.target.parentElement.previousElementSibling.firstElementChild;
            closeBtn.addEventListener("click", closeFilmDetailsClick);
        })
}

// Close cinema film details modal
const closeFilmDetailsClick = (e) => {
    UI.closeCinemaFilmDetails(e);
}

// Initialisation
const init = () => {
    // Load event listeners
    loadEventListeners();

    // Load watchlist from local storage
    UI.populateWatchlist(Storage.getWatchlistFromLocalStorage());
}


// Initialise App
init();

