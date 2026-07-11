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

// Efeito na barra de navegação ao rolar
window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (nav) {
        if (window.scrollY > 50) nav.classList.add("black");
        else nav.classList.remove("black");
    }
});

async function loadContent() {
    try {
        // Carrega Filmes Oficiais do TMDB
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

        // Carrega os seus Catálogos Personalizados
        await loadCustomLists();

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}

// Leitura dos seus ficheiros JSON locais
async function loadCustomLists() {
    try {
        const resMovies = await fetch('./movie.json');
        const movieIds = await resMovies.json();

        const resSeries = await fetch('./series.json');
        const seriesIds = await resSeries.json();

        // Limita a 20 títulos para não sobrecarregar
        const topMovieIds = movieIds.slice(0, 20);
        const topSeriesIds = seriesIds.slice(0, 20);

        const moviePromises = topMovieIds.map(id => 
            fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=pt-PT`).then(res => res.json())
        );
        const customMovies = await Promise.all(moviePromises);
        
        const validMovies = customMovies.filter(m => !m.status_code);
        renderMovies(validMovies, "my-movies-row", false, "movie");

        const seriesPromises = topSeriesIds.map(id => 
            fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=pt-PT`).then(res => res.json())
        );
        const customSeries = await Promise.all(seriesPromises);

        const validSeries = customSeries.filter(s => !s.status_code);
        renderMovies(validSeries, "my-series-row", false, "tv");

    } catch (error) {
        console.error("Erro ao carregar os JSONs personalizados (Verifique se estão na mesma pasta do index.html):", error);
    }
}

// Configura o Banner Principal
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

// Renderiza os Pôsteres e adiciona o Carrossel
function renderMovies(movies, containerId, isLarge, defaultType) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (containerId === "search-row") container.innerHTML = ""; 

    // Adiciona as setas do Carrossel (Se não for a área de pesquisa)
    const parent = container.parentElement;
    if (parent && !parent.querySelector('.slider-arrow') && containerId !== "search-row") {
        const leftArrow = document.createElement('button');
        leftArrow.className = 'slider-arrow left';
        leftArrow.innerHTML = '&#10094;'; // Ícone seta esquerda
        leftArrow.onclick = () => {
            container.scrollBy({ left: -window.innerWidth / 2, behavior: 'smooth' });
        };

        const rightArrow = document.createElement('button');
        rightArrow.className = 'slider-arrow right';
        rightArrow.innerHTML = '&#10095;'; // Ícone seta direita
        rightArrow.onclick = () => {
            container.scrollBy({ left: window.innerWidth / 2, behavior: 'smooth' });
        };

        parent.insertBefore(leftArrow, container);
        parent.appendChild(rightArrow);
    }

    // Injeta os filmes
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

// Leitor de Vídeo: MGEB API + Tela de Carregamento Netflix
function openPlayer(id, type) {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    
    let embedUrl = "";

    // Separação Inteligente: Filmes vs Séries/Animes
    if (type === "tv" || type === "anime") {
        const season = 1;  
        const episode = 1; 
        embedUrl = `https://mgeb.top/api/series/${id}-${season}-${episode}`;
    } else {
        embedUrl = `https://mgeb.top/api/movie/${id}`;
    }

    // Animação de Carregamento
    if (!document.getElementById("netflix-loader-style")) {
        const style = document.createElement("style");
        style.id = "netflix-loader-style";
        style.innerHTML = `
            @keyframes spinLoader {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    container.innerHTML = `
        <div id="netflix-loader" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; display: flex; justify-content: center; align-items: center; z-index: 10; transition: opacity 0.5s ease;">
            <div style="width: 60px; height: 60px; border: 4px solid rgba(229, 9, 20, 0.2); border-top-color: #e50914; border-radius: 50%; animation: spinLoader 1s linear infinite;"></div>
        </div>
        <iframe 
            id="video-iframe"
            src="${embedUrl}" 
            width="100%" 
            height="100%" 
            frameborder="0" 
            allowfullscreen 
            loading="lazy"
            style="opacity: 0; transition: opacity 0.5s ease;">
        </iframe>
    `;
    
    if (modal) {
        modal.classList.remove("modal-hidden");
        modal.classList.add("modal-visible");
    }

    const iframe = document.getElementById("video-iframe");
    const loader = document.getElementById("netflix-loader");

    // Efeito suave de transição ao terminar de carregar o vídeo
    iframe.onload = () => {
        setTimeout(() => {
            if (loader) loader.style.opacity = "0"; 
            if (iframe) iframe.style.opacity = "1"; 
            
            setTimeout(() => {
                if (loader) loader.style.display = "none";
            }, 500);
        }, 800); // 800ms de delay dramático
    };
}

// Fechar o Leitor
document.getElementById("close-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("video-modal");
    const container = document.getElementById("iframe-container");
    if (modal) {
        modal.classList.remove("modal-visible");
        modal.classList.add("modal-hidden");
    }
    if (container) container.innerHTML = ""; // Destrói o iframe para parar o vídeo
});

// Sistema de Pesquisa
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
                console.error("Erro na pesquisa:", error);
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

// Inicializa o site
document.addEventListener("DOMContentLoaded", loadContent);