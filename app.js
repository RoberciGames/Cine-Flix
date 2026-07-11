const API_KEY = 'f2282baff5e51d3234ab949a7d725bcc'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

const requests = {
    fetchOriginals: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&language=pt-PT`,
    fetchTrending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=pt-PT`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=pt-PT`,
    fetchAnime: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&language=pt-PT`,
    searchMulti: `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-PT&query=`
};

// ==========================================
// SEGURANÇA E SESSÃO (CONECTADO AO LOGIN/REGISTO)
// ==========================================
function checkLogin() {
    if (localStorage.getItem("logado") !== "true") {
        window.location.href = "login.html"; 
    }
}
checkLogin();

function logout() {
    localStorage.removeItem("logado");
    window.location.href = "login.html";
}

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

        const resAnime = await fetch(requests.fetchAnime);
        const dataAnime = await resAnime.json();
        renderMovies(dataAnime.results, "anime-row", false, "tv");

        // Carrega as listas de IDs embutidas abaixo
        await loadCustomLists();
    } catch (error) {
        console.error("Erro ao carregar o Cine Flix:", error);
    }
}

// ==========================================
// PROCESSAMENTO DOS IDs DIRETOS DO APP.JS
// ==========================================
async function loadCustomLists() {
    try {
        // 🚨 COLOQUE A SUA LISTA COMPLETA DE IDs DE FILMES AQUI DENTRO
        const movieIds = [
            1500890, 1484913, 1308767, 1722713, 1173019, 60489, 241004, 
            1252157, 1183340, 1272300, 1338458, 1418441, 1701720, 1442023
        ];

        // 🚨 COLOQUE A SUA LISTA COMPLETA DE IDs DE SÉRIES AQUI DENTRO
        const seriesIds = [
            307585, 283657, 290232, 228177, 302824, 9262, 308403, 
            312849, 287075, 285993, 324335, 130385, 128497, 224108
        ];

        // Mapeia e renderiza os Filmes Exclusivos (Limitado a 30 por performance)
        const moviePromises = movieIds.slice(0, 30).map(id => 
            fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pt-PT`).then(res => res.json())
        );
        const customMovies = await Promise.all(moviePromises);
        renderMovies(customMovies.filter(m => !m.status_code), "my-movies-row", false, "movie");

        // Mapeia e renderiza as Séries Exclusivas (Limitado a 30 por performance)
        const seriesPromises = seriesIds.slice(0, 30).map(id => 
            fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=pt-PT`).then(res => res.json())
        );
        const customSeries = await Promise.all(seriesPromises);
        renderMovies(customSeries.filter(s => !s.status_code), "my-series-row", false, "tv");
        
    } catch (error) {
        console.error("Erro ao carregar as listas internas:", error);
    }
}

function setupBanner(movie, type) {
    const banner = document.getElementById("banner");
    const title = document.getElementById("banner-title");
    const desc = document.getElementById("banner-desc");
    if (banner && movie) {
        banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.1), rgba(15,15,15,1)), url(${IMG_URL}${movie.backdrop_path || movie.poster_path})`;
        title.innerText = movie.name || movie.title || movie.original_name;
        const overview = movie.overview || "Sinopse não disponível.";
        desc.innerText = overview.length > 160 ? overview.substring(0, 160) + "..." : overview;
        
        document.querySelector(".banner-btn.play").onclick = () => openPlayer(movie.id, type);
    }
}

function renderMovies(movies, containerId, isLarge, defaultType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const parent = container.parentElement;
    if (parent && !parent.querySelector('.slider-arrow') && containerId !== "search-row") {
        const leftArrow = document.createElement('button');
        leftArrow.className = 'slider-arrow left'; leftArrow.innerHTML = '&#10094;';
        leftArrow.onclick = () => container.scrollBy({ left: -window.innerWidth / 2, behavior: 'smooth' });

        const rightArrow = document.createElement('button');
        rightArrow.className = 'slider-arrow right'; rightArrow.innerHTML = '&#10095;';
        rightArrow.onclick = () => container.scrollBy({ left: window.innerWidth / 2, behavior: 'smooth' });

        parent.insertBefore(leftArrow, container); parent.appendChild(rightArrow);
    }

    container.innerHTML = ""; // Limpa antes de injetar para evitar duplicações
    movies.forEach(movie => {
        if (movie.poster_path) {
            const img = document.createElement("img");
            img.src = `${IMG_URL}${movie.poster_path}`;
            img.classList.add("poster");
            if (isLarge) img.classList.add("poster-large");
            
            img.addEventListener("click", () => openPlayer(movie.id, movie.media_type || defaultType));
            container.appendChild(img);
        }
    });
}

// ==========================================
// PLAYER ULTRA LIMPO E SEM REMAPEAMENTO DE ROTAS
// ==========================================
function openPlayer(id, type) {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    
    // Rota direta usando apenas o ID
    let embedUrl = (type === "tv" || type === "anime") 
        ? `https://mgeb.top/api/series/${id}/1/1` 
        : `https://mgeb.top/api/movie/${id}`;

    if (!document.getElementById("netflix-loader-style")) {
        const style = document.createElement("style"); style.id = "netflix-loader-style";
        style.innerHTML = `@keyframes spinLoader { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
    }

    container.innerHTML = `
        <div id="netflix-loader" style="position: absolute; top:0; left:0; width:100%; height:100%; background:#000; display:flex; justify-content:center; align-items:center; z-index:10; transition:opacity 0.5s;">
            <div style="width:60px; height:60px; border:4px solid rgba(229,9,20,0.2); border-top-color:#e50914; border-radius:50%; animation:spinLoader 1s linear infinite;"></div>
        </div>
        <iframe id="video-iframe" src="${embedUrl}" width="100%" height="100%" frameborder="0" allowfullscreen style="opacity:0; transition:opacity 0.5s;"></iframe>
    `;

    modal.classList.replace("modal-hidden", "modal-visible");
    const iframe = document.getElementById("video-iframe");
    const loader = document.getElementById("netflix-loader");
    iframe.onload = () => { setTimeout(() => { if(loader){loader.style.opacity="0"; iframe.style.opacity="1"; setTimeout(()=>loader.style.display="none",500);}}, 800); };
}

document.getElementById("close-modal")?.addEventListener("click", () => {
    document.getElementById("video-modal").classList.replace("modal-visible", "modal-hidden");
    document.getElementById("iframe-container").innerHTML = "";
});

// Sistema de Pesquisa
document.getElementById("search-input")?.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
        document.getElementById("main-content").style.display = "none";
        document.getElementById("banner").style.display = "none";
        document.getElementById("search-container").style.display = "block";
        const res = await fetch(`${requests.searchMulti}${encodeURIComponent(query)}`);
        const data = await res.json();
        renderMovies(data.results, "search-row", true, "movie");
    } else {
        document.getElementById("main-content").style.display = "block";
        document.getElementById("banner").style.display = "flex";
        document.getElementById("search-container").style.display = "none";
    }
});

document.addEventListener("DOMContentLoaded", loadContent);