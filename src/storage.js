export const getWatchlistFromLocalStorage = () => {
    let watchlist;        

    if(localStorage.getItem("watchlist") === null){
        watchlist = [];
    } else {
        watchlist = JSON.parse(localStorage.getItem("watchlist"));;
    }
    return watchlist;
}

export const addFilmToLocalStorage = (film) => {
    let watchlist = getWatchlistFromLocalStorage();
    watchlist.push(film);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

export const deleteFilmFromLocalStorage = e => {
    // get watchlist from local strg
    let watchlist = getWatchlistFromLocalStorage();
    // get film title from ui and remove year
    let title = e.target.closest("tr").firstElementChild.nextElementSibling.innerText;
    title = title.replace(/\ \(([^)]+)\)/, "");
    
    // get film index
    const filmIndex = watchlist.findIndex(film => {
        return film.title === title;
    });
    
    // remove film from arr
    watchlist.splice(filmIndex, 1);

    // add watchlist arr to local strg
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

export const watchlistCheckDuplicate = film => {
    let watchlist = getWatchlistFromLocalStorage();
    let films = watchlist.map(film => {
        return film.title;
    })

    return films.includes(film.title);
}