import * as App from "./app.js";

const UISelectors = {
    header: {
        navBtns: "nav-btns",
        searchFilmBtn: "search-film-btn",
        watchlistBtn: "watchlist-btn",
        cinemaReleasesBtn: "cinema-releases-btn"
    },
    watchlist: {
        watchlist: "watchlist",
        watchlistTable: "watchlist-table",
        watchlistTableBody: "#watchlist-table tbody",
        deleteBtn: "delete-btn",
    },
    filmSearch: {
        filmSearchAddBtn: "film-search-add-btn",
        filmSearch: "film-search",
        filmInfo: "film-info",
        filmInput: "film-input",
        dropdown: "film-results-dropdown",
    },
    cinemaFilms: {
        cinemaFilmBtns: ".cinema-film-btns",
        cinemaFilms: "cinema-films",
        cinemaFilmsList: "cinema-films-list"
    }
}

export const getSelectors = () => {
    return UISelectors;
}

export const populateWatchlist = (watchlist) => {
    const table = document.querySelector(UISelectors.watchlist.watchlistTableBody);
    table.innerHTML = "";
    watchlist.forEach(film => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="p-0">
                <img src="https://image.tmdb.org/t/p/original/${film.poster_path}">
            </td>
            <td>${film.title} (${new Date(film.release_date).getFullYear()})</td>
            <td class="watchlist-desc"><div>${film.overview}</div></td>
            <td>
                <div class="d-flex align-items-center justify-content-between">${getLocationList(film)}</div>
            </td>
            `
        tr.addEventListener("mouseenter", App.mouseenterWatchlistItem);
        tr.addEventListener("mouseleave", App.mouseleaveWatchlistItem);
        table.appendChild(tr);
    })

    checkEmptyTable();
}

export const openFilmSearch = () => {
    const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
    const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms);
    const filmSearch = document.getElementById(UISelectors.filmSearch.filmSearch);
    const navBtns = document.getElementById(UISelectors.header.navBtns);

    navBtns.classList.remove("watchlist-open", "cinema-open");
    navBtns.classList.add("film-search-open");
    
    filmSearch.classList.replace("d-none", "d-flex");
    cinemaFilms.classList.replace("d-block", "d-none");
    watchlist.classList.add("list-aside");
}

export const showFilm = (film) => {
    const div = document.getElementById(UISelectors.filmSearch.filmInfo);
    const date = new Date(film.release_date);

    div.classList.replace("d-none", "d-flex");
    div.innerHTML = `
        <div class="card">
            <div class="row">
                <div class="col-md-6 col-xxl-4">
                    <img src="https://image.tmdb.org/t/p/original/${film.poster_path}" class="img-fluid rounded" alt="...">
                </div>
                <div class="col-md-6 col-xxl-8">
                    <div class="card-body">
                        <h5 class="card-title">${film.title} 
                            ${getCertification(film)}
                            <em class="film-info-year"> (${date.getFullYear()})</em>
                        </h5>
                        <p class="card-text">${film.overview}</p>
                                <p class="card-text">${getGenres(film)}
                                <p class="card-text">${getStarRating(film)}</p>
                                <p class="card-text"><small class="text-muted">${film.location}</small>
                        </p>
                        <button id="film-search-add-btn" class="btn btn-sm film-search-add-btn float-end mb-2 ml-8">Add film to watchlist</button>
                    </div>
                </div>
            </div>
        </div>
    `
}

export const openCinemaReleases = () => {
    const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms);
    const filmSearch = document.getElementById(UISelectors.filmSearch.filmSearch);
    const watchlist = document.getElementById(UISelectors.watchlist.watchlist);
    const navBtns = document.getElementById(UISelectors.header.navBtns);

    navBtns.classList.remove("watchlist-open", "film-search-open");
    navBtns.classList.add("cinema-open");

    cinemaFilms.classList.replace("d-none", "d-block");
    filmSearch.classList.replace("d-flex", "d-none");
    watchlist.classList.add("list-aside", "cinema-open");
}

export const showCinemaFilms = (films) => {
    const ul = document.getElementById(UISelectors.cinemaFilms.cinemaFilmsList);
    ul.innerHTML = "";

    films.results.forEach(film => {
        const li =  document.createElement("li");
        li.classList = "col-5 col-lg-4";
        li.innerHTML = `
            <div class="card bg-dark text-white h-100">
                <img src="https://image.tmdb.org/t/p/original/${film.poster_path}" class="card-img h-100 cinema-film-poster" alt="...">
                <div class="card-img-overlay">
                    <h3 class="card-title">${film.title}</h3>
                    <div class="cinema-film-btns d-flex justify-content-center flex-wrap">
                        <button class="btn m-1">Details</button>
                        <button class="btn cinema-add-btn text-nowrap m-1">Add to Watchlist</button>
                    </div>
                </div>
            </div>
        `
        ul.appendChild(li);
    })
}

export const openCinemaFilmDetails = (film, e) => {
    // add bg overlay
    const list = document.getElementById(UISelectors.cinemaFilms.cinemaFilmsList)
    list.classList.add("film-details-open");

    // remove scroll
    document.querySelector("body").style.overflow = "hidden";

    // open details modal
    e.target.closest("li").classList.add("cinema-film-details");

    // Change card type
    e.target.closest(".card"). classList.add("flex-md-row");
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
        <div>
            <p class="d-inline-block">Age Rating:</p>
            ${getCertification(film)}
        </div>
        <div>
            <p class="d-inline-block">Genre:</p>
            ${getGenres(film)}
        </div>
        <div> 
            <p class="d-inline-block">Rating:</p>
            ${getStarRating(film)}
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

const getLocationList = (film) => {
    const arr = film.location.split(", ");

    if(arr.length > 1){
        let ul = `<ul class="d-inline-block ms-2 mb-0">`;
        arr.forEach(item => {
            ul += `<li>${item}</li>`;
        })
        ul += `</ul>`;
        return ul;
    } else {
        return arr[0];
    }
}

const getCertification = (film) => {
    const cert = film.certification;
    console.log(cert);

    switch(cert){
        case undefined || "":
            return ``;
        case "U":
            return `<img src="/imgs/BBFC_U.svg" alt="U" class="age-rating">`;
        case "PG":
            return `<img src="/imgs/BBFC_PG.svg" alt="PG" class="age-rating">`;
        case "12A":
            return `<img src="/imgs/BBFC_12A.svg" alt="12A" class="age-rating">`;
        case "12":
            return `<img src="/imgs/BBFC_12.svg" alt="12" class="age-rating">`;
        case "15":
            return `<img src="/imgs/BBFC_15.svg" alt="15" class="age-rating">`;
        case "18":
            return `<img src="/imgs/BBFC_18.svg" alt="18" class="age-rating">`;
    }
}

export const closeCinemaFilmDetails = (e) => {
    // remove bg overlay
    const list = document.getElementById(UISelectors.cinemaFilms.cinemaFilmsList)
    list.classList.remove("film-details-open");

    // scroll enabled
    document.querySelector("body").style.overflow = "auto";

    // remove modal layout
    e.target.closest("li").classList.remove("cinema-film-details");

    // change card type
    e.target.closest(".card"). classList.remove("flex-row");
    e.target.closest(".card-body").classList = "card-img-overlay";

    // remove added film details
    e.target.closest(".card-img-overlay").firstElementChild.nextElementSibling.remove();
}

export const closeSearches = () => {
    const filmSearch = document.getElementById(UISelectors.filmSearch.filmSearch);
    const cinemaFilms = document.getElementById(UISelectors.cinemaFilms.cinemaFilms);
    const watchlist = document.getElementById(UISelectors.watchlist.watchlist);

    filmSearch.classList.replace("d-flex", "d-none");
    cinemaFilms.classList.replace("d-block", "d-none");
    watchlist.classList.remove("list-aside", "cinema-open");
}

export const checkEmptyTable = () => {
    const tbody = document.querySelector("tbody");
    const thead = document.querySelector("thead");

    if(!tbody.hasChildNodes()){
        thead.classList.add("table-empty");
    } else {
        thead.classList.remove("table-empty");
    }
}

export const createDropdownMenu = results => {
    let dropdown = document.getElementById(UISelectors.filmSearch.dropdown);
    dropdown.innerHTML = "";
    let ul = document.createElement("ul");
    ul.classList = "list-unstyled m-0";
    results.forEach(film => {
        const li = document.createElement("li");
        li.classList = "dropdown-item p-2";
        li.innerText = film.title;
        li.addEventListener("click", function(){
            App.filmSearchDropdownClick(film);
        });
        ul.appendChild(li);
    })
    dropdown.appendChild(ul);
}

export const showAlert = (alertType, alertHTML) => {
    const header = document.querySelector("header");
    const alert = document.createElement("div");
    alert.classList = `container alert ${alertType} p-2 text-center`;
    alert.innerHTML = alertHTML;
    header.insertAdjacentElement("afterend", alert);
    setTimeout(function(){
        alert.remove();
    }, 3000);
};