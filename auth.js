import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Suas credenciais do Firebase aplicadas corretamente
const firebaseConfig = {
  apiKey: "AIzaSyAfPWvnGdvPKZ_lrVwOuag14WHLY9AgML8",
  authDomain: "cinenet-ifpb.firebaseapp.com",
  databaseURL: "https://cinenet-ifpb-default-rtdb.firebaseio.com",
  projectId: "cinenet-ifpb",
  storageBucket: "cinenet-ifpb.firebasestorage.app",
  messagingSenderId: "1098247355110",
  appId: "1:1098247355110:web:c9f867826f26b0ef171927"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Segurança de Rotas: Monitora se o usuário está logado ou deslogado
onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.includes("login.html");
    
    if (!user && !isLoginPage) {
        // Se NÃO está logado e NÃO está na página de login, vai para o login
        window.location.href = "login.html"; 
    } else if (user && isLoginPage) {
        // Se JÁ está logado e tenta acessar o login, vai direto para o streaming
        window.location.href = "index.html"; 
    }
});

// Lógica de Alternância entre Login e Cadastro + Envio do Formulário
const loginForm = document.getElementById("login-form");
if (loginForm) {
    let isRegistering = false; // Estado inicial é modo Login
    const authTitle = document.getElementById("auth-title");
    const submitBtn = document.getElementById("btn-submit");
    const switchBtn = document.getElementById("go-to-register");

    // Troca os textos na tela ao clicar em "Assine agora" ou "Entre aqui"
    switchBtn.addEventListener("click", () => {
        isRegistering = !isRegistering;
        authTitle.innerText = isRegistering ? "Cadastrar" : "Entrar";
        submitBtn.innerText = isRegistering ? "Cadastrar" : "Entrar";
        switchBtn.innerHTML = isRegistering ? "Já tem conta? <span>Entre aqui.</span>" : "Novo por aqui? <span>Assine agora.</span>";
    });

    // Evento de envio do formulário
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (isRegistering) {
            // Executa o sistema de CRIAR CONTA (Cadastro)
            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    window.location.href = "index.html";
                })
                .catch(err => alert("Erro ao criar conta: " + err.message));
        } else {
            // Executa o sistema de LOGAR na conta existente
            signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                    window.location.href = "index.html";
                })
                .catch(err => alert("Erro ao entrar: " + err.message));
        }
    });
}

// Botão de Deslogar (Sair) na Navbar do Streaming
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    });
}