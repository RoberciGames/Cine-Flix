import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// A sua configuração REAL do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAfPWvnGdvPKZ_lrVwOuag14WHLY9AgML8",
  authDomain: "cinenet-ifpb.firebaseapp.com",
  databaseURL: "https://cinenet-ifpb-default-rtdb.firebaseio.com",
  projectId: "cinenet-ifpb",
  storageBucket: "cinenet-ifpb.firebasestorage.app",
  messagingSenderId: "1098247355110",
  appId: "1:1098247355110:web:c9f867826f26b0ef171927"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const isLoginPage = window.location.pathname.includes("login.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/");

// Bloqueio de Telas (Redirecionamento automático)
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (isLoginPage) window.location.href = "index.html";
    } else {
        if (!isLoginPage) window.location.href = "login.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    
    const authForm = document.getElementById("auth-form");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const toggleModeBtn = document.getElementById("toggle-mode");
    const modeText = document.getElementById("mode-text");
    
    // Variável que diz se estamos na tela de Login ou de Registro
    let isLoginMode = true; 

    // Alterna o visual do formulário entre "Entrar" e "Criar Conta"
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode; // Inverte o modo

            if (isLoginMode) {
                formTitle.innerText = "Entrar";
                submitBtn.innerText = "Entrar";
                modeText.innerText = "Novo por aqui?";
                toggleModeBtn.innerText = "Assine agora.";
            } else {
                formTitle.innerText = "Criar Conta";
                submitBtn.innerText = "Registrar";
                modeText.innerText = "Já tem uma conta?";
                toggleModeBtn.innerText = "Entre agora.";
            }
        });
    }

    // Processa o envio do formulário (Login ou Registro)
    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            try {
                submitBtn.innerText = "Processando...";
                submitBtn.disabled = true;

                if (isLoginMode) {
                    // Tenta fazer o Login
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    // Tenta Criar a Conta
                    await createUserWithEmailAndPassword(auth, email, password);
                    alert("Conta criada com sucesso! Bem-vindo ao Cine Flix.");
                }
                
                window.location.href = "index.html";

            } catch (error) {
                console.error("Erro na autenticação:", error);
                
                // Tratamento de erros em português
                if (error.code === 'auth/email-already-in-use') {
                    alert("Este e-mail já tem uma conta! Clique em 'Entre agora'.");
                } else if (error.code === 'auth/weak-password') {
                    alert("A senha é muito fraca. Escolha uma com pelo menos 6 caracteres.");
                } else if (error.code === 'auth/invalid-credential') {
                    alert("E-mail ou senha incorretos! Verifique e tente novamente.");
                } else if (error.code === 'auth/operation-not-allowed') {
                    alert("O login por E-mail e Senha não está ativado no painel do Firebase!");
                } else {
                    alert("Ocorreu um erro: " + error.message);
                }

                // Restaura o botão caso dê erro
                submitBtn.innerText = isLoginMode ? "Entrar" : "Registrar";
                submitBtn.disabled = false;
            }
        });
    }

    // Sistema de Sair (Logout)
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Erro ao sair da conta:", error);
            }
        });
    }
});