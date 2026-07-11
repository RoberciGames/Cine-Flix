const API_KEY = 'f2282baff5e1d3234ab9494a7d725bcc'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

// 🔴 NOVO: Link fetchAnime adicionado (Procura animações em japonês no TMDB)
const requests = {
    fetchOriginals: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&language=pt-BR`,
    fetchTrending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=pt-BR`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=pt-BR`,
    fetchAnime: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&language=pt-BR`
};

window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (nav) {
        if (window.scrollY > 100) nav.classList.add("black");
        else nav.classList.remove("black");
    }
});

async function loadContent() {
    try {
        const resOriginals = await fetch(requests.fetchOriginals);
        const dataOriginals = await resOriginals.json();
        const originals = dataOriginals.results;
        
        const randomMovie = originals[Math.floor(Math.random() * originals.length)];
        setupBanner(randomMovie, 'tv'); 
        
        renderMovies(originals, "originals-row", true, "tv");

        const resTrending = await fetch(requests.fetchTrending);
        const dataTrending = await resTrending.json();
        renderMovies(dataTrending.results, "trending-row", false, "movie");

        const resAction = await fetch(requests.fetchActionMovies);
        const dataAction = await resAction.json();
        renderMovies(dataAction.results, "action-row", false, "movie");

        // 🔴 NOVO: Carrega e renderiza a fileira de Animes
        const resAnime = await fetch(requests.fetchAnime);
        const dataAnime = await resAnime.json();
        renderMovies(dataAnime.results, "anime-row", false, "anime"); // Passa o tipo como 'anime'

    } catch (error) {
        console.error("Erro na comunicação com a API do TMDB:", error);
    }
}

function setupBanner(movie, type) {
    const banner = document.getElementById("banner");
    const title = document.getElementById("banner-title");
    const desc = document.getElementById("banner-desc");
    const playBtn = document.querySelector(".banner-btn.play");

    if (banner && movie) {
        banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(17,17,17,1)), url(${IMG_URL}${movie.backdrop_path})`;
        title.innerText = movie.name || movie.title || movie.original_name;
        
        const overview = movie.overview ? movie.overview : "Nenhuma sinopse disponível em português.";
        desc.innerText = overview.length > 180 ? overview.substring(0, 180) + "..." : overview;

        playBtn.onclick = () => openPlayer(movie.id, type);
    }
}

function renderMovies(movies, containerId, isLarge, defaultType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    movies.forEach(movie => {
        if (movie.poster_path && movie.backdrop_path) {
            const img = document.createElement("img");
            img.src = `${IMG_URL}${isLarge ? movie.poster_path : movie.backdrop_path}`;
            img.classList.add("poster");
            if (isLarge) img.classList.add("poster-large");
            
            img.alt = movie.name || movie.title;
            
            img.addEventListener("click", () => {
                const type = movie.media_type || defaultType; 
                openPlayer(movie.id, type);
            });

            container.appendChild(img);
        }
    });
}

// 🔴 NOVO: Função do Player inteligente (Sabe separar Filme, Série e Anime)
function openPlayer(id, type) {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    
    // Lógica para decidir qual a pasta correta no site embedmovies.org
    let embedType = 'filmes'; // Padrão
    if (type === 'tv' || type === 'serie') {
        embedType = 'series';
    } else if (type === 'anime') {
        embedType = 'animes';
    }
    
    const embedUrl = `https://embedmovies.org/${embedType}/${id}`;

    container.innerHTML = `
        <iframe 
            src="${embedUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allowfullscreen 
            loading="lazy">
        </iframe>`;
    
    modal.classList.remove("modal-hidden");
    modal.classList.add("modal-visible");
}

document.getElementById("close-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    
    modal.classList.remove("modal-visible");
    modal.classList.add("modal-hidden");
    container.innerHTML = ""; 
});

document.addEventListener("DOMContentLoaded", loadContent);