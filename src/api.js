const apiKey = "8ed514450ca5d54b5bc425d6d68cc9f8";

export async function getMovieData(title) {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${title}`);
    const data = await res.json();
    return data.results;
}

export async function getMovieLocation(movie) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=${apiKey}`);
    const data = await res.json();
    return data;
}

export async function getCinemaFilms() {
    const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&region=GB`);
    const data = await res.json();
    return data;
}

export async function getGenreIDs(){
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-GB`);
    const data = await res.json();
    return data;
}

export async function getFilmCertification(film) {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${film.id}/release_dates?api_key=${apiKey}`);
    const data = await res.json();
    return data;
}