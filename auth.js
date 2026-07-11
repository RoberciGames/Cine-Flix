import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// ⚠️ IMPORTANTE: Substitua os dados abaixo pelas credenciais do SEU Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAs-SUA-API-KEY-AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Identifica em qual página o usuário está atualmente
const isLoginPage = window.location.pathname.includes("login.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/");

// Monitora o status do usuário (Logado ou Deslogado)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Se estiver logado e tentar acessar a página de login, vai para o início
        if (isLoginPage) {
            window.location.href = "index.html";
        }
    } else {
        // Se NÃO estiver logado e tentar ver os filmes, é chutado para o login
        if (!isLoginPage) {
            window.location.href = "login.html";
        }
    }
});

// Executa a lógica assim que o HTML carregar
document.addEventListener("DOMContentLoaded", () => {
    
    // Configura o formulário da página de Login
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const submitBtn = loginForm.querySelector(".btn-login");

            try {
                submitBtn.innerText = "Carregando...";
                submitBtn.disabled = true;

                // Faz a autenticação real no Firebase
                await signInWithEmailAndPassword(auth, email, password);
                
                // Redireciona para o catálogo
                window.location.href = "index.html";
            } catch (error) {
                console.error("Erro ao fazer login:", error);
                alert("E-mail ou senha incorretos! Verifique os dados e tente novamente.");
                submitBtn.innerText = "Entrar";
                submitBtn.disabled = false;
            }
        });
    }

    // Configura o botão de Sair da página do Catálogo
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Erro ao deslogar:", error);
            }
        });
    }
});