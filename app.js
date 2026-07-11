const API_KEY = 'f2282baff5e51d3234ab949a7d725bcc'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const requests = {
    fetchOriginals: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&language=pt-BR`,
    fetchTrending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=pt-BR`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=pt-BR`,
    fetchAnime: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&language=pt-BR`,
    searchMulti: `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=`
};

// Efeito de desfoque na barra de navegação
window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (nav) {
        if (window.scrollY > 50) nav.classList.add("black");
        else nav.classList.remove("black");
    }
});

async function loadContent() {
    try {
        const resOriginals = await fetch(requests.fetchOriginals);
        const dataOriginals = await resOriginals.json();
        const originals = dataOriginals.results;
        
        if(originals && originals.length > 0) {
            const randomMovie = originals[Math.floor(Math.random() * originals.length)];
            setupBanner(randomMovie, 'tv'); 
            renderMovies(originals, "originals-row", true, "tv");
        }

        const resTrending = await fetch(requests.fetchTrending);
        const dataTrending = await resTrending.json();
        renderMovies(dataTrending.results, "trending-row", false, "movie");

        const resAction = await fetch(requests.fetchActionMovies);
        const dataAction = await resAction.json();
        renderMovies(dataAction.results, "action-row", false, "movie");

        const resAnime = await fetch(requests.fetchAnime);
        const dataAnime = await resAnime.json();
        renderMovies(dataAnime.results, "anime-row", false, "tv");

    } catch (error) {
        console.error("Erro ao carregar os dados do TMDB:", error);
    }
}

function setupBanner(movie, type) {
    const banner = document.getElementById("banner");
    const title = document.getElementById("banner-title");
    const desc = document.getElementById("banner-desc");
    const playBtn = document.querySelector(".banner-btn.play");
    const infoBtn = document.querySelector(".banner-btn.info");

    if (banner && movie) {
        banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(15,15,15,1)), url(${IMG_URL}${movie.backdrop_path || movie.poster_path})`;
        title.innerText = movie.name || movie.title || movie.original_name;
        
        const overview = movie.overview ? movie.overview : "Sinopse não disponível para este título.";
        desc.innerText = overview.length > 160 ? overview.substring(0, 160) + "..." : overview;

        if (playBtn) playBtn.onclick = () => openPlayer(movie.id, type);
        if (infoBtn) infoBtn.onclick = () => openPlayer(movie.id, type);
    }
}

function renderMovies(movies, containerId, isLarge, defaultType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (containerId === "search-row") container.innerHTML = ""; 

    movies.forEach(movie => {
        if (movie.poster_path && movie.media_type !== "person") {
            const img = document.createElement("img");
            img.src = `${IMG_URL}${movie.poster_path}`; 
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

// SISTEMA DE PLAYER ATUALIZADO (Rotas /api/movie e /api/series)
function openPlayer(id, type) {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    
    let embedUrl = "";

    // Se for Série ou Anime, usa a rota /api/series/ com traços
    if (type === "tv" || type === "anime") {
        const season = 1;  
        const episode = 1; 
        embedUrl = `https://mgeb.top/api/series/${id}-${season}-${episode}`;
    } else {
        // Se for Filme, usa a rota /api/movie/
        embedUrl = `https://mgeb.top/api/movie/${id}`;
    }

    // Cria o iframe do novo player
    container.innerHTML = `
        <iframe 
            src="${embedUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allowfullscreen 
            loading="lazy">
        </iframe>`;
    
    if (modal) {
        modal.classList.remove("modal-hidden");
        modal.classList.add("modal-visible");
    }
}

// Fecha o modal e destrói o iframe para parar o vídeo
document.getElementById("close-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    if (modal) {
        modal.classList.remove("modal-visible");
        modal.classList.add("modal-hidden");
    }
    if (container) container.innerHTML = ""; 
});

// Sistema de Busca
const searchInput = document.getElementById("search-input");
const mainContent = document.getElementById("main-content");
const searchContainer = document.getElementById("search-container");
const banner = document.getElementById("banner");

if (searchInput) {
    searchInput.addEventListener("input", async (e) => {
        const query = e.target.value.trim();

        if (query.length > 2) {
            if (mainContent) mainContent.style.display = "none";
            if (banner) banner.style.display = "none";
            if (searchContainer) searchContainer.style.display = "block";

            try {
                const resSearch = await fetch(`${requests.searchMulti}${encodeURIComponent(query)}`);
                const dataSearch = await resSearch.json();
                renderMovies(dataSearch.results, "search-row", true, "movie");
            } catch (error) {
                console.error("Erro na busca:", error);
            }
        } else {
            if (mainContent) mainContent.style.display = "block";
            if (banner) banner.style.display = "flex";
            if (searchContainer) searchContainer.style.display = "none";
            const searchRow = document.getElementById("search-row");
            if (searchRow) searchRow.innerHTML = "";
        }
    });
}

document.addEventListener("DOMContentLoaded", loadContent);