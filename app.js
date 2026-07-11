const API_KEY = 'f2282baff5e1d3234ab9494a7d725bcc'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

// Categorias coletadas do TMDB
const requests = {
    fetchOriginals: `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&language=pt-BR`,
    fetchTrending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=pt-BR`,
    fetchActionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=pt-BR`
};

// Deixa a barra de navegação escura ao rolar a página para baixo
window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (nav) {
        if (window.scrollY > 100) {
            nav.classList.add("black");
        } else {
            nav.classList.remove("black");
        }
    }
});

// Busca as informações na API e distribui nos seus devidos lugares HTML
async function loadContent() {
    try {
        // 1. Carrega os Originais para o Banner e Primeira Fila
        const resOriginals = await fetch(requests.fetchOriginals);
        const dataOriginals = await resOriginals.json();
        const originals = dataOriginals.results;
        
        // Define o banner principal com um filme aleatório da lista
        const randomMovie = originals[Math.floor(Math.random() * originals.length)];
        setupBanner(randomMovie);
        
        // Renderiza a fileira de originais (Posters verticais grandes)
        renderMovies(originals, "originals-row", true);

        // 2. Carrega a fileira de Populares
        const resTrending = await fetch(requests.fetchTrending);
        const dataTrending = await resTrending.json();
        renderMovies(dataTrending.results, "trending-row", false);

        // 3. Carrega a fileira de Filmes de Ação
        const resAction = await fetch(requests.fetchActionMovies);
        const dataAction = await resAction.json();
        renderMovies(dataAction.results, "action-row", false);

    } catch (error) {
        console.error("Erro na comunicação com a API do TMDB:", error);
    }
}

// Configura os textos e imagens de fundo no banner principal do topo
function setupBanner(movie) {
    const banner = document.getElementById("banner");
    const title = document.getElementById("banner-title");
    const desc = document.getElementById("banner-desc");

    if (banner && movie) {
        banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(17,17,17,1)), url(${IMG_URL}${movie.backdrop_path})`;
        title.innerText = movie.name || movie.title || movie.original_name;
        
        const overview = movie.overview ? movie.overview : "Nenhuma sinopse disponível em português.";
        desc.innerText = overview.length > 180 ? overview.substring(0, 180) + "..." : overview;
    }
}

// Cria as tags de imagem dinamicamente dentro das fileiras do HTML
function renderMovies(movies, containerId, isLarge) {
    const container = document.getElementById(containerId);
    if (!container) return;

    movies.forEach(movie => {
        if (movie.poster_path && movie.backdrop_path) {
            const img = document.createElement("img");
            img.src = `${IMG_URL}${isLarge ? movie.poster_path : movie.backdrop_path}`;
            img.classList.add("poster");
            if (isLarge) img.classList.add("poster-large");
            
            img.alt = movie.name || movie.title;
            container.appendChild(img);
        }
    });
}

document.addEventListener("DOMContentLoaded", loadContent);